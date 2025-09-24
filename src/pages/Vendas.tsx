import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Plus, 
  Search,
  Eye,
  Edit,
  Printer,
  Calculator
} from "lucide-react";

const Vendas = () => {
  // Dados mockados
  const vendas = [
    {
      id: "V001",
      cliente: "Maria Silva Santos",
      data: "24/03/2024",
      produtos: ["Ray-Ban RB5228", "Lente Progressiva"],
      valor: "R$ 749,90",
      pagamento: "Cartão Crédito 3x",
      status: "Finalizada",
      vendedor: "João"
    },
    {
      id: "V002", 
      cliente: "Carlos Oliveira",
      data: "24/03/2024",
      produtos: ["Óculos de Sol Oakley", "Estojo Premium"],
      valor: "R$ 589,90",
      pagamento: "PIX",
      status: "Finalizada",
      vendedor: "Ana"
    },
    {
      id: "V003",
      cliente: "Lucia Fernandes", 
      data: "24/03/2024",
      produtos: ["Citizen Eco-Drive", "Garantia Estendida"],
      valor: "R$ 1.090,00",
      pagamento: "Cartão Débito",
      status: "Aguardando",
      vendedor: "Pedro"
    }
  ];

  const orcamentos = [
    {
      id: "O001",
      cliente: "Roberto Silva",
      data: "23/03/2024",
      produtos: ["Armação Titanium", "Lente Antirreflexo"],
      valor: "R$ 1.200,00",
      validade: "30/03/2024",
      status: "Pendente"
    },
    {
      id: "O002",
      cliente: "Fernanda Costa",
      data: "22/03/2024", 
      produtos: ["G-Shock GA-2100", "Película Protetora"],
      valor: "R$ 680,00",
      validade: "29/03/2024",
      status: "Aprovado"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizada": return "status-concluido";
      case "Aprovado": return "status-aprovado";
      case "Aguardando": return "status-pendente";
      case "Pendente": return "status-pendente";
      default: return "status-pendente";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendas & PDV</h1>
          <p className="text-muted-foreground">Gerencie vendas e orçamentos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Novo Orçamento
          </Button>
          <Button className="erp-button-primary flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>

      {/* Resumo do Dia */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">R$ 2.429,80</div>
            <p className="text-sm text-muted-foreground">Vendas Hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">8</div>
            <p className="text-sm text-muted-foreground">Transações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">R$ 303,73</div>
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">5</div>
            <p className="text-sm text-muted-foreground">Orçamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Vendas Recentes</span>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar vendas..." 
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm">Filtros</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vendas.map((venda) => (
              <div key={venda.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{venda.id} - {venda.cliente}</h3>
                      <Badge className={getStatusColor(venda.status)}>
                        {venda.status}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Data: </span>
                        <span>{venda.data}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Produtos: </span>
                        <span>{venda.produtos.join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vendedor: </span>
                        <span>{venda.vendedor}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor: </span>
                        <span className="font-bold text-primary">{venda.valor}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pagamento: </span>
                        <span>{venda.pagamento}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orçamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orcamentos.map((orcamento) => (
              <div key={orcamento.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{orcamento.id} - {orcamento.cliente}</h3>
                      <Badge className={getStatusColor(orcamento.status)}>
                        {orcamento.status}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Data: </span>
                        <span>{orcamento.data}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Produtos: </span>
                        <span>{orcamento.produtos.join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor: </span>
                        <span className="font-bold text-primary">{orcamento.valor}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Validade: </span>
                        <span>{orcamento.validade}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vendas;