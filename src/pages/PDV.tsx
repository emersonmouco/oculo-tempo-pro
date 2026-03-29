import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  CommandEmpty,
  CommandGroup,
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
import { seedProducts } from "@/utils/seedProducts";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  User,
  Barcode,
  CreditCard,
  Percent,
  DollarSign,
  AlertTriangle,
  Package,
  UserCheck,
  Receipt,
  Database,
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

const CATEGORY_COLORS: Record<string, string> = {
  "Armação": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Lente": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Óculos de Sol": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "Relógio": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "Acessório": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  "Acessório Relógio": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  "Armação Infantil": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
};

const PDV = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSeeding, setIsSeeding] = useState(false);

  const loadProducts = useCallback(async () => {
    const { data, error } = await db
      .from("products")
      .select("id, name, sku, barcode, category, brand, model, sale_price, stock_quantity, min_stock_level, is_active")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      return;
    }
    setProducts(data || []);
  }, []);

  const loadPersons = useCallback(async () => {
    const { data, error } = await db
      .from("persons")
      .select("id, name, mobile_phone, email")
      .order("name");
    if (!error) setPersons(data || []);
  }, []);

  useEffect(() => {
    loadProducts();
    loadPersons();
  }, [loadProducts, loadPersons]);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedProducts();
      toast({ title: "Produtos inseridos", description: `${result.inserted} novos, ${result.skipped} já existiam.` });
      loadProducts();
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao inserir produtos", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const filteredPersons = persons.filter(
    (p) =>
      p.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      p.mobile_phone.includes(customerSearchQuery) ||
      p.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const isLowStock = (product: Product) =>
    product.min_stock_level != null && product.stock_quantity <= product.min_stock_level;

  const addToCart = (product: Product, qty: number = 1) => {
    const existing = cart.find((c) => c.product.id === product.id);
    const newQty = (existing?.quantity || 0) + qty;
    if (newQty > product.stock_quantity) {
      toast({
        title: "⚠️ Estoque insuficiente",
        description: `"${product.brand} ${product.model || product.name}" — disponível: ${product.stock_quantity} un.`,
        variant: "destructive",
      });
      return;
    }
    if (isLowStock(product) && !existing) {
      toast({
        title: "⚡ Estoque baixo",
        description: `"${product.brand} ${product.model || product.name}" está com estoque baixo (${product.stock_quantity} un). Considere repor.`,
      });
    }
    if (existing) {
      setCart(
        cart.map((c) =>
          c.product.id === product.id
            ? { ...c, quantity: newQty, subtotal: newQty * c.unitPrice }
            : c
        )
      );
    } else {
      setCart([...cart, { product, quantity: qty, unitPrice: product.sale_price, subtotal: qty * product.sale_price }]);
    }
    setSearchQuery("");
    setSearchOpen(false);
    searchRef.current?.focus();
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
      const { data: saleData, error: saleError } = await db
        .from("sales")
        .insert({
          person_id: selectedCustomer?.id || null,
          total,
          status: "finalizada",
          payment_method: paymentMethod,
          payment_details: paymentDetails || null,
          seller_name: sellerName || "Vendedor",
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const items = cart.map((item) => ({
        sale_id: saleData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await db.from("sale_items").insert(items);
      if (itemsError) throw itemsError;

      // Movimentação de estoque
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

      setCart([]);
      setSelectedCustomer(null);
      setPaymentMethod("");
      setPaymentDetails("");
      setSellerName("");
      setDiscountInput("");
      setShowFinishDialog(false);
      loadProducts();
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      toast({ title: "Erro ao finalizar", description: "Verifique o console para detalhes.", variant: "destructive" });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-3 overflow-hidden">
      {/* Top Bar */}
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
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSeed} disabled={isSeeding}>
            <Database className="h-4 w-4 mr-1" />
            {isSeeding ? "Inserindo..." : "Inserir Produtos Teste"}
          </Button>
        </div>
      </div>

      <div className="flex-1 grid gap-3 lg:grid-cols-[1fr_380px] min-h-0 overflow-hidden">
        {/* LEFT: Products */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* Search */}
          <Card className="flex-shrink-0">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={searchRef}
                        placeholder="Buscar por nome, SKU, código de barras, marca..."
                        className="pl-9 pr-9 h-11 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && filteredProducts.length > 0) {
                            addToCart(filteredProducts[0]);
                          }
                        }}
                      />
                      <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                        <CommandGroup>
                          {filteredProducts.slice(0, 10).map((product) => (
                            <CommandItem
                              key={product.id}
                              onSelect={() => addToCart(product)}
                              className="flex justify-between cursor-pointer py-2"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {isLowStock(product) && <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                                <div className="min-w-0">
                                  <span className="truncate block text-sm font-medium">
                                    {product.brand && product.model
                                      ? `${product.brand} ${product.model}`
                                      : product.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {product.sku} · Est: {product.stock_quantity}
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold text-primary ml-2 flex-shrink-0">
                                R$ {product.sale_price.toFixed(2)}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          <Card className="flex-1 min-h-0 overflow-hidden">
            <CardContent className="p-3 h-full overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                  <Package className="h-12 w-12" />
                  <p>Nenhum produto encontrado.</p>
                  <Button variant="outline" onClick={handleSeed} disabled={isSeeding}>
                    <Database className="h-4 w-4 mr-1" />
                    Inserir Produtos de Teste
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      className="relative flex flex-col items-start p-3 text-left rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all group"
                      onClick={() => addToCart(product)}
                    >
                      {isLowStock(product) && (
                        <div className="absolute top-1.5 right-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                      )}
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 mb-1 ${CATEGORY_COLORS[product.category || ""] || "bg-secondary text-secondary-foreground"}`}
                      >
                        {product.category || "Geral"}
                      </Badge>
                      <span className="font-medium text-sm truncate w-full text-foreground">
                        {product.brand && product.model
                          ? `${product.brand} ${product.model}`
                          : product.name}
                      </span>
                      <div className="flex items-center justify-between w-full mt-1">
                        <span className="text-primary font-bold text-sm">
                          R$ {product.sale_price.toFixed(2)}
                        </span>
                        <span className={`text-[11px] ${isLowStock(product) ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                          Est: {product.stock_quantity}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Cart */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Carrinho
                </span>
                <Badge variant="secondary" className="text-sm">
                  {cart.reduce((a, c) => a + c.quantity, 0)} itens
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 px-4 pb-4 min-h-0 overflow-hidden">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <ShoppingCart className="h-10 w-10 opacity-30" />
                  <p className="text-sm text-center">Clique nos produtos ou use a busca para adicionar itens.</p>
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
                        <span className="font-bold text-sm w-20 text-right text-primary flex-shrink-0">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Discount */}
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

                  {/* Totals */}
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

                  {/* Finish Sale Button */}
                  <Button
                    className="w-full h-12 text-base font-bold flex-shrink-0"
                    onClick={() => setShowFinishDialog(true)}
                    disabled={cart.length === 0}
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

      {/* Finish Sale Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Finalizar Venda
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer */}
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
                      <CommandItem onSelect={() => { setSelectedCustomer(null); setCustomerSearchOpen(false); }}>
                        Sem cliente
                      </CommandItem>
                      {filteredPersons.map((p) => (
                        <CommandItem key={p.id} onSelect={() => { setSelectedCustomer(p); setCustomerSearchOpen(false); }}>
                          {p.name} — {p.mobile_phone}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Seller */}
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" />
                Vendedor
              </Label>
              <Input
                placeholder="Nome do vendedor..."
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Payment */}
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

            {/* Payment details */}
            {(paymentMethod === "parcelado" || paymentMethod === "cartao_credito" || paymentMethod === "duplicata" || paymentMethod === "crediario" || paymentMethod === "cheque") && (
              <div className="space-y-1.5">
                <Label className="text-sm">Detalhes do pagamento</Label>
                <Input
                  placeholder={
                    paymentMethod === "duplicata" ? "Nº duplicata, vencimento..." :
                    paymentMethod === "cheque" ? "Nº cheque, banco, compensação..." :
                    paymentMethod === "crediario" ? "Nº parcelas, vencimento 1ª..." :
                    "Ex: 3x sem juros"
                  }
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="h-9"
                />
              </div>
            )}

            {/* Summary */}
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

            {/* Low stock warnings */}
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
