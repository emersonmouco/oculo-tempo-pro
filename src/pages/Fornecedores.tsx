import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ClientForm } from "@/components/forms/ClientForm";
import { 
  Search, 
  UserPlus, 
  Eye, 
  Edit, 
  Phone, 
  Mail,
  ArrowLeft
} from "lucide-react";

interface Fornecedor {
  id: string;
  person_id: string;
  company_name: string;
  trade_name?: string;
  cnpj?: string;
  is_active: boolean;
  persons: {
    name: string;
    email?: string;
    mobile_phone: string;
    phone?: string;
    birth_date: string;
  };
}

const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadFornecedores();
  }, []);

  const loadFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_persons")
        .select(`
          id,
          person_id,
          company_name,
          trade_name,
          cnpj,
          is_active,
          persons (
            name,
            email,
            mobile_phone,
            phone,
            birth_date
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error) {
      console.error("Error loading fornecedores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.persons.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.persons.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.persons.mobile_phone.includes(searchTerm) ||
    fornecedor.cnpj?.includes(searchTerm)
  );

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "status-concluido" : "status-cancelado";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Ativo" : "Inativo";
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <ClientForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground">Gerencie seus fornecedores cadastrados</p>
        </div>
        <Button 
          className="erp-button-primary flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <UserPlus className="h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar fornecedores..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Fornecedores Cadastrados</span>
            <Badge variant="secondary">{filteredFornecedores.length} fornecedores</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando fornecedores...</p>
            </div>
          ) : filteredFornecedores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum fornecedor encontrado com os critérios de busca." : "Nenhum fornecedor cadastrado ainda."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFornecedores.map((fornecedor) => (
                <div key={fornecedor.id} className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{fornecedor.persons.name}</h3>
                        <Badge className={getStatusColor(fornecedor.is_active)}>
                          {getStatusText(fornecedor.is_active)}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-foreground">
                          {fornecedor.company_name}
                          {fornecedor.trade_name && fornecedor.trade_name !== fornecedor.company_name && (
                            <span className="text-muted-foreground"> ({fornecedor.trade_name})</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          {fornecedor.persons.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              {fornecedor.persons.email}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {fornecedor.persons.mobile_phone}
                          </div>
                          {fornecedor.persons.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              {fornecedor.persons.phone}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {fornecedor.cnpj && (
                            <div>
                              <span className="text-muted-foreground">CNPJ: </span>
                              <span className="font-medium">{fornecedor.cnpj}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Nascimento: </span>
                            <span className="font-medium">
                              {new Date(fornecedor.persons.birth_date).toLocaleDateString('pt-BR')}
                            </span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Fornecedores;
