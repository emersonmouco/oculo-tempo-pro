import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  UserPlus, 
  Eye, 
  Edit, 
  Phone, 
  Mail,
  MapPin
} from "lucide-react";

const Clientes = () => {
  // Dados mockados
  const clientes = [
    {
      id: 1,
      nome: "Maria Silva Santos",
      email: "maria.silva@email.com",
      telefone: "(11) 99999-9999",
      cpf: "123.456.789-00",
      endereco: "Rua das Flores, 123",
      cidade: "São Paulo - SP",
      ultimaCompra: "15/03/2024",
      totalGasto: "R$ 1.450,00",
      status: "Ativo"
    },
    {
      id: 2,
      nome: "João Carlos Oliveira",
      email: "joao.carlos@email.com",
      telefone: "(11) 88888-8888",
      cpf: "987.654.321-00",
      endereco: "Av. Principal, 456",
      cidade: "São Paulo - SP",
      ultimaCompra: "08/03/2024",
      totalGasto: "R$ 890,00",
      status: "Ativo"
    },
    {
      id: 3,
      nome: "Ana Paula Costa",
      email: "ana.costa@email.com",
      telefone: "(11) 77777-7777",
      cpf: "456.789.123-00",
      endereco: "Rua Central, 789",
      cidade: "São Paulo - SP",
      ultimaCompra: "02/02/2024",
      totalGasto: "R$ 2.130,00",
      status: "VIP"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VIP": return "status-aprovado";
      case "Ativo": return "status-concluido";
      default: return "status-pendente";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e histórico de compras</p>
        </div>
        <Button className="erp-button-primary flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, email, telefone ou CPF..." 
                className="pl-9"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Clientes Cadastrados</span>
            <Badge variant="secondary">{clientes.length} clientes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                      <Badge className={getStatusColor(cliente.status)}>
                        {cliente.status}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {cliente.email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {cliente.telefone}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {cliente.endereco}, {cliente.cidade}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground">CPF: </span>
                          <span className="font-medium">{cliente.cpf}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Última Compra: </span>
                          <span className="font-medium">{cliente.ultimaCompra}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Gasto: </span>
                          <span className="font-medium text-primary">{cliente.totalGasto}</span>
                        </div>
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

export default Clientes;