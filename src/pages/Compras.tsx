import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  ShoppingBag,
  Plus,
  Search,
  Package,
  Truck,
  AlertTriangle,
  FileText,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  PackageCheck,
} from "lucide-react";
import { db } from "@/integrations/supabase/db";
import { useToast } from "@/hooks/use-toast";
import {
  usePurchaseOrders,
  purchaseOrderStatusLabel,
  purchaseOrderStatusColor,
  type PurchaseOrder,
  type PurchaseOrderItem,
  type PurchaseOrderStatus,
} from "@/hooks/usePurchaseOrders";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface ProductOption {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number;
  min_stock_level: number | null;
  cost_price: number | null;
  category: string | null;
}

interface SupplierOption {
  id: string;
  trade_name: string | null;
  company_name: string | null;
}

interface OrderItemDraft {
  product_id: string;
  product_name: string;
  quantity_ordered: number;
  unit_cost: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function supplierLabel(s: SupplierOption): string {
  return s.trade_name || s.company_name || s.id.slice(0, 8);
}

const STATUS_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  rascunho:         ["enviado", "cancelado"],
  enviado:          ["confirmado", "cancelado"],
  confirmado:       ["em_transito", "cancelado"],
  em_transito:      ["recebido_parcial", "recebido"],
  recebido_parcial: ["recebido"],
  recebido:         [],
  cancelado:        [],
};

// ─── Componente principal ─────────────────────────────────────────────────────

