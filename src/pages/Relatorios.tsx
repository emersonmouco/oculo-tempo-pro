import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Download, 
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Calendar,
  FileText,
  Target
} from "lucide-react";

const Relatorios = () => {
  // Dados mockados para gráficos
  const vendasMensais = [
    { mes: "Jan", valor: 45000, quantidade: 185 },
    { mes: "Fev", valor: 52000, quantidade: 210 },
    { mes: "Mar", valor: 48000, quantidade: 198 },
  ];

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
                <p className="text-2xl font-bold text-primary">R$ 48.320,00</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% vs mês anterior
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
                <p className="text-2xl font-bold text-primary">198</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.2% vs mês anterior
                </p>
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
                <p className="text-2xl font-bold text-primary">R$ 244,04</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3.8% vs mês anterior
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
                <p className="text-2xl font-bold text-primary">47</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +15.6% vs mês anterior
                </p>
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
            {/* Vendas Mensais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Vendas Últimos 3 Meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendasMensais.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground text-sm font-bold">
                          {item.mes}
                        </div>
                        <div>
                          <p className="font-medium">{item.quantidade} vendas</p>
                          <p className="text-sm text-muted-foreground">
                            Média: R$ {(item.valor / item.quantidade).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">R$ {item.valor.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary rounded">
                    <span>Cartão de Crédito</span>
                    <div className="text-right">
                      <div className="font-bold">42%</div>
                      <div className="text-sm text-muted-foreground">R$ 20.294,40</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded">
                    <span>PIX</span>
                    <div className="text-right">
                      <div className="font-bold">28%</div>
                      <div className="text-sm text-muted-foreground">R$ 13.529,60</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded">
                    <span>Cartão de Débito</span>
                    <div className="text-right">
                      <div className="font-bold">20%</div>
                      <div className="text-sm text-muted-foreground">R$ 9.664,00</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary rounded">
                    <span>Dinheiro</span>
                    <div className="text-right">
                      <div className="font-bold">10%</div>
                      <div className="text-sm text-muted-foreground">R$ 4.832,00</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;