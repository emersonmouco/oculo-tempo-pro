import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, 
  Plus, 
  Search,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const OSRelojoaria = () => {
  // Dados mockados
  const ordensServico = [
    {
      id: "OS001",
      cliente: "Maria Silva",
      telefone: "(11) 99999-9999",
      relogio: "Citizen Eco-Drive BM7100",
      problema: "Relógio parou de funcionar após queda",
      servicos: ["Troca de bateria", "Verificação do movimento", "Limpeza interna"],
      dataEntrada: "20/03/2024",
      prazoEstimado: "27/03/2024",
      status: "Aguardando Peças",
      valor: "R$ 125,00",
      tecnico: "Roberto",
      observacoes: "Cliente relatou que o relógio caiu no chão"
    },
    {
      id: "OS002", 
      cliente: "João Santos",
      telefone: "(11) 88888-8888",
      relogio: "Casio G-Shock GA-2100",
      problema: "Pulseira danificada, botões travados",
      servicos: ["Troca de pulseira", "Limpeza dos botões", "Teste de resistência"],
      dataEntrada: "22/03/2024",
      prazoEstimado: "25/03/2024",
      status: "Em Execução",
      valor: "R$ 85,00",
      tecnico: "Carlos",
      observacoes: "Pulseira original não disponível, sugerir similar"
    },
    {
      id: "OS003",
      cliente: "Ana Costa",
      telefone: "(11) 77777-7777", 
      relogio: "Rolex Submariner",
      problema: "Revisão anual completa",
      servicos: ["Revisão completa", "Troca de vedações", "Polimento", "Regulagem"],
      dataEntrada: "18/03/2024",
      prazoEstimado: "15/04/2024",
      status: "Orçamento Enviado",
      valor: "R$ 1.200,00",
      tecnico: "Roberto",
      observacoes: "Revisão de alta complexidade, aguardando aprovação"
    },
    {
      id: "OS004",
      cliente: "Pedro Oliveira",
      telefone: "(11) 66666-6666",
      relogio: "Seiko Automatic",
      problema: "Troca de bateria simples",
      servicos: ["Troca de bateria"],
      dataEntrada: "24/03/2024",
      prazoEstimado: "24/03/2024",
      status: "Concluído",
      valor: "R$ 25,00", 
      tecnico: "Carlos",
      observacoes: "Serviço expresso, concluído no mesmo dia"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído": return "status-concluido";
      case "Em Execução": return "status-aprovado";
      case "Aguardando Peças": return "status-pendente";
      case "Orçamento Enviado": return "status-pendente";
      default: return "status-pendente";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Concluído": return CheckCircle2;
      case "Em Execução": return Wrench;
      case "Aguardando Peças": return AlertCircle;
      case "Orçamento Enviado": return Clock;
      default: return Clock;
    }
  };

  const pendentes = ordensServico.filter(os => os.status !== "Concluído");
  const concluidas = ordensServico.filter(os => os.status === "Concluído");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço - Relojoaria</h1>
          <p className="text-muted-foreground">Gerencie reparos e manutenções de relógios</p>
        </div>
        <Button className="erp-button-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova OS
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">12</div>
            <p className="text-sm text-muted-foreground">OS Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">3</div>
            <p className="text-sm text-muted-foreground">Aguardando Peças</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">8</div>
            <p className="text-sm text-muted-foreground">Concluídas (Semana)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">R$ 2.150,00</div>
            <p className="text-sm text-muted-foreground">Receita (Semana)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por OS, cliente, relógio..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs OS */}
      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Em Andamento ({pendentes.length})
          </TabsTrigger>
          <TabsTrigger value="concluidas" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Concluídas ({concluidas.length})
          </TabsTrigger>
        </TabsList>

        {/* OS Pendentes */}
        <TabsContent value="pendentes">
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendentes.map((os) => {
                  const StatusIcon = getStatusIcon(os.status);
                  return (
                    <div key={os.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <StatusIcon className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold text-lg">{os.id} - {os.cliente}</h3>
                            <p className="text-sm text-muted-foreground">{os.telefone}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(os.status)}>
                          {os.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground text-sm">Relógio: </span>
                            <span className="font-medium">{os.relogio}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Problema: </span>
                            <span>{os.problema}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Técnico: </span>
                            <span>{os.tecnico}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground text-sm">Entrada: </span>
                            <span>{os.dataEntrada}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Prazo: </span>
                            <span>{os.prazoEstimado}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Valor: </span>
                            <span className="font-bold text-primary">{os.valor}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-muted-foreground text-sm">Serviços: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {os.servicos.map((servico, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {servico}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {os.observacoes && (
                        <div className="mb-3">
                          <span className="text-muted-foreground text-sm">Observações: </span>
                          <p className="text-sm bg-secondary p-2 rounded mt-1">{os.observacoes}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="erp-button-primary">
                          Atualizar Status
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OS Concluídas */}
        <TabsContent value="concluidas">
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {concluidas.map((os) => (
                  <div key={os.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50 opacity-75">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <div>
                          <h3 className="font-semibold">{os.id} - {os.cliente}</h3>
                          <p className="text-sm text-muted-foreground">{os.relogio}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(os.status)}>
                          {os.status}
                        </Badge>
                        <p className="text-sm font-bold text-primary mt-1">{os.valor}</p>
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

export default OSRelojoaria;