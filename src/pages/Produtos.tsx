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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/forms/ProductForm";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Package,
  Barcode,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Glasses,
  Watch
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  material?: string;
  sale_price: number;
  stock_quantity: number;
  min_stock_level?: number;
  is_active: boolean;
}

const PAGE_SIZE = 10;

const Produtos = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm);

    const matchesCategory = activeTab === "all" || product.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab]);

  const getEstoqueColor = (estoque: number, minimo?: number) => {
    if (estoque === 0) return "status-cancelado";
    if (minimo && estoque <= minimo) return "status-pendente";
    if (estoque <= 5) return "status-pendente";
    return "status-aprovado";
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
        <ProductForm onSuccess={() => {
          setShowForm(false);
          loadProducts();
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">Gerencie armações, lentes e relógios</p>
        </div>
        <Button 
          className="erp-button-primary flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por SKU, marca, modelo..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Produtos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="armacao" className="flex items-center gap-2">
            <Glasses className="h-4 w-4" />
            Armações
          </TabsTrigger>
          <TabsTrigger value="lente" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Lentes
          </TabsTrigger>
          <TabsTrigger value="relogio" className="flex items-center gap-2">
            <Watch className="h-4 w-4" />
            Relógios
          </TabsTrigger>
          <TabsTrigger value="acessorio" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Acessórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Produtos Cadastrados</span>
                <Badge variant="secondary">{filteredProducts.length} produtos</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Carregando produtos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhum produto encontrado com os critérios de busca." : "Nenhum produto cadastrado ainda."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="font-medium">
                                {product.brand && product.model 
                                  ? `${product.brand} ${product.model}` 
                                  : product.name}
                              </div>
                              {product.color && (
                                <div className="text-xs text-muted-foreground">{product.color}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              {product.category && (
                                <Badge variant="outline" className="capitalize">
                                  {product.category}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{product.sku || "-"}</TableCell>
                            <TableCell>
                              <Badge className={getEstoqueColor(product.stock_quantity, product.min_stock_level)}>
                                {product.stock_quantity}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-primary">
                              R$ {product.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <span className={product.is_active ? 'text-green-600' : 'text-red-600'}>
                                {product.is_active ? 'Ativo' : 'Inativo'}
                              </span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Produtos;