const Compras = () => {
  const { toast } = useToast();
  const { orders, loading: loadingOrders, load: loadOrders, createOrder, updateStatus, receiveOrder, deleteOrder } =
    usePurchaseOrders();

  // ── Dados de suporte ─────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loadingSupport, setLoadingSupport] = useState(false);

  const loadSupport = useCallback(async () => {
    setLoadingSupport(true);
    try {
      const [{ data: prods }, { data: supps }] = await Promise.all([
        db
          .from("products")
          .select("id, name, sku, stock_quantity, min_stock_level, cost_price, category")
          .eq("is_active", true)
          .order("name"),
        db.from("legal_persons").select("id, trade_name, company_name").eq("is_active", true),
      ]);
      setProducts(prods ?? []);
      setSuppliers(supps ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSupport(false);
    }
  }, []);

  useEffect(() => {
    loadSupport();
  }, [loadSupport]);

  // ── Métricas ──────────────────────────────────────────────────────────────
  const openOrders    = orders.filter((o) => !["recebido", "cancelado"].includes(o.status)).length;
  const totalValue    = orders.filter((o) => o.status !== "cancelado").reduce((s, o) => s + o.total, 0);
  const lowStockCount = products.filter(
    (p) => p.stock_quantity === 0 || (p.min_stock_level != null && p.stock_quantity <= p.min_stock_level)
  ).length;

  // ── Filtro da lista ───────────────────────────────────────────────────────
  const [searchOrders, setSearchOrders] = useState("");
  const [filterOrderStatus, setFilterOrderStatus] = useState<"todos" | PurchaseOrderStatus>("todos");

  const filteredOrders = orders.filter((o) => {
    const q = searchOrders.trim().toLowerCase();
    const num = (o.order_number ?? "").toLowerCase();
    const supp = supplierLabel((o.legal_persons as SupplierOption) ?? { id: "", trade_name: null, company_name: null }).toLowerCase();
    const matchQ = !q || num.includes(q) || supp.includes(q);
    const matchS = filterOrderStatus === "todos" || o.status === filterOrderStatus;
    return matchQ && matchS;
  });

  // ── Dialog: Novo Pedido ───────────────────────────────────────────────────
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newSupplierId, setNewSupplierId] = useState("");
  const [newOrderDate, setNewOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [newExpectedDate, setNewExpectedDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newOperator, setNewOperator] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItemDraft[]>([]);
  const [newItemProductId, setNewItemProductId] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");

  const filteredProductOptions = products.filter((p) => {
    const q = searchProduct.trim().toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.sku ?? "").toLowerCase().includes(q)
    );
  });

  const addItemToOrder = () => {
    const prod = products.find((p) => p.id === newItemProductId);
    if (!prod) {
      toast({ title: "Selecione um produto", variant: "destructive" });
      return;
    }
    const qty = parseInt(newItemQty, 10);
    const cost = parseFloat(newItemCost);
    if (!qty || qty <= 0) {
      toast({ title: "Informe uma quantidade válida", variant: "destructive" });
      return;
    }
    if (isNaN(cost) || cost < 0) {
      toast({ title: "Informe um custo unitário válido", variant: "destructive" });
      return;
    }
    if (orderItems.some((i) => i.product_id === prod.id)) {
      toast({ title: "Produto já adicionado ao pedido", variant: "destructive" });
      return;
    }
    setOrderItems((prev) => [
      ...prev,
      { product_id: prod.id, product_name: prod.name, quantity_ordered: qty, unit_cost: cost },
    ]);
    setNewItemProductId("");
    setNewItemQty("");
    setNewItemCost("");
    setSearchProduct("");
  };

  const removeItemFromOrder = (productId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const orderSubtotal = orderItems.reduce((s, i) => s + i.quantity_ordered * i.unit_cost, 0);

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast({ title: "Adicione pelo menos um item ao pedido", variant: "destructive" });
      return;
    }
    setSavingOrder(true);
    const result = await createOrder({
      supplier_id: newSupplierId || undefined,
      order_date: newOrderDate,
      expected_date: newExpectedDate || undefined,
      notes: newNotes || undefined,
      operator: newOperator || undefined,
      items: orderItems.map((i) => ({
        product_id: i.product_id,
        quantity_ordered: i.quantity_ordered,
        unit_cost: i.unit_cost,
      })),
    });
    setSavingOrder(false);
    if (result) {
      setShowNewOrder(false);
      setOrderItems([]);
      setNewSupplierId("");
      setNewNotes("");
      setNewExpectedDate("");
      setNewOperator("");
    }
  };

  // ── Dialog: Receber Pedido ────────────────────────────────────────────────
  const [showReceive, setShowReceive] = useState(false);
  const [receiveOrder_, setReceiveOrder_] = useState<PurchaseOrder | null>(null);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [receiveOperator, setReceiveOperator] = useState("");
  const [savingReceive, setSavingReceive] = useState(false);

  const openReceive = (order: PurchaseOrder) => {
    setReceiveOrder_(order);
    const init: Record<string, number> = {};
    (order.purchase_order_items ?? []).forEach((i) => {
      init[i.id] = Math.max(0, i.quantity_ordered - i.quantity_received);
    });
    setReceivedQtys(init);
    setReceiveOperator("");
    setShowReceive(true);
  };

  const handleReceive = async () => {
    if (!receiveOrder_) return;
    setSavingReceive(true);
    await receiveOrder(receiveOrder_, receivedQtys, receiveOperator || undefined);
    setSavingReceive(false);
    setShowReceive(false);
    setReceiveOrder_(null);
  };

  // ── Dialog: Visualizar Pedido ─────────────────────────────────────────────
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);

  // ── Produtos para repor ───────────────────────────────────────────────────
  const [searchRepor, setSearchRepor] = useState("");
  const replenishProducts = products.filter((p) => {
    const needsReplenishment =
      p.stock_quantity === 0 || (p.min_stock_level != null && p.stock_quantity <= p.min_stock_level);
    const q = searchRepor.trim().toLowerCase();
    const matchQ =
      !q || p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q);
    return needsReplenishment && matchQ;
  });

  const addReplenishToOrder = (p: ProductOption) => {
    setNewSupplierId("");
    setOrderItems([
      {
        product_id: p.id,
        product_name: p.name,
        quantity_ordered: Math.max(1, (p.min_stock_level ?? 5) - p.stock_quantity + (p.min_stock_level ?? 5)),
        unit_cost: p.cost_price ?? 0,
      },
    ]);
    setShowNewOrder(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compras</h1>
          <p className="text-muted-foreground">Pedidos de compra, recebimento e reposição de estoque</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadOrders(); loadSupport(); }}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
          <Button className="flex items-center gap-2" onClick={() => { setOrderItems([]); setShowNewOrder(true); }}>
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold text-primary">
                {loadingOrders ? "..." : orders.length}
              </div>
              <p className="text-sm text-muted-foreground">Total de Pedidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {loadingOrders ? "..." : openOrders}
              </div>
              <p className="text-sm text-muted-foreground">Pedidos em Aberto</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {loadingSupport ? "..." : lowStockCount}
              </div>
              <p className="text-sm text-muted-foreground">Produtos para Repor</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {loadingOrders
                  ? "..."
                  : totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <p className="text-sm text-muted-foreground">Total em Pedidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pedidos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pedidos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pedidos de Compra
            {orders.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{orders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="repor" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Para Repor
            {replenishProducts.length > 0 && (
              <Badge className="ml-1 text-xs bg-yellow-100 text-yellow-700">{replenishProducts.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab Pedidos ──────────────────────────────────────────────── */}
        <TabsContent value="pedidos">
          {/* Filtros */}
          <Card className="mb-4">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[180px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nº pedido ou fornecedor..."
                    className="pl-9"
                    value={searchOrders}
                    onChange={(e) => setSearchOrders(e.target.value)}
                  />
                </div>
                <Select
                  value={filterOrderStatus}
                  onValueChange={(v) => setFilterOrderStatus(v as typeof filterOrderStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    {(["rascunho","enviado","confirmado","em_transito","recebido_parcial","recebido","cancelado"] as PurchaseOrderStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{purchaseOrderStatusLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              {loadingOrders ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Carregando pedidos...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum pedido encontrado.</p>
                  <Button className="mt-4" onClick={() => { setOrderItems([]); setShowNewOrder(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro pedido
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const supplier = order.legal_persons
                      ? supplierLabel(order.legal_persons as SupplierOption)
                      : "Fornecedor não informado";
                    const items = order.purchase_order_items ?? [];
                    const canReceive = ["enviado","confirmado","em_transito","recebido_parcial"].includes(order.status);

                    return (
                      <div
                        key={order.id}
                        className="border border-border rounded-lg p-4 hover:bg-secondary/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">
                                {order.order_number ?? order.id.slice(0, 8)}
                              </p>
                              <Badge className={`text-xs ${purchaseOrderStatusColor(order.status)}`}>
                                {purchaseOrderStatusLabel(order.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{supplier}</p>
                            <p className="text-xs text-muted-foreground">
                              Emitido: {new Date(order.order_date).toLocaleDateString("pt-BR")}
                              {order.expected_date && (
                                <> · Previsão: {new Date(order.expected_date).toLocaleDateString("pt-BR")}</>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary text-lg">
                              {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                            <p className="text-xs text-muted-foreground">{items.length} item(s)</p>
                          </div>
                        </div>

                        {/* Itens resumidos */}
                        {items.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {items.slice(0, 3).map((i) => (
                              <Badge key={i.id} variant="outline" className="text-xs">
                                {i.products?.name ?? i.product_id.slice(0, 8)} ×{i.quantity_ordered}
                                {i.quantity_received > 0 && (
                                  <span className="text-green-600 ml-1">(rec: {i.quantity_received})</span>
                                )}
                              </Badge>
                            ))}
                            {items.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{items.length - 3} mais</Badge>
                            )}
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                          <Button variant="outline" size="sm" onClick={() => setViewOrder(order)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhe
                          </Button>

                          {canReceive && (
                            <Button size="sm" onClick={() => openReceive(order)}>
                              <PackageCheck className="h-3 w-3 mr-1" />
                              Receber
                            </Button>
                          )}

                          {STATUS_TRANSITIONS[order.status].map((next) => (
                            <Button
                              key={next}
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(order.id, next)}
                              className={
                                next === "cancelado"
                                  ? "text-red-600 border-red-200 hover:bg-red-50"
                                  : ""
                              }
                            >
                              {next === "cancelado" ? (
                                <><XCircle className="h-3 w-3 mr-1" />Cancelar</>
                              ) : (
                                <><CheckCircle2 className="h-3 w-3 mr-1" />{purchaseOrderStatusLabel(next)}</>
                              )}
                            </Button>
                          ))}

                          {order.status === "rascunho" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-red-50 ml-auto"
                              onClick={async () => {
                                if (confirm("Excluir este pedido?")) await deleteOrder(order.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab Para Repor ───────────────────────────────────────────── */}
        <TabsContent value="repor">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Produtos com Estoque Baixo ou em Ruptura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  className="pl-9"
                  value={searchRepor}
                  onChange={(e) => setSearchRepor(e.target.value)}
                />
              </div>

              {loadingSupport ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Carregando...
                </div>
              ) : replenishProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-60" />
                  <p>Nenhum produto precisa de reposição no momento.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {replenishProducts.map((p) => {
                    const isRupture = p.stock_quantity === 0;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Package className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Estoque: <strong>{p.stock_quantity}</strong> | Mínimo: {p.min_stock_level ?? "—"}
                              {p.category && <> | {p.category}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <Badge className={isRupture ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}>
                            {isRupture ? "Ruptura" : "Baixo"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addReplenishToOrder(p)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Pedir
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Dialog: Novo Pedido de Compra ─────────────────────────────── */}
      <Dialog open={showNewOrder} onOpenChange={setShowNewOrder}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Novo Pedido de Compra
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cabeçalho do pedido */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fornecedor</Label>
                <Select value={newSupplierId} onValueChange={setNewSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar fornecedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem fornecedor</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {supplierLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Operador</Label>
                <Input
                  placeholder="Nome do comprador"
                  value={newOperator}
                  onChange={(e) => setNewOperator(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Data do Pedido *</Label>
                <Input
                  type="date"
                  value={newOrderDate}
                  onChange={(e) => setNewOrderDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Previsão de Entrega</Label>
                <Input
                  type="date"
                  value={newExpectedDate}
                  onChange={(e) => setNewExpectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                rows={2}
                placeholder="Condições, prazo, número de cotação..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>

            <Separator />

            {/* Adicionar item */}
            <div>
              <Label className="text-base font-semibold">Itens do Pedido</Label>
              <div className="mt-3 grid sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Produto</Label>
                  <div className="space-y-1">
                    <Input
                      placeholder="Buscar produto..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="mb-1"
                    />
                    <Select value={newItemProductId} onValueChange={(v) => {
                      setNewItemProductId(v);
                      const p = products.find((x) => x.id === v);
                      if (p && !newItemCost) setNewItemCost((p.cost_price ?? 0).toString());
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProductOptions.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} (est: {p.stock_quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Qtd</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qtd"
                    className="w-20"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Custo Unit.</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="R$"
                    className="w-28"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={addItemToOrder} className="mt-auto">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista de itens */}
            {orderItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-2 font-medium">Produto</th>
                      <th className="text-right p-2 font-medium">Qtd</th>
                      <th className="text-right p-2 font-medium">Custo Unit.</th>
                      <th className="text-right p-2 font-medium">Subtotal</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orderItems.map((item) => (
                      <tr key={item.product_id}>
                        <td className="p-2">{item.product_name}</td>
                        <td className="p-2 text-right">{item.quantity_ordered}</td>
                        <td className="p-2 text-right">
                          {item.unit_cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-2 text-right font-medium">
                          {(item.quantity_ordered * item.unit_cost).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeItemFromOrder(item.product_id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-secondary/30">
                    <tr>
                      <td colSpan={3} className="p-2 font-semibold text-right">Total</td>
                      <td className="p-2 font-bold text-primary text-right">
                        {orderSubtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowNewOrder(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOrder} disabled={savingOrder || orderItems.length === 0}>
              {savingOrder ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Criando...</>
              ) : (
                <><FileText className="h-4 w-4 mr-2" />Criar Pedido</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Receber Pedido ─────────────────────────────────────── */}
      <Dialog open={showReceive} onOpenChange={setShowReceive}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              Receber Pedido{" "}
              {receiveOrder_?.order_number ?? receiveOrder_?.id.slice(0, 8) ?? ""}
            </DialogTitle>
          </DialogHeader>

          {receiveOrder_ && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Informe as quantidades efetivamente recebidas. Serão criadas movimentações de
                estoque tipo <strong>Entrada</strong> para cada item com quantidade &gt; 0.
              </p>

              <div className="space-y-3">
                {(receiveOrder_.purchase_order_items ?? []).map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.products?.name ?? item.product_id}</p>
                        <p className="text-xs text-muted-foreground">
                          Pedido: {item.quantity_ordered} | Já recebido: {item.quantity_received} | Pendente:{" "}
                          {Math.max(0, item.quantity_ordered - item.quantity_received)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Est. atual: {item.products?.stock_quantity ?? "—"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">Qtd recebida agora:</Label>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity_ordered - item.quantity_received}
                        className="h-8 w-24 text-sm"
                        value={receivedQtys[item.id] ?? 0}
                        onChange={(e) =>
                          setReceivedQtys((prev) => ({
                            ...prev,
                            [item.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Operador</Label>
                <Input
                  placeholder="Quem está recebendo a mercadoria"
                  value={receiveOperator}
                  onChange={(e) => setReceiveOperator(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReceive(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReceive} disabled={savingReceive}>
              {savingReceive ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processando...</>
              ) : (
                <><PackageCheck className="h-4 w-4 mr-2" />Confirmar Recebimento</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Detalhe do Pedido ──────────────────────────────────── */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Pedido {viewOrder?.order_number ?? viewOrder?.id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          {viewOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={`mt-1 ${purchaseOrderStatusColor(viewOrder.status)}`}>
                    {purchaseOrderStatusLabel(viewOrder.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Fornecedor</p>
                  <p className="font-medium mt-1">
                    {viewOrder.legal_persons
                      ? supplierLabel(viewOrder.legal_persons as SupplierOption)
                      : "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emissão</p>
                  <p className="font-medium">{new Date(viewOrder.order_date).toLocaleDateString("pt-BR")}</p>
                </div>
                {viewOrder.expected_date && (
                  <div>
                    <p className="text-muted-foreground">Previsão</p>
                    <p className="font-medium">
                      {new Date(viewOrder.expected_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                {viewOrder.received_date && (
                  <div>
                    <p className="text-muted-foreground">Recebido em</p>
                    <p className="font-medium text-green-600">
                      {new Date(viewOrder.received_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                {viewOrder.operator && (
                  <div>
                    <p className="text-muted-foreground">Operador</p>
                    <p className="font-medium">{viewOrder.operator}</p>
                  </div>
                )}
              </div>

              {viewOrder.notes && (
                <div>
                  <p className="text-muted-foreground">Observações</p>
                  <p className="mt-1 bg-secondary/50 rounded p-2">{viewOrder.notes}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="font-semibold mb-2">Itens</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left pb-1">Produto</th>
                      <th className="text-right pb-1">Ped.</th>
                      <th className="text-right pb-1">Rec.</th>
                      <th className="text-right pb-1">Custo</th>
                      <th className="text-right pb-1">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(viewOrder.purchase_order_items ?? []).map((i) => (
                      <tr key={i.id}>
                        <td className="py-1.5">{i.products?.name ?? i.product_id}</td>
                        <td className="py-1.5 text-right">{i.quantity_ordered}</td>
                        <td className={`py-1.5 text-right ${i.quantity_received > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                          {i.quantity_received}
                        </td>
                        <td className="py-1.5 text-right">
                          {i.unit_cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="py-1.5 text-right font-medium">
                          {i.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="pt-2 text-right font-semibold">Total</td>
                      <td className="pt-2 text-right font-bold text-primary">
                        {viewOrder.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOrder(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compras;
