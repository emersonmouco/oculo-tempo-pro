import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/integrations/supabase/db";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
} from "lucide-react";
import { format } from "date-fns";

const Financeiro = () => {
  const [receitaMes, setReceitaMes] = useState(0);
  const [vendasCount, setVendasCount] = useState(0);
  const [paymentBreakdown, setPaymentBreakdown] = useState<Record<string, { count: number; total: number }>>({});

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: sales } = await supabase
        .from("sales")
        .select("total, payment_method")
        .eq("status", "finalizada")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      const vendas = sales || [];
      const receita = vendas.reduce((acc, s) => acc + Number(s.total), 0);
      setReceitaMes(receita);
      setVendasCount(vendas.length);

      const breakdown: Record<string, { count: number; total: number }> = {};
      vendas.forEach((s) => {
        const method = s.payment_method || "outros";
        if (!breakdown[method]) breakdown[method] = { count: 0, total: 0 };
        breakdown[method].count++;
        breakdown[method].total += Number(s.total);
      });
      setPaymentBreakdown(breakdown);
    } catch (e) {
      console.error("Erro ao carregar dados financeiros:", e);
    }
  };

  const PAYMENT_LABELS: Record<string, string> = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao_debito: "Cartão Débito",
    cartao_credito: "Cartão Crédito",
    parcelado: "Parcelado",
    boleto: "Boleto",
  };

  const totalVendas = Object.values(paymentBreakdown).reduce((acc, v) => acc + v.total, 0);
  const getPercent = (total: number) => (totalVendas > 0 ? ((total / totalVendas) * 100).toFixed(1) : "0");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Controle financeiro e fluxo de caixa</p>
        </div>
        <Button className="erp-button-primary flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita do Mês</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {receitaMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas Realizadas</p>
                <p className="text-2xl font-bold text-primary">{vendasCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {(vendasCount > 0 ? receitaMes / vendasCount : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Período</p>
                <p className="text-lg font-bold">{format(new Date(), "MMMM yyyy")}</p>
              </div>
              <Wallet className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="formas-pagamento" className="space-y-4">
        <TabsList>
          <TabsTrigger value="formas-pagamento">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="contas">Contas a Pagar/Receber</TabsTrigger>
        </TabsList>

        <TabsContent value="formas-pagamento">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Distribuição por Forma de Pagamento - {format(new Date(), "MMMM yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(paymentBreakdown).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma venda registrada no mês.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(paymentBreakdown).map(([method, data]) => (
                    <div key={method} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <span>{PAYMENT_LABELS[method] || method}</span>
                      <div className="text-right">
                        <div className="font-bold">{getPercent(data.total)}%</div>
                        <div className="text-sm text-muted-foreground">
                          R$ {data.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({data.count} vendas)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contas">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <ArrowDownCircle className="h-5 w-5" />
                  Contas a Receber
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Módulo em desenvolvimento. Integre com títulos a receber e parcelas de vendas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <ArrowUpCircle className="h-5 w-5" />
                  Contas a Pagar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Módulo em desenvolvimento. Cadastre fornecedores e registre contas a pagar.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;
