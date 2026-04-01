import { useState, useEffect, useCallback } from "react";
import { db } from "@/integrations/supabase/db";
import { useToast } from "@/hooks/use-toast";

export type PurchaseOrderStatus =
  | "rascunho"
  | "enviado"
  | "confirmado"
  | "em_transito"
  | "recebido_parcial"
  | "recebido"
  | "cancelado";

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
  products?: {
    id: string;
    name: string;
    sku: string | null;
    stock_quantity: number;
    cost_price: number | null;
    category: string | null;
  } | null;
}

export interface PurchaseOrder {
  id: string;
  order_number: string | null;
  supplier_id: string | null;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_date: string | null;
  received_date: string | null;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  operator: string | null;
  created_at: string;
  updated_at: string;
  legal_persons?: { trade_name: string | null; company_name: string | null } | null;
  purchase_order_items?: PurchaseOrderItem[];
}

export interface CreateOrderInput {
  supplier_id?: string;
  order_date?: string;
  expected_date?: string;
  notes?: string;
  operator?: string;
  items: {
    product_id: string;
    quantity_ordered: number;
    unit_cost: number;
  }[];
}

export function purchaseOrderStatusLabel(status: PurchaseOrderStatus): string {
  const map: Record<PurchaseOrderStatus, string> = {
    rascunho: "Rascunho",
    enviado: "Enviado",
    confirmado: "Confirmado",
    em_transito: "Em Trânsito",
    recebido_parcial: "Parcial",
    recebido: "Recebido",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
}

export function purchaseOrderStatusColor(status: PurchaseOrderStatus): string {
  const map: Record<PurchaseOrderStatus, string> = {
    rascunho: "bg-gray-100 text-gray-700",
    enviado: "bg-blue-100 text-blue-700",
    confirmado: "bg-indigo-100 text-indigo-700",
    em_transito: "bg-yellow-100 text-yellow-700",
    recebido_parcial: "bg-orange-100 text-orange-700",
    recebido: "bg-green-100 text-green-700",
    cancelado: "bg-red-100 text-red-700",
  };
  return map[status] ?? "";
}

export function usePurchaseOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from("purchase_orders")
        .select(
          `
          *,
          legal_persons(trade_name, company_name),
          purchase_order_items(
            *,
            products(id, name, sku, stock_quantity, cost_price, category)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data ?? []);
    } catch (e) {
      console.error("usePurchaseOrders.load:", e);
      toast({ title: "Erro ao carregar pedidos de compra", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<PurchaseOrder | null> => {
      try {
        const subtotal = input.items.reduce(
          (acc, i) => acc + i.quantity_ordered * i.unit_cost,
          0
        );

        const { data: order, error: orderErr } = await db
          .from("purchase_orders")
          .insert({
            supplier_id: input.supplier_id ?? null,
            order_date: input.order_date ?? new Date().toISOString().slice(0, 10),
            expected_date: input.expected_date ?? null,
            notes: input.notes ?? null,
            operator: input.operator ?? null,
            subtotal,
            total: subtotal,
          })
          .select()
          .single();

        if (orderErr) throw orderErr;

        const items = input.items.map((i) => ({
          purchase_order_id: order.id,
          product_id: i.product_id,
          quantity_ordered: i.quantity_ordered,
          quantity_received: 0,
          unit_cost: i.unit_cost,
          subtotal: i.quantity_ordered * i.unit_cost,
        }));

        const { error: itemsErr } = await db.from("purchase_order_items").insert(items);
        if (itemsErr) throw itemsErr;

        toast({ title: `Pedido ${order.order_number ?? order.id.slice(0, 8)} criado!` });
        await load();
        return order as PurchaseOrder;
      } catch (e) {
        console.error("usePurchaseOrders.createOrder:", e);
        toast({ title: "Erro ao criar pedido de compra", variant: "destructive" });
        return null;
      }
    },
    [load, toast]
  );

  const updateStatus = useCallback(
    async (orderId: string, status: PurchaseOrderStatus, receivedDate?: string): Promise<boolean> => {
      try {
        const { error } = await db
          .from("purchase_orders")
          .update({
            status,
            received_date: receivedDate ?? null,
          })
          .eq("id", orderId);

        if (error) throw error;
        await load();
        return true;
      } catch (e) {
        console.error("usePurchaseOrders.updateStatus:", e);
        toast({ title: "Erro ao atualizar status", variant: "destructive" });
        return false;
      }
    },
    [load, toast]
  );

  /**
   * Recebe itens de um pedido de compra:
   * 1. Atualiza quantity_received em cada item.
   * 2. Cria stock_movement tipo "entrada" + referência ao pedido.
   * 3. Atualiza products.stock_quantity.
   * 4. Atualiza status do pedido (recebido_parcial | recebido).
   */
  const receiveOrder = useCallback(
    async (
      order: PurchaseOrder,
      receivedQtys: Record<string, number>,
      operator?: string
    ): Promise<boolean> => {
      try {
        const items = order.purchase_order_items ?? [];

        for (const item of items) {
          const qty = receivedQtys[item.id] ?? 0;
          if (qty <= 0) continue;

          // Update purchase_order_items.quantity_received
          const newReceived = item.quantity_received + qty;
          const { error: itemErr } = await db
            .from("purchase_order_items")
            .update({ quantity_received: newReceived })
            .eq("id", item.id);
          if (itemErr) throw itemErr;

          // Get current product stock
          const { data: prod, error: prodFetchErr } = await db
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();
          if (prodFetchErr) throw prodFetchErr;

          const prevQty: number = prod?.stock_quantity ?? 0;
          const newQty = prevQty + qty;

          // Insert stock movement
          const { error: movErr } = await db.from("stock_movements").insert({
            product_id: item.product_id,
            movement_type: "entrada",
            quantity: qty,
            previous_quantity: prevQty,
            new_quantity: newQty,
            reference_type: "compra",
            reference_id: order.id,
            notes: `Recebimento pedido ${order.order_number ?? order.id.slice(0, 8)}`,
            operator: operator ?? null,
          });
          if (movErr) throw movErr;

          // Update product stock
          const { error: prodErr } = await db
            .from("products")
            .update({ stock_quantity: newQty, updated_at: new Date().toISOString() })
            .eq("id", item.product_id);
          if (prodErr) throw prodErr;
        }

        // Determine new order status
        const allItems = items.map((i) => ({
          ...i,
          quantity_received: (receivedQtys[i.id] ?? 0) + i.quantity_received,
        }));
        const allReceived = allItems.every((i) => i.quantity_received >= i.quantity_ordered);
        const anyReceived = allItems.some((i) => i.quantity_received > 0);
        const newStatus: PurchaseOrderStatus = allReceived
          ? "recebido"
          : anyReceived
          ? "recebido_parcial"
          : order.status;

        await updateStatus(order.id, newStatus, allReceived ? new Date().toISOString().slice(0, 10) : undefined);

        toast({
          title: allReceived ? "Pedido totalmente recebido!" : "Recebimento parcial registrado.",
          description: "Estoque atualizado e movimentações registradas.",
        });
        return true;
      } catch (e) {
        console.error("usePurchaseOrders.receiveOrder:", e);
        toast({ title: "Erro ao receber pedido", variant: "destructive" });
        return false;
      }
    },
    [updateStatus, toast]
  );

  const deleteOrder = useCallback(
    async (orderId: string): Promise<boolean> => {
      try {
        const { error } = await db.from("purchase_orders").delete().eq("id", orderId);
        if (error) throw error;
        await load();
        return true;
      } catch (e) {
        console.error("usePurchaseOrders.deleteOrder:", e);
        toast({ title: "Erro ao excluir pedido", variant: "destructive" });
        return false;
      }
    },
    [load, toast]
  );

  return { orders, loading, load, createOrder, updateStatus, receiveOrder, deleteOrder };
}
