import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Boxes,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  SlidersHorizontal,
  Loader2,
  TrendingDown,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { db } from "@/integrations/supabase/db";
import { useToast } from "@/hooks/use-toast";
import { isMissingRelationError, STOCK_SCHEMA_SETUP_HINT } from "@/lib/supabasePostgrest";
import {
  useStockMovements,
  movementTypeLabel,
  movementTypeColor,
  calcNewQuantity,
  type MovementType,
  type CreateMovementInput,
} from "@/hooks/useStockMovements";

// ─── Tipos locais ────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  category: string | null;
  stock_quantity: number;
  min_stock_level: number | null;
  cost_price: number | null;
  sale_price: number;
  updated_at: string;
}

type StockStatus = "ok" | "baixo" | "ruptura";

function getStockStatus(p: Product): StockStatus {
  if (p.stock_quantity === 0) return "ruptura";
  if (p.min_stock_level != null && p.stock_quantity <= p.min_stock_level) return "baixo";
  return "ok";
}

function StockBadge({ status }: { status: StockStatus }) {
  if (status === "ruptura")
    return <Badge className="bg-red-100 text-red-700 border-red-200">Ruptura</Badge>;
  if (status === "baixo")
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Baixo</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-200">Normal</Badge>;
}

// ─── Componente principal ────────────────────────────────────────────────────

const MOVEMENT_OPTIONS: { value: MovementType; label: string; icon: React.ReactNode }[] = [
  { value: "entrada",             label: "Entrada (compra/recebimento)",      icon: <ArrowUpCircle className="h-4 w-4 text-green-500" /> },
  { value: "ajuste_positivo",     label: "Ajuste positivo (inventário)",       icon: <ArrowUpCircle className="h-4 w-4 text-green-500" /> },
  { value: "devolucao_cliente",   label: "Devolução de cliente",               icon: <ArrowUpCircle className="h-4 w-4 text-green-500" /> },
  { value: "saida",               label: "Saída manual",                       icon: <ArrowDownCircle className="h-4 w-4 text-red-500" /> },
  { value: "ajuste_negativo",     label: "Ajuste negativo (avaria/perda)",     icon: <ArrowDownCircle className="h-4 w-4 text-red-500" /> },
  { value: "devolucao_fornecedor",label: "Devolução ao fornecedor",            icon: <ArrowDownCircle className="h-4 w-4 text-red-500" /> },
];

