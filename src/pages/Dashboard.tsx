import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "@/integrations/supabase/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  Clock,
  DollarSign,
  Wrench,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    vendasHoje: { valor: 0, quantidade: 0 },
    fornecedoresAtivos: 0,
    produtosEstoque: 0,
    ticketMedio: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const { data: salesToday } = await db
          .from("sales")
          .select("id, total")
          .eq("status", "finalizada")
          .gte("created_at", `${today}T00:00:00`)
          .lt("created_at", `${today}T23:59:59`);
        const vendas = salesToday || [];
        const valorHoje = vendas.reduce((acc, s) => acc + Number(s.total), 0);
        const ticketMedio = vendas.length > 0 ? valorHoje / vendas.length : 0;

        const { count: countFornecedores } = await supabase
          .from("legal_persons")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true);

        const { data: products } = await supabase
          .from("products")
          .select("stock_quantity");

        const totalEstoque = (products || []).reduce((acc, p) => acc + (p.stock_quantity || 0), 0);

        setStats({
          vendasHoje: { valor: valorHoje, quantidade: vendas.length },
          fornecedoresAtivos: countFornecedores || 0,
          produtosEstoque: totalEstoque,
          ticketMedio,
        });
      } catch (e) {
        console.error("Erro ao carregar stats:", e);
      }
    };
    loadStats();
  }, []);

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
            <div className="text-2xl font-bold text-primary">
              R$ {stats.vendasHoje.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.vendasHoje.quantidade} vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.fornecedoresAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados no sistema
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
              Unidades disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio (Hoje)</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Média das vendas de hoje
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
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/os-relojoaria">Ver Todas as OS</Link>
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
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/montagem">Ver Laboratório</Link>
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
            <Button className="erp-button-primary h-20 flex flex-col gap-2" asChild>
              <Link to="/pdv">
                <ShoppingCart className="h-5 w-5" />
                Nova Venda
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link to="/fornecedores">
                <Users className="h-5 w-5" />
                Cadastrar Fornecedor
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link to="/os-relojoaria">
                <Wrench className="h-5 w-5" />
                Nova OS
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link to="/prescricoes">
                <CheckCircle2 className="h-5 w-5" />
                Prescrição
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;