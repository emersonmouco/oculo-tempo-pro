import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingBag,
  Plus,
  Search,
  Package,
  Truck,
  FileText,
  AlertTriangle,
} from "lucide-react";

const Compras = () => {
  const [products, setProducts] = useState<{ id: string; name: string; stock_quantity: number; min_stock_level: number | null; category: string | null }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock_quantity, min_stock_level, category")
        .eq("is_active", true);

      if (error) throw error;
      const list = data || [];
      setProducts(list);
      const low = list.filter(
        (p) => p.stock_quantity === 0 || (p.min_stock_level != null && p.stock_quantity <= p.min_stock_level)
      ).length;
      setLowStockCount(low);
    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produtosParaRepor = filteredProducts.filter(
    (p) => p.stock_quantity === 0 || (p.min_stock_level != null && p.stock_quantity <= p.min_stock_level)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compras</h1>
          <p className="text-muted-foreground">Pedidos de compra e reposição de estoque</p>
        </div>
        <Button className="erp-button-primary flex items-center gap-2" asChild>
          <Link to="/fornecedores">
            <Plus className="h-4 w-4" />
            Novo Pedido de Compra
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{products.length}</div>
            <p className="text-sm text-muted-foreground">Produtos Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
            <p className="text-sm text-muted-foreground">Produtos em Baixo Estoque</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {produtosParaRepor.filter((p) => p.stock_quantity === 0).length}
            </div>
            <p className="text-sm text-muted-foreground">Em Ruptura</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pedidos em aberto</span>
            </div>
            <p className="text-2xl font-bold mt-1">-</p>
          </CardContent>
        </Card>
      </div>

      {produtosParaRepor.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Produtos que Precisam de Reposição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-3">
              {produtosParaRepor.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {p.stock_quantity} | Mínimo: {p.min_stock_level ?? "-"}
                      </p>
                    </div>
                  </div>
                  <Badge className={p.stock_quantity === 0 ? "status-cancelado" : "status-pendente"}>
                    {p.stock_quantity === 0 ? "Ruptura" : "Baixo"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Pedir
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-12 text-muted-foreground">
            Módulo de pedidos de compra em desenvolvimento. Os produtos em baixo estoque acima podem ser usados para gerar pedidos aos fornecedores.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Compras;
