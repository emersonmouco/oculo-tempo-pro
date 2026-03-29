import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { 
  ShoppingCart, 
  Search,
  Eye,
  Printer,
  Calculator
} from "lucide-react";
import { format } from "date-fns";

interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products: { name: string; brand?: string; model?: string } | null;
}

interface Sale {
  id: string;
  sale_number: string | null;
  person_id: string | null;
  total: number;
  status: string;
  payment_method: string | null;
  payment_details: string | null;
  seller_name: string | null;
  created_at: string;
  persons: { name: string } | null;
  sale_items: SaleItem[];
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao_debito: "Cartão Débito",
  cartao_credito: "Cartão Crédito",
  parcelado: "Parcelado",
  boleto: "Boleto",
};

const PAGE_SIZE = 10;

const Vendas = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({
    vendasHoje: 0,
    transacoesHoje: 0,
    ticketMedio: 0,
  });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setIsLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: todayData } = await db
        .from("sales")
        .select("id, total")
        .eq("status", "finalizada")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`);

      const todaySales = todayData || [];
      const vendasHoje = todaySales.reduce((acc, s) => acc + Number(s.total), 0);
      const transacoesHoje = todaySales.length;
      const ticketMedio = transacoesHoje > 0 ? vendasHoje / transacoesHoje : 0;

      setStats({ vendasHoje, transacoesHoje, ticketMedio });

      const { data, error } = await supabase
        .from("sales")
        .select(`
          id,
          sale_number,
          person_id,
          total,
          status,
          payment_method,
          payment_details,
          seller_name,
          created_at,
          persons (name),
          sale_items (
            id,
            product_id,
            quantity,
            unit_price,
            subtotal,
            products (name, brand, model)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      (s.sale_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.persons?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSales.length / PAGE_SIZE);
  const paginatedSales = filteredSales.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finalizada":
        return "status-concluido";
      case "pendente":
        return "status-pendente";
      case "cancelada":
        return "status-cancelado";
      default:
        return "status-pendente";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      finalizada: "Finalizada",
      pendente: "Pendente",
      cancelada: "Cancelada",
    };
    return labels[status] || status;
  };

  const getProductNames = (items: SaleItem[]) => {
    return items
      .map((i) =>
        i.products?.brand && i.products?.model
          ? `${i.products.brand} ${i.products.model}`
          : i.products?.name || "Produto"
      )
      .join(", ");
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
          <Button asChild className="erp-button-primary flex items-center gap-2">
            <Link to="/pdv">
              <ShoppingCart className="h-4 w-4" />
              Nova Venda
            </Link>
          </Button>
        </div>
      </div>

      {/* Resumo do Dia */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              R$ {stats.vendasHoje.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Vendas Hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{stats.transacoesHoje}</div>
            <p className="text-sm text-muted-foreground">Transações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              R$ {stats.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{sales.length}</div>
            <p className="text-sm text-muted-foreground">Total (últimas 50)</p>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={loadSales}>
                Atualizar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando vendas...</div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Nenhuma venda encontrada." : "Nenhuma venda registrada ainda."}
              </p>
              <Button asChild className="erp-button-primary">
                <Link to="/pdv">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Nova Venda
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Venda / Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Produtos</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.map((venda) => (
                      <TableRow key={venda.id}>
                        <TableCell>
                          <div className="font-medium">
                            {venda.sale_number || venda.id.slice(0, 8)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {venda.persons?.name || "Cliente não informado"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(venda.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-sm">
                          {getProductNames(venda.sale_items || [])}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          R$ {Number(venda.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {PAYMENT_LABELS[venda.payment_method || ""] || venda.payment_method || "-"}
                          {venda.payment_details ? ` (${venda.payment_details})` : ""}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(venda.status)}>
                            {getStatusLabel(venda.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Printer className="h-4 w-4" />
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

      {/* Orçamentos - placeholder até implementar tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Módulo de orçamentos em desenvolvimento.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vendas;
