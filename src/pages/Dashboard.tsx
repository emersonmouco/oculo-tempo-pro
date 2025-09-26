import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  Eye,
  Plus,
  Calendar,
  Clock,
  ArrowUpRight,
  Activity,
  DollarSign,
  Wrench,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

const Dashboard = () => {
  // Dados mockados para demonstração
  const stats = {
    vendasHoje: { valor: "R$ 2.847,90", quantidade: 15 },
    clientesAtivos: 1247,
    produtosEstoque: 856,
    ticketMedio: "R$ 189,86"
  };

  const ordensServico = [
    { id: "OS001", cliente: "Maria Silva", tipo: "Troca de Bateria", status: "Pendente", prazo: "2 dias" },
    { id: "OS002", cliente: "João Santos", tipo: "Ajuste de Pulseira", status: "Em Andamento", prazo: "1 dia" },
    { id: "OS003", cliente: "Ana Costa", tipo: "Polimento", status: "Concluído", prazo: "Entregue" },
  ];

  const montagensUrgentes = [
    { id: "MT001", cliente: "Carlos Oliveira", armacao: "Ray-Ban RB5228", lente: "Progressiva", prazo: "Hoje" },
    { id: "MT002", cliente: "Lucia Fernandes", armacao: "Oakley OX8156", lente: "Antirreflexo", prazo: "Amanhã" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente": return "status-pendente";
      case "Em Andamento": return "status-aprovado";
      case "Concluído": return "status-concluido";
      default: return "status-pendente";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.vendasHoje.valor}</div>
            <p className="text-xs text-muted-foreground">
              {stats.vendasHoje.quantidade} vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos em Estoque</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.produtosEstoque}</div>
            <p className="text-xs text-muted-foreground">
              3 produtos em ruptura
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.ticketMedio}</div>
            <p className="text-xs text-muted-foreground">
              +5.2% desde a semana passada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Principal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ordens de Serviço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Ordens de Serviço - Relojoaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordensServico.map((os) => (
                <div key={os.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{os.id}</span>
                      <span className="text-xs text-muted-foreground">{os.cliente}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${getStatusColor(os.status)}`}>
                      {os.status}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {os.prazo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver Todas as OS
            </Button>
          </CardContent>
        </Card>

        {/* Montagens Urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Montagens Urgentes - Ótica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {montagensUrgentes.map((montagem) => (
                <div key={montagem.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">{montagem.cliente}</span>
                    <span className="text-xs text-muted-foreground">
                      {montagem.armacao} + {montagem.lente}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${montagem.prazo === "Hoje" ? "status-pendente" : "status-aprovado"}`}>
                      {montagem.prazo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver Laboratório
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button className="erp-button-primary h-20 flex flex-col gap-2">
              <ShoppingCart className="h-5 w-5" />
              Nova Venda
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-5 w-5" />
              Cadastrar Cliente
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Wrench className="h-5 w-5" />
              Nova OS
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Prescrição
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;