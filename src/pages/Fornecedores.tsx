import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { db } from "@/integrations/supabase/db";
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

const PAGE_SIZE = 10;

const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadFornecedores();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const loadFornecedores = async () => {
    try {
      const { data, error } = await db
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

  const totalPages = Math.ceil(filteredFornecedores.length / PAGE_SIZE);
  const paginatedFornecedores = filteredFornecedores.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
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
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome / Contato</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFornecedores.map((fornecedor) => (
                      <TableRow key={fornecedor.id}>
                        <TableCell>
                          <div className="font-medium">{fornecedor.persons.name}</div>
                          {fornecedor.persons.email && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {fornecedor.persons.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {fornecedor.company_name}
                          {fornecedor.trade_name && fornecedor.trade_name !== fornecedor.company_name && (
                            <span className="text-muted-foreground text-sm"> ({fornecedor.trade_name})</span>
                          )}
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {fornecedor.persons.mobile_phone}
                        </TableCell>
                        <TableCell>{fornecedor.cnpj || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(fornecedor.is_active)}>
                            {getStatusText(fornecedor.is_active)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {(() => {
                      const start = Math.max(1, page - 2);
                      const end = Math.min(totalPages, start + 4);
                      return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => { e.preventDefault(); setPage(p); }}
                            isActive={page === p}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ));
                    })()}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Fornecedores;
