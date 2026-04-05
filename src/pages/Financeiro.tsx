import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet,
  ArrowDownCircle, ArrowUpCircle, Download, BarChart3, Receipt,
  Calendar, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const Financeiro = () => {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth());
  const [ano, setAno] = useState(now.getFullYear());

  const { resumo, paymentBreakdown, vendasDiarias, contasReceber, contasPagar, loading } =
    useFinanceiro(mes, ano);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const maxDiario = Math.max(...vendasDiarias.map((d) => d.total), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Controle financeiro e fluxo de caixa</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((m, i) => (
                <SelectItem key={i} value={String(i)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo.receitaMes)}</p>
                <p className="text-xs text-muted-foreground mt-1">{resumo.vendasCount} vendas</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Despesas (Compras)</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(resumo.despesasMes)}</p>
                <p className="text-xs text-muted-foreground mt-1">{resumo.comprasCount} pedidos</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Bruto</p>
                <p className={`text-2xl font-bold ${resumo.lucroMes >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  {formatCurrency(resumo.lucroMes)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Receita − Despesas</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(resumo.ticketMedio)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {MESES[mes]} {ano}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumo" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Resumo
          </TabsTrigger>
          <TabsTrigger value="formas-pagamento" className="flex items-center gap-1">
            <Wallet className="h-4 w-4" /> Pagamentos
          </TabsTrigger>
          <TabsTrigger value="contas-receber" className="flex items-center gap-1">
            <ArrowDownCircle className="h-4 w-4" /> A Receber
          </TabsTrigger>
          <TabsTrigger value="contas-pagar" className="flex items-center gap-1">
            <ArrowUpCircle className="h-4 w-4" /> A Pagar
          </TabsTrigger>
        </TabsList>

        {/* Tab: Resumo com gráfico de barras simples */}
        <TabsContent value="resumo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Vendas Diárias — {MESES[mes]} {ano}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendasDiarias.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma venda registrada neste período.</p>
              ) : (
                <div className="space-y-2">
                  {vendasDiarias.map((d) => (
                    <div key={d.dia} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-24 shrink-0">
                        {format(new Date(d.dia + "T12:00:00"), "dd MMM", { locale: ptBR })}
                      </span>
                      <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${Math.max((d.total / maxDiario) * 100, 8)}%` }}
                        >
                          <span className="text-xs font-medium text-primary-foreground whitespace-nowrap">
                            {formatCurrency(d.total)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">{d.count} venda{d.count > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mini resumo financeiro */}
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Contas a Receber</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(contasReceber.reduce((a, c) => a + c.valor, 0))}
                </p>
                <p className="text-xs text-muted-foreground">{contasReceber.length} título(s)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Contas a Pagar</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(contasPagar.reduce((a, c) => a + c.valor, 0))}
                </p>
                <p className="text-xs text-muted-foreground">{contasPagar.length} título(s)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Período</p>
                <p className="text-xl font-bold">{MESES[mes]}</p>
                <p className="text-xs text-muted-foreground">{ano}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Formas de Pagamento */}
        <TabsContent value="formas-pagamento">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Distribuição por Forma de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentBreakdown.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma venda registrada no período.</p>
              ) : (
                <div className="space-y-3">
                  {paymentBreakdown.map((pm) => (
                    <div key={pm.method} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{pm.label}</span>
                          <span className="font-bold">{pm.percent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pm.percent}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <p className="font-bold">{formatCurrency(pm.total)}</p>
                        <p className="text-xs text-muted-foreground">{pm.count} venda{pm.count > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between p-3 bg-primary/10 rounded-lg font-bold mt-4">
                    <span>Total</span>
                    <span>{formatCurrency(paymentBreakdown.reduce((a, p) => a + p.total, 0))}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Contas a Receber */}
        <TabsContent value="contas-receber">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <ArrowDownCircle className="h-5 w-5" />
                Contas a Receber — {MESES[mes]} {ano}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contasReceber.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhuma conta a receber neste período. Vendas com boleto, duplicata ou parcelado aparecerão aqui.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasReceber.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.descricao}</TableCell>
                        <TableCell>{format(new Date(c.vencimento + "T12:00:00"), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === "pago" ? "default" : c.status === "vencido" ? "destructive" : "secondary"}>
                            {c.status === "pendente" ? "Pendente" : c.status === "pago" ? "Pago" : "Vencido"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(c.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-secondary/50">
                      <TableCell colSpan={3} className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(contasReceber.reduce((a, c) => a + c.valor, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Contas a Pagar */}
        <TabsContent value="contas-pagar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <ArrowUpCircle className="h-5 w-5" />
                Contas a Pagar — {MESES[mes]} {ano}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contasPagar.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhuma conta a pagar neste período. Pedidos de compra confirmados/recebidos aparecerão aqui.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasPagar.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.descricao}</TableCell>
                        <TableCell>{format(new Date(c.vencimento + "T12:00:00"), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={c.status === "pago" ? "default" : c.status === "vencido" ? "destructive" : "secondary"}>
                            {c.status === "pendente" ? "Pendente" : c.status === "pago" ? "Pago" : "Vencido"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          {formatCurrency(c.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-secondary/50">
                      <TableCell colSpan={3} className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {formatCurrency(contasPagar.reduce((a, c) => a + c.valor, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;
