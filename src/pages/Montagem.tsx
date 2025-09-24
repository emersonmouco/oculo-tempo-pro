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
  AlertTriangle,
  PlayCircle,
  Package
} from "lucide-react";

const Montagem = () => {
  // Dados mockados
  const montagens = [
    {
      id: "MT001",
      cliente: "Maria Silva Santos",
      pedido: "PV001",
      dataEntrada: "22/03/2024",
      prazoEntrega: "25/03/2024",
      armacao: {
        marca: "Ray-Ban",
        modelo: "RB5228",
        cor: "Preto",
        tamanho: "52-17-140"
      },
      lente: {
        tipo: "Progressiva",
        material: "Trivex",
        indice: "1.53",
        tratamentos: ["Antirreflexo", "Blue Light", "Antirrisco"]
      },
      prescricao: "PR001",
      medidas: {
        dnp: "62mm",
        dp: "31/31", 
        altura: "18mm",
        curvatura: "6.00"
      },
      status: "Aguardando",
      prioridade: "Normal",
      observacoes: "Cliente precisa até sexta-feira"
    },
    {
      id: "MT002",
      cliente: "Carlos Oliveira",
      pedido: "PV002", 
      dataEntrada: "23/03/2024",
      prazoEntrega: "24/03/2024",
      armacao: {
        marca: "Oakley",
        modelo: "OX8156",
        cor: "Cinza Fosco",
        tamanho: "54-18-143"
      },
      lente: {
        tipo: "Monofocal",
        material: "Policarbonato", 
        indice: "1.59",
        tratamentos: ["Antirreflexo", "Antirrisco"]
      },
      prescricao: "PR002",
      medidas: {
        dnp: "65mm",
        dp: "32.5/32.5",
        altura: "20mm", 
        curvatura: "4.00"
      },
      status: "Cortando",
      prioridade: "Urgente",
      observacoes: "Cliente viajando amanhã"
    },
    {
      id: "MT003",
      cliente: "Ana Costa",
      pedido: "PV003",
      dataEntrada: "20/03/2024", 
      prazoEntrega: "23/03/2024",
      armacao: {
        marca: "Guess", 
        modelo: "GU2840",
        cor: "Azul",
        tamanho: "50-16-135"
      },
      lente: {
        tipo: "Bifocal",
        material: "CR-39",
        indice: "1.50", 
        tratamentos: ["Antirreflexo"]
      },
      prescricao: "PR003",
      medidas: {
        dnp: "58mm",
        dp: "29/29",
        altura: "16mm",
        curvatura: "6.00"
      },
      status: "Montando",
      prioridade: "Normal", 
      observacoes: "Verificar centragem cuidadosamente"
    },
    {
      id: "MT004",
      cliente: "Lucia Fernandes",
      pedido: "PV004",
      dataEntrada: "19/03/2024",
      prazoEntrega: "22/03/2024", 
      armacao: {
        marca: "Arnette",
        modelo: "AN7186", 
        cor: "Marrom",
        tamanho: "52-18-140"
      },
      lente: {
        tipo: "Monofocal",
        material: "CR-39",
        indice: "1.50",
        tratamentos: ["Antirreflexo", "Fotossensível"]
      },
      prescricao: "PR004",
      medidas: {
        dnp: "60mm", 
        dp: "30/30",
        altura: "17mm",
        curvatura: "4.00"
      },
      status: "Pronto",
      prioridade: "Normal",
      observacoes: "Montagem concluída, aguardando retirada"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pronto": return "status-concluido";
      case "Montando": return "status-aprovado";
      case "Cortando": return "status-pendente"; 
      case "Aguardando": return "status-cancelado";
      default: return "status-pendente";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pronto": return CheckCircle2;
      case "Montando": return Wrench;
      case "Cortando": return PlayCircle;
      case "Aguardando": return Clock;
      default: return Clock;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "Urgente": return "status-cancelado";
      case "Alta": return "status-pendente";
      case "Normal": return "status-aprovado";
      default: return "status-aprovado";
    }
  };

  const emAndamento = montagens.filter(m => m.status !== "Pronto");
  const prontas = montagens.filter(m => m.status === "Pronto");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Laboratório de Montagem</h1>
          <p className="text-muted-foreground">Controle de produção de óculos</p>
        </div>
        <Button className="erp-button-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Montagem
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">18</div>
            <p className="text-sm text-muted-foreground">Em Produção</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">5</div>
            <p className="text-sm text-muted-foreground">Aguardando</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-info">8</div>
            <p className="text-sm text-muted-foreground">Cortando</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">12</div>
            <p className="text-sm text-muted-foreground">Prontas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">3</div>
            <p className="text-sm text-muted-foreground">Urgentes</p>
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
                placeholder="Buscar por montagem, cliente, pedido..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Montagem */}
      <Tabs defaultValue="andamento" className="space-y-4">
        <TabsList>
          <TabsTrigger value="andamento" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Em Andamento ({emAndamento.length})
          </TabsTrigger>
          <TabsTrigger value="prontas" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Prontas ({prontas.length})
          </TabsTrigger>
        </TabsList>

        {/* Montagens em Andamento */}
        <TabsContent value="andamento">
          <Card>
            <CardHeader>
              <CardTitle>Montagens em Produção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {emAndamento.map((montagem) => {
                  const StatusIcon = getStatusIcon(montagem.status);
                  return (
                    <div key={montagem.id} className="border border-border rounded-lg p-6 hover:bg-secondary/50">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <StatusIcon className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold text-lg">{montagem.id} - {montagem.cliente}</h3>
                            <p className="text-sm text-muted-foreground">Pedido: {montagem.pedido} | Prescrição: {montagem.prescricao}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPrioridadeColor(montagem.prioridade)}>
                            {montagem.prioridade}
                          </Badge>
                          <Badge className={getStatusColor(montagem.status)}>
                            {montagem.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Prazos */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-muted-foreground text-sm">Entrada: </span>
                          <span>{montagem.dataEntrada}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-sm">Prazo Entrega: </span>
                          <span className="font-medium">{montagem.prazoEntrega}</span>
                        </div>
                      </div>

                      {/* Especificações */}
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        {/* Armação */}
                        <div className="bg-secondary p-4 rounded-lg">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Armação
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Marca/Modelo: </span>
                              <span className="font-medium">{montagem.armacao.marca} {montagem.armacao.modelo}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cor: </span>
                              <span>{montagem.armacao.cor}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tamanho: </span>
                              <span>{montagem.armacao.tamanho}</span>
                            </div>
                          </div>
                        </div>

                        {/* Lente */}
                        <div className="bg-secondary p-4 rounded-lg">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Lentes
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Tipo: </span>
                              <span className="font-medium">{montagem.lente.tipo}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Material: </span>
                              <span>{montagem.lente.material} ({montagem.lente.indice})</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tratamentos: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {montagem.lente.tratamentos.map((tratamento, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tratamento}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Medidas */}
                      <div className="grid md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-muted p-3 rounded text-center">
                          <div className="text-xs text-muted-foreground">DNP</div>
                          <div className="font-medium">{montagem.medidas.dnp}</div>
                        </div>
                        <div className="bg-muted p-3 rounded text-center">
                          <div className="text-xs text-muted-foreground">DP</div>
                          <div className="font-medium">{montagem.medidas.dp}</div>
                        </div>
                        <div className="bg-muted p-3 rounded text-center">
                          <div className="text-xs text-muted-foreground">Altura</div>
                          <div className="font-medium">{montagem.medidas.altura}</div>
                        </div>
                        <div className="bg-muted p-3 rounded text-center">
                          <div className="text-xs text-muted-foreground">Curvatura</div>
                          <div className="font-medium">{montagem.medidas.curvatura}</div>
                        </div>
                      </div>

                      {/* Observações */}
                      {montagem.observacoes && (
                        <div className="mb-4">
                          <span className="text-muted-foreground text-sm">Observações: </span>
                          <p className="text-sm bg-muted p-3 rounded mt-1">{montagem.observacoes}</p>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex gap-2 pt-4 border-t">
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

        {/* Montagens Prontas */}
        <TabsContent value="prontas">
          <Card>
            <CardHeader>
              <CardTitle>Montagens Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prontas.map((montagem) => (
                  <div key={montagem.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <div>
                          <h3 className="font-semibold">{montagem.id} - {montagem.cliente}</h3>
                          <p className="text-sm text-muted-foreground">
                            {montagem.armacao.marca} {montagem.armacao.modelo} + {montagem.lente.tipo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(montagem.status)}>
                          {montagem.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">Prazo: {montagem.prazoEntrega}</p>
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

export default Montagem;