const Estoque = () => {
  const { toast } = useToast();

  // ── Produtos ───────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | StockStatus>("todos");
  const [filterCategory, setFilterCategory] = useState("todos");

  // ── Movimentações ──────────────────────────────────────────────────────────
  const { movements, loading: loadingMovements, load: loadMovements } = useStockMovements();

  // ── Dialog de ajuste ───────────────────────────────────────────────────────
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjProduct, setAdjProduct] = useState<Product | null>(null);
  const [adjType, setAdjType] = useState<MovementType>("entrada");
  const [adjQty, setAdjQty] = useState("");
  const [adjNotes, setAdjNotes] = useState("");
  const [adjOperator, setAdjOperator] = useState("");
  const [savingAdj, setSavingAdj] = useState(false);

  // ── Carrega produtos ───────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await db
        .from("products")
        .select("id, name, sku, brand, category, stock_quantity, min_stock_level, cost_price, sale_price, updated_at")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      setProducts(data ?? []);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao carregar produtos", variant: "destructive" });
    } finally {
      setLoadingProducts(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ── Métricas ───────────────────────────────────────────────────────────────
  const totalItems   = products.reduce((s, p) => s + p.stock_quantity, 0);
  const lowCount     = products.filter((p) => getStockStatus(p) === "baixo").length;
  const ruptureCount = products.filter((p) => getStockStatus(p) === "ruptura").length;
  const stockValue   = products.reduce((s, p) => s + p.stock_quantity * (p.cost_price ?? 0), 0);

  const categories = ["todos", ...Array.from(new Set(products.map((p) => p.category ?? "").filter(Boolean)))];

  // ── Filtragem ──────────────────────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.sku ?? "").toLowerCase().includes(q) ||
      (p.brand ?? "").toLowerCase().includes(q) ||
      (p.category ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "todos" || getStockStatus(p) === filterStatus;
    const matchCat = filterCategory === "todos" || p.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const alertProducts = products.filter((p) => getStockStatus(p) !== "ok");

  // ── Handlers do dialog de ajuste ───────────────────────────────────────────
  const openAdjust = (p: Product) => {
    setAdjProduct(p);
    setAdjType("entrada");
    setAdjQty("");
    setAdjNotes("");
    setAdjOperator("");
    setShowAdjustDialog(true);
  };

  const saveAdjustment = async () => {
    if (!adjProduct) return;
    const qty = parseInt(adjQty, 10);
    if (!qty || qty <= 0) {
      toast({ title: "Informe uma quantidade válida (> 0)", variant: "destructive" });
      return;
    }

    setSavingAdj(true);
    try {
      const newQty = calcNewQuantity(adjType, adjProduct.stock_quantity, qty);
      if (newQty < 0) {
        toast({
          title: "Estoque insuficiente",
          description: `Saldo atual: ${adjProduct.stock_quantity}. Não é possível retirar ${qty}.`,
          variant: "destructive",
        });
        return;
      }

      const input: CreateMovementInput = {
        product_id: adjProduct.id,
        movement_type: adjType,
        quantity: qty,
        previous_quantity: adjProduct.stock_quantity,
        reference_type: "ajuste",
        notes: adjNotes || undefined,
        operator: adjOperator || undefined,
      };

      // Insert movement
      const { error: movErr } = await db.from("stock_movements").insert({
        product_id: input.product_id,
        movement_type: input.movement_type,
        quantity: input.quantity,
        previous_quantity: input.previous_quantity,
        new_quantity: newQty,
        reference_type: input.reference_type ?? null,
        notes: input.notes ?? null,
        operator: input.operator ?? null,
      });
      if (movErr) throw movErr;

      // Update product
      const { error: prodErr } = await db
        .from("products")
        .update({ stock_quantity: newQty, updated_at: new Date().toISOString() })
        .eq("id", adjProduct.id);
      if (prodErr) throw prodErr;

      toast({
        title: "Movimentação registrada!",
        description: `${adjProduct.name}: ${adjProduct.stock_quantity} → ${newQty}`,
      });

      setShowAdjustDialog(false);
      await Promise.all([loadProducts(), loadMovements()]);
    } catch (e) {
      console.error(e);
      toast({
        title: isMissingRelationError(e)
          ? "Tabela de movimentações não existe no Supabase"
          : "Erro ao registrar movimentação",
        description: isMissingRelationError(e) ? STOCK_SCHEMA_SETUP_HINT : undefined,
        variant: "destructive",
      });
    } finally {
      setSavingAdj(false);
    }
  };

  const adjPreview =
    adjProduct && adjQty
      ? calcNewQuantity(adjType, adjProduct.stock_quantity, parseInt(adjQty, 10) || 0)
      : null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
          <p className="text-muted-foreground">Movimentações, ajustes e níveis de estoque em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { loadProducts(); loadMovements(); }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Boxes className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold text-primary">
                {loadingProducts ? "..." : totalItems.toLocaleString("pt-BR")}
              </div>
              <p className="text-sm text-muted-foreground">Itens em Estoque</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {loadingProducts ? "..." : lowCount}
              </div>
              <p className="text-sm text-muted-foreground">Estoque Baixo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <div className="text-2xl font-bold text-destructive">
                {loadingProducts ? "..." : ruptureCount}
              </div>
              <p className="text-sm text-muted-foreground">Em Ruptura</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {loadingProducts
                  ? "..."
                  : stockValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-sm text-muted-foreground">Valor em Custo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {!loadingProducts && alertProducts.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 text-base">
              <AlertTriangle className="h-5 w-5" />
              Produtos que precisam de atenção ({alertProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alertProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-background rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Atual: <strong>{p.stock_quantity}</strong> | Mín: {p.min_stock_level ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <StockBadge status={getStockStatus(p)} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2"
                      onClick={() => openAdjust(p)}
                    >
                      Ajustar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, SKU, marca..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
              <SelectTrigger className="w-[160px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ok">Normal</SelectItem>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="ruptura">Ruptura</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "todos" ? "Todas categorias" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="produtos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
            {filteredProducts.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{filteredProducts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="movimentacoes" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Movimentações
            {movements.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{movements.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab Produtos ────────────────────────────────────────────── */}
        <TabsContent value="produtos">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Produtos em Estoque</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredProducts.length} de {products.length} produto(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Carregando produtos...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum produto encontrado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium">Produto</th>
                        <th className="text-left py-2 pr-4 font-medium hidden md:table-cell">Categoria</th>
                        <th className="text-right py-2 pr-4 font-medium">Qtd Atual</th>
                        <th className="text-right py-2 pr-4 font-medium hidden sm:table-cell">Mínimo</th>
                        <th className="text-right py-2 pr-4 font-medium hidden lg:table-cell">Custo Unit.</th>
                        <th className="text-right py-2 pr-4 font-medium hidden lg:table-cell">Vlr. Custo</th>
                        <th className="text-center py-2 pr-4 font-medium">Status</th>
                        <th className="text-right py-2 font-medium">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredProducts.map((p) => {
                        const status = getStockStatus(p);
                        return (
                          <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                            <td className="py-3 pr-4">
                              <p className="font-medium">{p.name}</p>
                              {p.sku && (
                                <p className="text-xs text-muted-foreground">{p.sku}</p>
                              )}
                            </td>
                            <td className="py-3 pr-4 hidden md:table-cell text-muted-foreground">
                              {p.category ?? "—"}
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <span
                                className={
                                  status === "ruptura"
                                    ? "font-bold text-red-600"
                                    : status === "baixo"
                                    ? "font-bold text-yellow-600"
                                    : "font-semibold"
                                }
                              >
                                {p.stock_quantity}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right hidden sm:table-cell text-muted-foreground">
                              {p.min_stock_level ?? "—"}
                            </td>
                            <td className="py-3 pr-4 text-right hidden lg:table-cell text-muted-foreground">
                              {p.cost_price != null
                                ? p.cost_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                : "—"}
                            </td>
                            <td className="py-3 pr-4 text-right hidden lg:table-cell text-muted-foreground">
                              {p.cost_price != null
                                ? (p.stock_quantity * p.cost_price).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })
                                : "—"}
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <StockBadge status={status} />
                            </td>
                            <td className="py-3 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAdjust(p)}
                                className="text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Ajustar
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab Movimentações ───────────────────────────────────────── */}
        <TabsContent value="movimentacoes">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMovements ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Carregando movimentações...</span>
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma movimentação registrada.</p>
                  <p className="text-xs mt-1">Use o botão "Ajustar" em um produto para criar a primeira movimentação.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium">Data</th>
                        <th className="text-left py-2 pr-4 font-medium">Produto</th>
                        <th className="text-left py-2 pr-4 font-medium">Tipo</th>
                        <th className="text-right py-2 pr-4 font-medium">Qtd</th>
                        <th className="text-right py-2 pr-4 font-medium hidden sm:table-cell">Anterior</th>
                        <th className="text-right py-2 pr-4 font-medium hidden sm:table-cell">Novo Saldo</th>
                        <th className="text-left py-2 pr-4 font-medium hidden md:table-cell">Observação</th>
                        <th className="text-left py-2 font-medium hidden lg:table-cell">Operador</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {movements.map((m) => {
                        const isPositive = ["entrada", "ajuste_positivo", "devolucao_cliente"].includes(
                          m.movement_type
                        );
                        return (
                          <tr key={m.id} className="hover:bg-secondary/40 transition-colors">
                            <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                              {new Date(m.created_at).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3 pr-4">
                              <p className="font-medium">{m.products?.name ?? m.product_id}</p>
                              {m.products?.sku && (
                                <p className="text-xs text-muted-foreground">{m.products.sku}</p>
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className={`text-xs font-medium ${movementTypeColor(m.movement_type)}`}
                              >
                                {movementTypeLabel(m.movement_type)}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right font-bold">
                              <span className={isPositive ? "text-green-600" : "text-red-500"}>
                                {isPositive ? "+" : "-"}
                                {m.quantity}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right text-muted-foreground hidden sm:table-cell">
                              {m.previous_quantity}
                            </td>
                            <td className="py-3 pr-4 text-right font-semibold hidden sm:table-cell">
                              {m.new_quantity}
                            </td>
                            <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                              {m.notes ?? "—"}
                            </td>
                            <td className="py-3 text-muted-foreground hidden lg:table-cell">
                              {m.operator ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Dialog: Ajuste de Estoque ────────────────────────────────── */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Ajustar Estoque
            </DialogTitle>
          </DialogHeader>

          {adjProduct && (
            <div className="space-y-4">
              {/* Produto selecionado */}
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="font-semibold">{adjProduct.name}</p>
                {adjProduct.sku && (
                  <p className="text-xs text-muted-foreground">SKU: {adjProduct.sku}</p>
                )}
                <p className="text-sm mt-1">
                  Saldo atual:{" "}
                  <strong className={adjProduct.stock_quantity === 0 ? "text-red-600" : ""}>
                    {adjProduct.stock_quantity}
                  </strong>
                </p>
              </div>

              {/* Tipo */}
              <div className="space-y-1.5">
                <Label>Tipo de movimentação *</Label>
                <Select value={adjType} onValueChange={(v) => setAdjType(v as MovementType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantidade */}
              <div className="space-y-1.5">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex.: 5"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                />
                {adjPreview !== null && (
                  <p className="text-xs text-muted-foreground">
                    Novo saldo:{" "}
                    <strong
                      className={
                        adjPreview < 0 ? "text-red-600" : adjPreview === 0 ? "text-yellow-600" : ""
                      }
                    >
                      {adjPreview}
                    </strong>
                    {adjPreview < 0 && " — saldo negativo não permitido"}
                  </p>
                )}
              </div>

              {/* Operador */}
              <div className="space-y-1.5">
                <Label>Operador / responsável</Label>
                <Input
                  placeholder="Nome de quem está fazendo o ajuste"
                  value={adjOperator}
                  onChange={(e) => setAdjOperator(e.target.value)}
                />
              </div>

              {/* Observação */}
              <div className="space-y-1.5">
                <Label>Observação</Label>
                <Textarea
                  placeholder="Motivo do ajuste, número de NF, etc."
                  rows={2}
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveAdjustment}
              disabled={savingAdj || !adjQty || (adjPreview !== null && adjPreview < 0)}
            >
              {savingAdj ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Confirmar Ajuste"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estoque;
