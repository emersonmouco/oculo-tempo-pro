import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { db } from "@/integrations/supabase/db";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  User,
  CreditCard,
  Percent,
  DollarSign,
  AlertTriangle,
  UserCheck,
  Receipt,
  ClipboardList,
  Loader2,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  brand?: string | null;
  model?: string | null;
  sale_price: number;
  stock_quantity: number;
  min_stock_level?: number | null;
  is_active: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Person {
  id: string;
  name: string;
  mobile_phone: string;
  email?: string | null;
}

interface PendingSaleListItem {
  id: string;
  sale_number: string | null;
  created_at: string;
  total: number;
  seller_name: string | null;
  persons: { name: string } | null;
  sale_items: { id: string }[];
}

const PAYMENT_METHODS = [
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_debito", label: "Cartão Débito" },
  { value: "cartao_credito", label: "Cartão Crédito" },
  { value: "parcelado", label: "Parcelado" },
  { value: "boleto", label: "Boleto" },
  { value: "duplicata", label: "Duplicata" },
  { value: "cheque", label: "Cheque" },
  { value: "crediario", label: "Crediário" },
  { value: "transferencia", label: "Transferência Bancária" },
];

const PDV = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pendingSales, setPendingSales] = useState<PendingSaleListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activePresaleId, setActivePresaleId] = useState<string | null>(null);
  const [loadingPresale, setLoadingPresale] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Person | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [discountType, setDiscountType] = useState<"value" | "percent">("value");
  const [discountInput, setDiscountInput] = useState("");
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const loadProductsByIds = useCallback(async (ids: string[]): Promise<Map<string, Product>> => {
    if (ids.length === 0) return new Map();
    const { data, error } = await db
      .from("products")
      .select("id, name, sku, barcode, category, brand, model, sale_price, stock_quantity, min_stock_level, is_active")
      .in("id", ids);
    if (error) {
      console.error("Erro ao carregar produtos:", error);
      return new Map();
    }
    const map = new Map<string, Product>();
    (data || []).forEach((p) => map.set(p.id, p as Product));
    return map;
  }, []);

  const loadPendingSales = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data, error } = await db
        .from("sales")
        .select(
          `
          id,
          sale_number,
          created_at,
          total,
          seller_name,
          persons (name),
          sale_items (id)
        `
        )
        .eq("status", "pendente")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingSales((data as PendingSaleListItem[]) || []);
    } catch (e) {
      console.error("Erro ao carregar pré-vendas:", e);
      setPendingSales([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadPersons = useCallback(async () => {
    const { data, error } = await db.from("persons").select("id, name, mobile_phone, email").order("name");
    if (!error) setPersons(data || []);
  }, []);

  useEffect(() => {
    loadPendingSales();
    loadPersons();
  }, [loadPendingSales, loadPersons]);

  const filteredPending = pendingSales.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const num = (s.sale_number || "").toLowerCase();
    const client = (s.persons?.name || "").toLowerCase();
    const seller = (s.seller_name || "").toLowerCase();
    return num.includes(q) || client.includes(q) || seller.includes(q);
  });

  const filteredPersons = persons.filter(
    (p) =>
      p.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      p.mobile_phone.includes(customerSearchQuery) ||
      p.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const isLowStock = (product: Product) =>
    product.min_stock_level != null && product.stock_quantity <= product.min_stock_level;

  const selectPresale = async (saleId: string) => {
    if (saleId === activePresaleId) return;
    setLoadingPresale(true);
    try {
      const { data: sale, error } = await db
        .from("sales")
        .select(
          `
          id,
          person_id,
          total,
          discount,
          seller_name,
          sale_items (
            product_id,
            quantity,
            unit_price,
            subtotal
          )
        `
        )
        .eq("id", saleId)
        .eq("status", "pendente")
        .single();

      if (error) throw error;
      if (!sale) {
        toast({ title: "Pré-venda não encontrada", variant: "destructive" });
        return;
      }

      const items = (sale.sale_items || []) as {
        product_id: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
      }[];

      const productIds = [...new Set(items.map((i) => i.product_id))];
      const productMap = await loadProductsByIds(productIds);

      const nextCart: CartItem[] = [];
      for (const row of items) {
        const product = productMap.get(row.product_id);
        if (!product) {
          toast({
            title: "Produto indisponível",
            description: "Um item desta pré-venda não foi encontrado no cadastro.",
            variant: "destructive",
          });
          continue;
        }
        nextCart.push({
          product,
          quantity: row.quantity,
          unitPrice: row.unit_price,
          subtotal: row.subtotal,
        });
      }

      if (nextCart.length === 0) {
        toast({ title: "Não foi possível carregar os itens", variant: "destructive" });
        return;
      }

      setActivePresaleId(saleId);
      setCart(nextCart);
      const discountVal = Number(sale.discount) || 0;
      if (discountVal > 0) {
        setDiscountType("value");
        setDiscountInput(discountVal.toFixed(2));
      } else {
        setDiscountInput("");
      }

      setSellerName(sale.seller_name || "");
      if (sale.person_id) {
        const { data: person } = await db.from("persons").select("id, name, mobile_phone, email").eq("id", sale.person_id).maybeSingle();
        setSelectedCustomer(person as Person | null);
      } else {
        setSelectedCustomer(null);
      }

      toast({ title: "Pré-venda carregada", description: "Revise o carrinho e finalize o pagamento." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao abrir pré-venda", variant: "destructive" });
    } finally {
      setLoadingPresale(false);
    }
  };

  const clearSelection = () => {
    setActivePresaleId(null);
    setCart([]);
    setSelectedCustomer(null);
    setSellerName("");
    setDiscountInput("");
    setPaymentMethod("");
    setPaymentDetails("");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((c) => c.product.id === productId);
      if (!item) return prev;
      const newQty = Math.max(0, item.quantity + delta);
      if (newQty === 0) return prev.filter((c) => c.product.id !== productId);
      if (newQty > item.product.stock_quantity) {
        toast({ title: "Estoque insuficiente", description: `Máximo: ${item.product.stock_quantity}`, variant: "destructive" });
        return prev;
      }
      return prev.map((c) =>
        c.product.id === productId ? { ...c, quantity: newQty, subtotal: newQty * c.unitPrice } : c
      );
    });
  };

  const updateUnitPrice = (productId: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((c) =>
        c.product.id === productId ? { ...c, unitPrice: newPrice, subtotal: c.quantity * newPrice } : c
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const discountValue =
    discountType === "percent"
      ? (subtotal * Math.min(parseFloat(discountInput) || 0, 100)) / 100
      : Math.min(parseFloat(discountInput) || 0, subtotal);
  const total = Math.max(0, subtotal - discountValue);

  const finalizeSale = async () => {
    if (!activePresaleId) {
      toast({ title: "Selecione uma pré-venda", variant: "destructive" });
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Carrinho vazio", variant: "destructive" });
      return;
    }
    if (!paymentMethod) {
      toast({ title: "Selecione a forma de pagamento", variant: "destructive" });
      return;
    }
    setIsFinalizing(true);
    try {
      const { error: delErr } = await db.from("sale_items").delete().eq("sale_id", activePresaleId);
      if (delErr) throw delErr;

      const items = cart.map((item) => ({
        sale_id: activePresaleId,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await db.from("sale_items").insert(items);
      if (itemsError) throw itemsError;

      const { data: saleData, error: saleError } = await db
        .from("sales")
        .update({
          person_id: selectedCustomer?.id || null,
          total,
          discount: discountValue,
          status: "finalizada",
          payment_method: paymentMethod,
          payment_details: paymentDetails || null,
          seller_name: sellerName || "Vendedor",
        })
        .eq("id", activePresaleId)
        .select()
        .single();

      if (saleError) throw saleError;

      for (const item of cart) {
        await db
          .from("products")
          .update({ stock_quantity: item.product.stock_quantity - item.quantity })
          .eq("id", item.product.id);
      }

      toast({
        title: "✅ Venda finalizada!",
        description: `Venda ${saleData.sale_number || saleData.id.slice(0, 8)} — Total: R$ ${total.toFixed(2)}`,
      });

      clearSelection();
      setShowFinishDialog(false);
      loadPendingSales();
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      toast({ title: "Erro ao finalizar", description: "Verifique o console para detalhes.", variant: "destructive" });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/vendas")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              PDV — Ponto de Venda
            </h1>
            <p className="text-sm text-muted-foreground">Selecione uma pré-venda para finalizar no caixa.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid gap-3 lg:grid-cols-[1fr_380px] min-h-0 overflow-hidden">
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <Card className="flex-shrink-0">
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pré-venda por cliente, número ou vendedor..."
                  className="pl-9 h-11 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-h-0 overflow-hidden">
            <CardHeader className="py-3 px-4 pb-0">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Pré-vendas pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 h-full overflow-y-auto pt-2">
              {loadingList ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Carregando...</p>
                </div>
              ) : filteredPending.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-10 text-center px-4">
                  <ClipboardList className="h-12 w-12 opacity-40" />
                  <p className="text-sm">
                    {pendingSales.length === 0 ? (
                      <>
                        Nenhuma pré-venda pendente. O vendedor pode registrar em{" "}
                        <Link to="/nova-prevenda" className="text-primary underline font-medium">
                          Nova pré-venda
                        </Link>
                        .
                      </>
                    ) : (
                      "Nenhuma pré-venda corresponde à busca. Ajuste o filtro."
                    )}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredPending.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={loadingPresale}
                      onClick={() => selectPresale(s.id)}
                      className={`flex flex-col items-start p-3 text-left rounded-lg border transition-all text-left w-full ${
                        activePresaleId === s.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border bg-card hover:bg-accent/50 hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between w-full gap-2">
                        <span className="font-semibold text-foreground">
                          {s.sale_number || s.id.slice(0, 8)}
                        </span>
                        <span className="font-bold text-primary whitespace-nowrap">
                          R$ {Number(s.total).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground truncate w-full">
                        {s.persons?.name || "Cliente não informado"}
                      </span>
                      <div className="flex items-center justify-between w-full mt-1 gap-2">
                        <span className="text-xs text-muted-foreground">
                          {s.seller_name ? `Vendedor: ${s.seller_name}` : "—"}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {(s.sale_items?.length || 0)} itens
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0 space-y-0">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base m-0">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Carrinho
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {cart.reduce((a, c) => a + c.quantity, 0)} itens
                  </Badge>
                  {activePresaleId && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={clearSelection}>
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 px-4 pb-4 min-h-0 overflow-hidden">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <ShoppingCart className="h-10 w-10 opacity-30" />
                  <p className="text-sm text-center px-2">
                    Selecione uma pré-venda à esquerda para carregar os itens e finalizar o pagamento.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-foreground">
                            {item.product.brand && item.product.model
                              ? `${item.product.brand} ${item.product.model}`
                              : item.product.name}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">Unit:</span>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateUnitPrice(item.product.id, parseFloat(e.target.value) || 0)}
                              className="h-6 w-20 text-xs px-1"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.product.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold text-sm w-20 text-right text-primary flex-shrink-0">R$ {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Label className="text-xs whitespace-nowrap">Desconto:</Label>
                    <div className="flex items-center gap-1 flex-1">
                      <Button
                        variant={discountType === "value" ? "default" : "outline"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDiscountType("value")}
                      >
                        <DollarSign className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={discountType === "percent" ? "default" : "outline"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setDiscountType("percent")}
                      >
                        <Percent className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        placeholder={discountType === "percent" ? "%" : "R$"}
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        className="h-7 text-xs flex-1"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 flex-shrink-0 bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    {discountValue > 0 && (
                      <div className="flex justify-between text-sm text-destructive">
                        <span>Desconto</span>
                        <span>- R$ {discountValue.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-base font-bold flex-shrink-0"
                    onClick={() => setShowFinishDialog(true)}
                    disabled={cart.length === 0 || !activePresaleId}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Finalizar Venda — R$ {total.toFixed(2)}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Finalizar Venda
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Cliente (opcional)</Label>
              <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-9">
                    <User className="h-4 w-4 mr-2" />
                    {selectedCustomer ? selectedCustomer.name : "Selecionar cliente..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar..." value={customerSearchQuery} onValueChange={setCustomerSearchQuery} />
                    <CommandList>
                      <CommandItem
                        onSelect={() => {
                          setSelectedCustomer(null);
                          setCustomerSearchOpen(false);
                        }}
                      >
                        Sem cliente
                      </CommandItem>
                      {filteredPersons.map((p) => (
                        <CommandItem
                          key={p.id}
                          onSelect={() => {
                            setSelectedCustomer(p);
                            setCustomerSearchOpen(false);
                          }}
                        >
                          {p.name} — {p.mobile_phone}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" />
                Vendedor
              </Label>
              <Input placeholder="Nome do vendedor..." value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="h-9" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Forma de Pagamento *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(paymentMethod === "parcelado" ||
              paymentMethod === "cartao_credito" ||
              paymentMethod === "duplicata" ||
              paymentMethod === "crediario" ||
              paymentMethod === "cheque") && (
              <div className="space-y-1.5">
                <Label className="text-sm">Detalhes do pagamento</Label>
                <Input
                  placeholder={
                    paymentMethod === "duplicata"
                      ? "Nº duplicata, vencimento..."
                      : paymentMethod === "cheque"
                        ? "Nº cheque, banco, compensação..."
                        : paymentMethod === "crediario"
                          ? "Nº parcelas, vencimento 1ª..."
                          : "Ex: 3x sem juros"
                  }
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="h-9"
                />
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Itens</span>
                <span>{cart.reduce((a, c) => a + c.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>Desconto</span>
                  <span>- R$ {discountValue.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {cart.some((item) => isLowStock(item.product)) && (
              <div className="flex items-start gap-2 p-2 rounded bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Alguns produtos ficarão com estoque baixo após esta venda.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={finalizeSale} disabled={isFinalizing || !paymentMethod} className="min-w-[140px]">
              <CreditCard className="h-4 w-4 mr-2" />
              {isFinalizing ? "Finalizando..." : "Confirmar Venda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDV;
