import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Agenda = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState(new Date());

  // Compromissos mockados para demonstração
  const compromissos = [
    { id: 1, titulo: "Retirada óculos - Maria Silva", horario: "09:00", tipo: "retirada" },
    { id: 2, titulo: "Exame - João Santos", horario: "10:30", tipo: "exame" },
    { id: 3, titulo: "Consulta - Ana Costa", horario: "14:00", tipo: "consulta" },
    { id: 4, titulo: "Ajuste relógio - Carlos Oliveira", horario: "16:00", tipo: "servico" },
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "retirada":
        return "status-concluido";
      case "exame":
        return "status-aprovado";
      case "consulta":
        return "status-pendente";
      case "servico":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "status-pendente";
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      retirada: "Retirada",
      exame: "Exame",
      consulta: "Consulta",
      servico: "Serviço",
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">Agendamento de atendimentos e compromissos</p>
        </div>
        <Button className="erp-button-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Calendário</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={month}
              onMonthChange={setMonth}
              locale={ptBR}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Compromissos do dia - {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {compromissos.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Nenhum compromisso agendado para este dia.</p>
            ) : (
              <div className="space-y-4">
                {compromissos.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{comp.horario}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{comp.titulo}</p>
                        <Badge className={`mt-1 ${getTipoColor(comp.tipo)}`}>{getTipoLabel(comp.tipo)}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver detalhes
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge className="status-concluido">Retirada</Badge>
              <span className="text-sm text-muted-foreground">Retirada de óculos</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="status-aprovado">Exame</Badge>
              <span className="text-sm text-muted-foreground">Exame oftalmológico</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="status-pendente">Consulta</Badge>
              <span className="text-sm text-muted-foreground">Consulta/Atendimento</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">Serviço</Badge>
              <span className="text-sm text-muted-foreground">Serviço relojoaria</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agenda;
