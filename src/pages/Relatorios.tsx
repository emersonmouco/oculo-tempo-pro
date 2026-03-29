import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { db } from "@/integrations/supabase/db";
import { 
  BarChart3, 
  Download, 
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Target
} from "lucide-react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

const chartConfig = {
  valor: { label: "Receita (R$)", color: "hsl(var(--primary))" },
  quantidade: { label: "Vendas", color: "hsl(var(--primary))" },
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "#22c55e", "#f59e0b"];

const Relatorios = () => {
  const [vendasMensais, setVendasMensais] = useState<{ mes: string; valor: number; quantidade: number }[]>([]);
  const [paymentData, setPaymentData] = useState<{ name: string; value: number }[]>([]);
  const [stats, setStats] = useState({ receita: 0, vendas: 0, ticketMedio: 0, novosClientes: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const months: { mes: string; valor: number; quantidade: number }[] = [];
        const PAYMENT_LABELS: Record<string, string> = {
          pix: "PIX", dinheiro: "Dinheiro", cartao_debito: "Cartão Débito",
          cartao_credito: "Cartão Crédito", parcelado: "Parcelado", boleto: "Boleto",
        };

        for (let i = 2; i >= 0; i--) {
          const d = subMonths(new Date(), i);
          const start = format(d, "yyyy-MM-01");
          const end = format(new Date(d.getFullYear(), d.getMonth() + 1, 0), "yyyy-MM-dd");
          const { data } = await db
            .from("sales")
            .select("total")
            .eq("status", "finalizada")
            .gte("created_at", `${start}T00:00:00`)
            .lte("created_at", `${end}T23:59:59`);
          const vendas = data || [];
          const valor = vendas.reduce((a, s) => a + Number(s.total), 0);
          months.push({
            mes: format(d, "MMM", { locale: ptBR }),
            valor,
            quantidade: vendas.length,
          });
        }
        setVendasMensais(months);

        const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
        const endOfMonth = format(new Date(), "yyyy-MM-dd");
        const { data: salesMonth } = await supabase
          .from("sales")
          .select("total, payment_method")
          .eq("status", "finalizada")
          .gte("created_at", `${startOfMonth}T00:00:00`)
          .lte("created_at", `${endOfMonth}T23:59:59`);

        const sales = salesMonth || [];
        const receita = sales.reduce((a, s) => a + Number(s.total), 0);
        const paymentMap: Record<string, number> = {};
        sales.forEach((s) => {
          const m = s.payment_method || "outros";
          paymentMap[m] = (paymentMap[m] || 0) + Number(s.total);
        });
        setPaymentData(
          Object.entries(paymentMap).map(([k, v]) => ({ name: PAYMENT_LABELS[k] || k, value: v }))
        );
        setStats({
          receita,
          vendas: sales.length,
          ticketMedio: sales.length > 0 ? receita / sales.length : 0,
          novosClientes: 0,
        });
      } catch (e) {
        console.error("Erro ao carregar relatórios:", e);
      }
    };
    loadData();
  }, []);

  const topProdutos = [
    { produto: "Ray-Ban RB5228", quantidade: 45, receita: "R$ 20.695,50" },
    { produto: "Lente Progressiva", quantidade: 38, receita: "R$ 14.816,20" },
    { produto: "Citizen Eco-Drive", quantidade: 12, receita: "R$ 10.680,00" },
  ];

  const vendedores = [
    { nome: "Ana Costa", vendas: 78, receita: "R$ 23.450,00", comissao: "R$ 2.345,00" },
    { nome: "João Silva", vendas: 65, receita: "R$ 19.850,00", comissao: "R$ 1.985,00" },
    { nome: "Pedro Santos", vendas: 52, receita: "R$ 16.200,00", comissao: "R$ 1.620,00" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios Gerenciais</h1>
          <p className="text-muted-foreground">Análises e indicadores do negócio</p>
        </div>
        <Button className="erp-button-primary flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Indicadores Principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Mês</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {stats.receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                <p className="text-2xl font-bold text-primary">{stats.vendas}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {stats.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos Clientes</p>
                <p className="text-2xl font-bold text-primary">{stats.novosClientes}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="vendas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        {/* Relatório de Vendas */}
        <TabsContent value="vendas">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Vendas Mensais - Gráfico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Vendas Últimos 3 Meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <BarChart data={vendasMensais} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Receita"]} />} />
                    <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Conversão de Orçamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span>Orçamentos Gerados</span>
                    <span className="font-bold">247</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span>Vendas Concretizadas</span>
                    <span className="font-bold">198</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium">Taxa de Conversão</span>
                    <span className="font-bold text-primary text-xl">80.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relatório de Produtos */}
        <TabsContent value="produtos">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProdutos.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.produto}</p>
                          <p className="text-sm text-muted-foreground">{item.quantidade} unidades vendidas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{item.receita}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categorias */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-primary">45%</div>
                  <p className="text-sm text-muted-foreground">Armações</p>
                  <p className="text-xs">R$ 21.744,00</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-primary">32%</div>
                  <p className="text-sm text-muted-foreground">Lentes</p>
                  <p className="text-xs">R$ 15.462,40</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-primary">23%</div>
                  <p className="text-sm text-muted-foreground">Relógios</p>
                  <p className="text-xs">R$ 11.113,60</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Relatório da Equipe */}
        <TabsContent value="equipe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Performance dos Vendedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendedores.map((vendedor, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{vendedor.nome}</h3>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-primary' : 
                        index === 1 ? 'bg-secondary-foreground' : 'bg-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-secondary rounded">
                        <div className="font-bold text-lg">{vendedor.vendas}</div>
                        <div className="text-sm text-muted-foreground">Vendas</div>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded">
                        <div className="font-bold text-lg text-primary">{vendedor.receita}</div>
                        <div className="text-sm text-muted-foreground">Receita</div>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded">
                        <div className="font-bold text-lg text-success">{vendedor.comissao}</div>
                        <div className="text-sm text-muted-foreground">Comissão</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório Financeiro */}
        <TabsContent value="financeiro">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  DRE Simplificada - Março 2024
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between p-2">
                    <span>Receita Bruta</span>
                    <span className="font-medium">R$ 48.320,00</span>
                  </div>
                  <div className="flex justify-between p-2 text-red-600">
                    <span>(-) Custo dos Produtos</span>
                    <span>R$ -26.890,00</span>
                  </div>
                  <div className="flex justify-between p-2 border-t">
                    <span className="font-medium">Margem Bruta</span>
                    <span className="font-bold">R$ 21.430,00</span>
                  </div>
                  <div className="flex justify-between p-2 text-red-600">
                    <span>(-) Despesas Operacionais</span>
                    <span>R$ -12.400,00</span>
                  </div>
                  <div className="flex justify-between p-2 border-t">
                    <span className="font-bold text-primary">Lucro Líquido</span>
                    <span className="font-bold text-primary">R$ 9.030,00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentData.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nenhuma venda no mês.</p>
                ) : (
                  <ChartContainer config={{ value: { label: "Valor" } }} className="h-[240px] w-full">
                    <PieChart>
                      <ChartTooltip formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]} />
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {paymentData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;