import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search,
  Eye,
  Edit,
  Calendar,
  User,
  Stethoscope
} from "lucide-react";

const Prescricoes = () => {
  // Dados mockados
  const prescricoes = [
    {
      id: "PR001",
      cliente: "Maria Silva Santos",
      dataExame: "15/03/2024",
      validade: "15/03/2025",
      medico: "Dr. João Carvalho",
      crm: "CRM/SP 123456",
      od: {
        esferico: "-2.25",
        cilindrico: "-0.50", 
        eixo: "90°",
        adicao: "+1.25"
      },
      oe: {
        esferico: "-2.00",
        cilindrico: "-0.75",
        eixo: "85°", 
        adicao: "+1.25"
      },
      dnp: "62mm",
      dp: "31/31",
      altura: "18mm",
      observacoes: "Paciente com presbiopia, necessita progressiva",
      status: "Ativa"
    },
    {
      id: "PR002",
      cliente: "Carlos Oliveira", 
      dataExame: "10/03/2024",
      validade: "10/03/2025",
      medico: "Dra. Ana Souza",
      crm: "CRM/SP 654321",
      od: {
        esferico: "+1.50",
        cilindrico: "0.00",
        eixo: "-",
        adicao: "-"
      },
      oe: {
        esferico: "+1.25",
        cilindrico: "0.00", 
        eixo: "-",
        adicao: "-"
      },
      dnp: "65mm",
      dp: "32.5/32.5",
      altura: "20mm",
      observacoes: "Hipermetropia leve, primeira prescrição",
      status: "Ativa"
    },
    {
      id: "PR003",
      cliente: "Lucia Fernandes",
      dataExame: "28/02/2024", 
      validade: "28/02/2025",
      medico: "Dr. Roberto Lima",
      crm: "CRM/SP 789123",
      od: {
        esferico: "-4.75",
        cilindrico: "-1.25",
        eixo: "180°",
        adicao: "-"
      },
      oe: {
        esferico: "-4.50",
        cilindrico: "-1.00",
        eixo: "175°",
        adicao: "-"
      },
      dnp: "58mm", 
      dp: "29/29",
      altura: "16mm",
      observacoes: "Miopia alta com astigmatismo, usar lente de alto índice",
      status: "Ativa"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa": return "status-concluido";
      case "Vencida": return "status-cancelado";
      case "Utilizada": return "status-aprovado";
      default: return "status-pendente";
    }
  };

  const formatGrau = (valor: string) => {
    if (valor === "0.00" || valor === "-" || !valor) return "-";
    return valor;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescrições Oftálmicas</h1>
          <p className="text-muted-foreground">Gerencie receitas médicas e dados visuais</p>
        </div>
        <Button className="erp-button-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Prescrição
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">45</div>
            <p className="text-sm text-muted-foreground">Prescrições Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">12</div>
            <p className="text-sm text-muted-foreground">Vencendo (30 dias)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">28</div>
            <p className="text-sm text-muted-foreground">Utilizadas (Mês)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">8</div>
            <p className="text-sm text-muted-foreground">Cadastradas (Semana)</p>
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
                placeholder="Buscar por cliente, prescrição, médico..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Prescrições */}
      <Card>
        <CardHeader>
          <CardTitle>Prescrições Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {prescricoes.map((prescricao) => (
              <div key={prescricao.id} className="border border-border rounded-lg p-6 hover:bg-secondary/50">
                {/* Header da Prescrição */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">{prescricao.id} - {prescricao.cliente}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Exame: {prescricao.dataExame}
                        </div>
                        <div className="flex items-center gap-1">
                          <Stethoscope className="h-4 w-4" />
                          {prescricao.medico} - {prescricao.crm}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Validade</p>
                      <p className="font-medium">{prescricao.validade}</p>
                    </div>
                    <Badge className={getStatusColor(prescricao.status)}>
                      {prescricao.status}
                    </Badge>
                  </div>
                </div>

                {/* Dados da Prescrição */}
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  {/* Olho Direito */}
                  <div className="bg-secondary p-4 rounded-lg">
                    <h4 className="font-medium mb-3 text-center">Olho Direito (OD)</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Esférico: </span>
                        <span className="font-medium">{formatGrau(prescricao.od.esferico)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cilíndrico: </span>
                        <span className="font-medium">{formatGrau(prescricao.od.cilindrico)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Eixo: </span>
                        <span className="font-medium">{formatGrau(prescricao.od.eixo)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Adição: </span>
                        <span className="font-medium">{formatGrau(prescricao.od.adicao)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Olho Esquerdo */}
                  <div className="bg-secondary p-4 rounded-lg">
                    <h4 className="font-medium mb-3 text-center">Olho Esquerdo (OE)</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Esférico: </span>
                        <span className="font-medium">{formatGrau(prescricao.oe.esferico)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cilíndrico: </span>
                        <span className="font-medium">{formatGrau(prescricao.oe.cilindrico)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Eixo: </span>
                        <span className="font-medium">{formatGrau(prescricao.oe.eixo)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Adição: </span>
                        <span className="font-medium">{formatGrau(prescricao.oe.adicao)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medidas Adicionais */}
                <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="bg-muted p-3 rounded">
                    <span className="text-muted-foreground">DNP: </span>
                    <span className="font-medium">{prescricao.dnp}</span>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <span className="text-muted-foreground">DP: </span>
                    <span className="font-medium">{prescricao.dp}</span>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <span className="text-muted-foreground">Altura: </span>
                    <span className="font-medium">{prescricao.altura}</span>
                  </div>
                </div>

                {/* Observações */}
                {prescricao.observacoes && (
                  <div className="mb-4">
                    <span className="text-muted-foreground text-sm">Observações: </span>
                    <p className="text-sm bg-muted p-3 rounded mt-1">{prescricao.observacoes}</p>
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
                    Usar em Orçamento
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prescricoes;