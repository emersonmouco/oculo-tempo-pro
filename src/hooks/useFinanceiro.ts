import { useState, useEffect, useCallback } from "react";
import { db } from "@/integrations/supabase/db";

export interface FinanceiroResumo {
  receitaMes: number;
  despesasMes: number;
  lucroMes: number;
  vendasCount: number;
  ticketMedio: number;
  comprasCount: number;
}

export interface PaymentBreakdown {
  method: string;
  label: string;
  count: number;
  total: number;
  percent: number;
}

export interface VendaDiaria {
  dia: string;
  total: number;
  count: number;
}

export interface ContaPagarReceber {
  id: string;
  tipo: "pagar" | "receber";
  descricao: string;
  valor: number;
  vencimento: string;
  status: "pendente" | "pago" | "vencido";
  referencia?: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao_debito: "Cartão Débito",
  cartao_credito: "Cartão Crédito",
  parcelado: "Parcelado",
  boleto: "Boleto",
  duplicata: "Duplicata",
  outros: "Outros",
};

export function useFinanceiro(mes?: number, ano?: number) {
  const now = new Date();
  const selectedMes = mes ?? now.getMonth();
  const selectedAno = ano ?? now.getFullYear();

  const [resumo, setResumo] = useState<FinanceiroResumo>({
    receitaMes: 0, despesasMes: 0, lucroMes: 0,
    vendasCount: 0, ticketMedio: 0, comprasCount: 0,
  });
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([]);
  const [vendasDiarias, setVendasDiarias] = useState<VendaDiaria[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaPagarReceber[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagarReceber[]>([]);
  const [loading, setLoading] = useState(true);

  const startOfMonth = new Date(selectedAno, selectedMes, 1).toISOString();
  const endOfMonth = new Date(selectedAno, selectedMes + 1, 0, 23, 59, 59).toISOString();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Vendas do mês
      const { data: sales } = await db
        .from("sales")
        .select("id, total, payment_method, created_at, status, discount, person_id, sale_number")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      const vendas = (sales || []).filter((s: any) => s.status === "finalizada" || s.status === "completed");
      const receita = vendas.reduce((acc: number, s: any) => acc + Number(s.total), 0);

      // Compras do mês (despesas)
      const { data: purchases } = await db
        .from("purchase_orders")
        .select("id, total, status, created_at")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      const compras = (purchases || []).filter((p: any) => p.status !== "cancelado");
      const despesas = compras.reduce((acc: number, p: any) => acc + Number(p.total), 0);

      setResumo({
        receitaMes: receita,
        despesasMes: despesas,
        lucroMes: receita - despesas,
        vendasCount: vendas.length,
        ticketMedio: vendas.length > 0 ? receita / vendas.length : 0,
        comprasCount: compras.length,
      });

      // Payment breakdown
      const breakdown: Record<string, { count: number; total: number }> = {};
      vendas.forEach((s: any) => {
        const method = s.payment_method || "outros";
        if (!breakdown[method]) breakdown[method] = { count: 0, total: 0 };
        breakdown[method].count++;
        breakdown[method].total += Number(s.total);
      });

      const totalVendas = Object.values(breakdown).reduce((a, v) => a + v.total, 0);
      setPaymentBreakdown(
        Object.entries(breakdown).map(([method, data]) => ({
          method,
          label: PAYMENT_LABELS[method] || method,
          count: data.count,
          total: data.total,
          percent: totalVendas > 0 ? (data.total / totalVendas) * 100 : 0,
        })).sort((a, b) => b.total - a.total)
      );

      // Vendas diárias
      const dailyMap: Record<string, { total: number; count: number }> = {};
      vendas.forEach((s: any) => {
        const dia = new Date(s.created_at).toISOString().slice(0, 10);
        if (!dailyMap[dia]) dailyMap[dia] = { total: 0, count: 0 };
        dailyMap[dia].total += Number(s.total);
        dailyMap[dia].count++;
      });
      setVendasDiarias(
        Object.entries(dailyMap)
          .map(([dia, d]) => ({ dia, ...d }))
          .sort((a, b) => a.dia.localeCompare(b.dia))
      );

      // Contas a receber — vendas parceladas/boleto/duplicata pendentes
      const contasRec: ContaPagarReceber[] = vendas
        .filter((s: any) => ["parcelado", "boleto", "duplicata"].includes(s.payment_method))
        .map((s: any) => ({
          id: s.id,
          tipo: "receber" as const,
          descricao: `Venda ${s.sale_number || s.id.slice(0, 8)} — ${PAYMENT_LABELS[s.payment_method] || s.payment_method}`,
          valor: Number(s.total),
          vencimento: new Date(new Date(s.created_at).getTime() + 30 * 86400000).toISOString().slice(0, 10),
          status: "pendente" as const,
          referencia: s.sale_number,
        }));
      setContasReceber(contasRec);

      // Contas a pagar — pedidos de compra confirmados/recebidos
      const contasPag: ContaPagarReceber[] = compras
        .filter((p: any) => ["confirmado", "recebido", "recebido_parcial", "em_transito"].includes(p.status))
        .map((p: any) => ({
          id: p.id,
          tipo: "pagar" as const,
          descricao: `Pedido de compra ${p.id.slice(0, 8)}`,
          valor: Number(p.total),
          vencimento: new Date(new Date(p.created_at).getTime() + 30 * 86400000).toISOString().slice(0, 10),
          status: "pendente" as const,
        }));
      setContasPagar(contasPag);
    } catch (e) {
      console.error("useFinanceiro:", e);
    } finally {
      setLoading(false);
    }
  }, [startOfMonth, endOfMonth]);

  useEffect(() => { load(); }, [load]);

  return { resumo, paymentBreakdown, vendasDiarias, contasReceber, contasPagar, loading, reload: load };
}
