import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Plus, 
  Search,
  Eye,
  Edit,
  AlertTriangle,
  TrendingDown,
  Boxes,
  ShoppingBag,
  BarChart
} from "lucide-react";

const Estoque = () => {
  // Dados mockados
  const produtos = [
    {
      id: 1,
      sku: "RB5228-2000",
      nome: "Ray-Ban RB5228",
      categoria: "Armação",
      marca: "Ray-Ban",
      estoque: 12,
      estoqueMin: 5,
      estoqueMax: 25,
      preco: 459.90,
      custo: 320.50,
      localizacao: "A1-B2",
      ultimaMovimentacao: "20/03/2024",
      status: "Normal"
    },
    {
      id: 2,
      sku: "LT-PROG-001", 
      nome: "Lente Progressiva Trivex",
      categoria: "Lente",
      marca: "Essilor",
      estoque: 3,
      estoqueMin: 10,
      estoqueMax: 50,
      preco: 389.90,
      custo: 180.00,
      localizacao: "B2-C1",
      ultimaMovimentacao: "22/03/2024",
      status: "Ruptura"
    },
    {
      id: 3,
      sku: "CZ-ECO-BM7100",
      nome: "Citizen Eco-Drive BM7100",
      categoria: "Relógio",
      marca: "Citizen", 
      estoque: 5,
      estoqueMin: 3,
      estoqueMax: 15,
      preco: 890.00,
      custo: 650.00,
      localizacao: "C1-D1",
      ultimaMovimentacao: "18/03/2024",
      status: "Baixo"
    }
  ];

  const movimentacoes = [
    {
      id: 1,
      tipo: "Entrada",
      produto: "Ray-Ban RB5228 - Preto",
      quantidade: 10,
      data: "22/03/2024",
      documento: "NF 001234",
      responsavel: "João Silva",
      motivo: "Compra"
    },
    {
      id: 2,
      tipo: "Saída", 
      produto: "Lente Progressiva Trivex",
      quantidade: -2,
      data: "22/03/2024",
      documento: "PV 0156",
      responsavel: "Ana Costa",
      motivo: "Venda"
    },
    {
      id: 3,
      tipo: "Ajuste",
      produto: "Citizen Eco-Drive BM7100", 
      quantidade: -1,
      data: "21/03/2024",
      documento: "AJ 0012",
      responsavel: "Pedro Santos",
      motivo: "Avaria"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal": return "status-aprovado";
      case "Baixo": return "status-pendente";
      case "Ruptura": return "status-cancelado";
      default: return "status-aprovado";
    }
  };

  const getMovimentacaoColor = (tipo: string) => {
    switch (tipo) {
      case "Entrada": return "status-aprovado";
      case "Saída": return "status-pendente";
      case "Ajuste": return "status-cancelado";
      default: return "status-pendente";
    }
  };

  const produtosBaixo = produtos.filter(p => p.status === "Baixo" || p.status === "Ruptura");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
          <p className="text-muted-foreground">Gerencie produtos, movimentações e níveis de estoque</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Nova Compra
          </Button>
          <Button className="erp-button-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Entrada Estoque
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">856</div>
            <p className="text-sm text-muted-foreground">Itens em Estoque</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">23</div>
            <p className="text-sm text-muted-foreground">Produtos em Baixo Estoque</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">8</div>
            <p className="text-sm text-muted-foreground">Produtos em Ruptura</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">R$ 156.890</div>
            <p className="text-sm text-muted-foreground">Valor Total Estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {produtosBaixo.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Produtos que Precisam de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {produtosBaixo.map((produto) => (
                <div key={produto.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                  <div>
                    <p className="font-medium">{produto.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      Estoque: {produto.estoque} | Mínimo: {produto.estoqueMin}
                    </p>
                  </div>
                  <Badge className={getStatusColor(produto.status)}>
                    {produto.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por SKU, nome, marca..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="produtos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="movimentacoes" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Movimentações
          </TabsTrigger>
        </TabsList>

        {/* Produtos */}
        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <CardTitle>Produtos em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {produtos.map((produto) => (
                  <div key={produto.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Boxes className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold text-lg">{produto.nome}</h3>
                          <p className="text-sm text-muted-foreground">SKU: {produto.sku} | {produto.marca}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{produto.categoria}</Badge>
                        <Badge className={getStatusColor(produto.status)}>
                          {produto.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm mb-3">
                      <div className="bg-secondary p-3 rounded">
                        <div className="text-xs text-muted-foreground">Estoque Atual</div>
                        <div className="font-bold text-lg">{produto.estoque}</div>
                      </div>
                      <div className="bg-secondary p-3 rounded">
                        <div className="text-xs text-muted-foreground">Mín / Máx</div>
                        <div className="font-medium">{produto.estoqueMin} / {produto.estoqueMax}</div>
                      </div>
                      <div className="bg-secondary p-3 rounded">
                        <div className="text-xs text-muted-foreground">Preço Venda</div>
                        <div className="font-medium text-primary">R$ {produto.preco.toFixed(2)}</div>
                      </div>
                      <div className="bg-secondary p-3 rounded">
                        <div className="text-xs text-muted-foreground">Margem</div>
                        <div className="font-medium text-success">
                          {(((produto.preco - produto.custo) / produto.preco) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Localização: </span>
                        <span className="font-medium">{produto.localizacao}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Última Movimentação: </span>
                        <span>{produto.ultimaMovimentacao}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="erp-button-secondary">
                        Ajustar Estoque
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movimentações */}
        <TabsContent value="movimentacoes">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movimentacoes.map((mov) => (
                  <div key={mov.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          mov.tipo === "Entrada" ? "bg-green-500" :
                          mov.tipo === "Saída" ? "bg-blue-500" : "bg-red-500"
                        }`}></div>
                        <div>
                          <h3 className="font-semibold">{mov.produto}</h3>
                          <p className="text-sm text-muted-foreground">
                            {mov.documento} | {mov.responsavel}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getMovimentacaoColor(mov.tipo)}>
                          {mov.tipo}
                        </Badge>
                        <p className="text-sm font-bold mt-1">
                          {mov.quantidade > 0 ? "+" : ""}{mov.quantidade}
                        </p>
                        <p className="text-xs text-muted-foreground">{mov.data}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Estoque;