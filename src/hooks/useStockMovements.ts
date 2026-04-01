import { useState, useEffect, useCallback } from "react";
import { db } from "@/integrations/supabase/db";
import { useToast } from "@/hooks/use-toast";
import { isMissingRelationError, STOCK_SCHEMA_SETUP_HINT } from "@/lib/supabasePostgrest";

export type MovementType =
  | "entrada"
  | "saida"
  | "ajuste_positivo"
  | "ajuste_negativo"
  | "devolucao_cliente"
  | "devolucao_fornecedor";

export type ReferenceType = "venda" | "compra" | "ajuste" | "devolucao" | "inventario";

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_type: ReferenceType | null;
  reference_id: string | null;
  notes: string | null;
  operator: string | null;
  created_at: string;
  products?: { name: string; sku: string | null; category: string | null } | null;
}

export interface CreateMovementInput {
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  previous_quantity: number;
  reference_type?: ReferenceType;
  reference_id?: string;
  notes?: string;
  operator?: string;
}

/**
 * Calcula o novo saldo com base no tipo da movimentação.
 * Tipos que aumentam: entrada, ajuste_positivo, devolucao_cliente
 * Tipos que reduzem: saida, ajuste_negativo, devolucao_fornecedor
 */
export function calcNewQuantity(type: MovementType, prev: number, qty: number): number {
  const reduces: MovementType[] = ["saida", "ajuste_negativo", "devolucao_fornecedor"];
  return reduces.includes(type) ? prev - qty : prev + qty;
}

export function movementTypeLabel(type: MovementType): string {
  const map: Record<MovementType, string> = {
    entrada: "Entrada",
    saida: "Saída",
    ajuste_positivo: "Ajuste (+)",
    ajuste_negativo: "Ajuste (-)",
    devolucao_cliente: "Dev. Cliente",
    devolucao_fornecedor: "Dev. Fornecedor",
  };
  return map[type] ?? type;
}

export function movementTypeColor(type: MovementType): string {
  const greens: MovementType[] = ["entrada", "ajuste_positivo", "devolucao_cliente"];
  const reds: MovementType[] = ["saida", "ajuste_negativo", "devolucao_fornecedor"];
  if (greens.includes(type)) return "text-green-600";
  if (reds.includes(type)) return "text-red-500";
  return "text-muted-foreground";
}

export function useStockMovements(productId?: string) {
  const { toast } = useToast();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let query = db
        .from("stock_movements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data: rows, error: movErr } = await query;
      if (movErr) throw movErr;

      const list = rows ?? [];
      if (list.length === 0) {
        setMovements([]);
        return;
      }

      const ids = [...new Set(list.map((r) => r.product_id as string))];
      const { data: prods, error: prodErr } = await db
        .from("products")
        .select("id, name, sku, category")
        .in("id", ids);

      if (prodErr) throw prodErr;

      const productMap = new Map(
        (prods ?? []).map((p) => [
          p.id as string,
          { name: p.name as string, sku: p.sku as string | null, category: p.category as string | null },
        ])
      );

      const merged: StockMovement[] = list.map((row) => ({
        ...(row as Omit<StockMovement, "products">),
        products: productMap.get(row.product_id as string) ?? null,
      }));
      setMovements(merged);
    } catch (e) {
      console.error("useStockMovements.load:", e);
      toast({
        title: isMissingRelationError(e)
          ? "Tabela de movimentações não existe no Supabase"
          : "Erro ao carregar movimentações",
        description: isMissingRelationError(e) ? STOCK_SCHEMA_SETUP_HINT : undefined,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [productId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Registra uma movimentação de estoque de forma atômica:
   * 1. Insere o registro em stock_movements (ledger imutável).
   * 2. Atualiza products.stock_quantity com o novo saldo.
   *
   * IMPORTANTE: Em produção, isso deve ser uma transação no banco via
   * Postgres function/RPC para garantir atomicidade. Aqui usamos duas
   * operações sequenciais — adequado para o ambiente de desenvolvimento.
   */
  const createMovement = useCallback(
    async (input: CreateMovementInput): Promise<boolean> => {
      try {
        const new_quantity = calcNewQuantity(
          input.movement_type,
          input.previous_quantity,
          input.quantity
        );

        if (new_quantity < 0) {
          toast({
            title: "Estoque insuficiente",
            description: `Saldo atual: ${input.previous_quantity}. Quantidade solicitada: ${input.quantity}.`,
            variant: "destructive",
          });
          return false;
        }

        const { error: movErr } = await db.from("stock_movements").insert({
          product_id: input.product_id,
          movement_type: input.movement_type,
          quantity: input.quantity,
          previous_quantity: input.previous_quantity,
          new_quantity,
          reference_type: input.reference_type ?? null,
          reference_id: input.reference_id ?? null,
          notes: input.notes ?? null,
          operator: input.operator ?? null,
        });
        if (movErr) throw movErr;

        const { error: prodErr } = await db
          .from("products")
          .update({ stock_quantity: new_quantity, updated_at: new Date().toISOString() })
          .eq("id", input.product_id);
        if (prodErr) throw prodErr;

        await load();
        return true;
      } catch (e) {
        console.error("useStockMovements.createMovement:", e);
        toast({
          title: isMissingRelationError(e)
            ? "Tabela de movimentações não existe no Supabase"
            : "Erro ao registrar movimentação",
          description: isMissingRelationError(e) ? STOCK_SCHEMA_SETUP_HINT : undefined,
          variant: "destructive",
        });
        return false;
      }
    },
    [load, toast]
  );

  /**
   * Registra múltiplas movimentações em lote (ex.: finalização de venda).
   * Falha individualmente — todas são tentadas mesmo se uma falhar.
   */
  const createBatchMovements = useCallback(
    async (inputs: CreateMovementInput[]): Promise<boolean> => {
      const results = await Promise.all(inputs.map((i) => createMovement(i)));
      return results.every(Boolean);
    },
    [createMovement]
  );

  return { movements, loading, load, createMovement, createBatchMovements };
}
