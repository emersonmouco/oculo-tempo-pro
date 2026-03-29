import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Barcode,
  Percent,
  DollarSign,
  AlertTriangle,
  UserCheck,
  Save,
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

const NovaPreVenda = () => {
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
  const [sellerName, setSellerName] = useState("");
  const [discountType, setDiscountType] = useState<"value" | "percent">("value");
  const [discountInput, setDiscountInput] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    const { data, error } = await db
      .from("products")
      .select(
        "id, name, sku, barcode, category, brand, model, sale_price, stock_quantity, min_stock_level, is_active"
      )
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      return;
    }
    setProducts(data || []);
  }, []);

  const loadPersons = useCallback(async () => {
    const { data, error } = await db.from("persons").select("id, name, mobile_phone, email").order("name");
    if (!error) setPersons(data || []);
  }, []);

  useEffect(() => {
    loadProducts();
    loadPersons();
  }, [loadProducts, loadPersons]);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.includes(searchQuery.trim()) ||
      p.brand?.toLowerCase().includes(q) ||
      p.model?.toLowerCase().includes(q)
    );
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
        description: `"${product.brand} ${product.model || product.name}" está com estoque baixo (${product.stock_quantity} un).`,
      });
    }
    if (existing) {
      setCart(
        cart.map((c) =>
          c.product.id === product.id ? { ...c, quantity: newQty, subtotal: newQty * c.unitPrice } : c
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

  const savePresale = async () => {
    if (cart.length === 0) {
      toast({ title: "Adicione produtos à pré-venda", variant: "destructive" });
      return;
    }
    if (!sellerName.trim()) {
      toast({ title: "Informe o vendedor", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const { data: saleData, error: saleError } = await db
        .from("sales")
        .insert({
          person_id: selectedCustomer?.id || null,
          total,
          discount: discountValue,
          status: "pendente",
          seller_name: sellerName.trim(),
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

      toast({
        title: "Pré-venda registrada",
        description: saleData.sale_number
          ? `${saleData.sale_number} — Total: R$ ${total.toFixed(2)}. Finalize no PDV.`
          : `Total: R$ ${total.toFixed(2)}. Finalize no PDV.`,
      });

      setCart([]);
      setSelectedCustomer(null);
      setSellerName("");
      setDiscountInput("");
      setShowSaveDialog(false);
      navigate("/pdv");
    } catch (error) {
      console.error("Erro ao salvar pré-venda:", error);
      toast({ title: "Erro ao salvar", description: "Verifique o console para detalhes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
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
            <h1 className="text-xl font-bold text-foreground">Nova pré-venda</h1>
            <p className="text-sm text-muted-foreground">Monte o pedido; o caixa finaliza no PDV.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid gap-3 lg:grid-cols-[1fr_380px] min-h-0 overflow-hidden">
        <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
          <Card className="flex-shrink-0">
            <CardContent className="p-3">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    placeholder="Buscar por nome, SKU, código de barras, marca..."
                    className="pl-9 pr-9 h-11 text-base"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filteredProducts.length > 0) {
                        addToCart(filteredProducts[0]);
                      }
                      if (e.key === "Escape") {
                        setSearchOpen(false);
                        searchRef.current?.blur();
                      }
                    }}
                  />
                  <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {searchOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-[min(50vh,320px)] overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</div>
                    ) : (
                      filteredProducts.slice(0, 20).map((product) => (
                        <div
                          key={product.id}
                          onMouseDown={() => addToCart(product)}
                          className="flex justify-between items-center cursor-pointer py-2 px-3 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isLowStock(product) && <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                            <div className="min-w-0">
                              <span className="truncate block text-sm font-medium">
                                {product.brand && product.model ? `${product.brand} ${product.model}` : product.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {product.sku} · Est: {product.stock_quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-primary ml-2 flex-shrink-0">R$ {product.sale_price.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Digite para buscar e toque em um resultado para adicionar ao carrinho.</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Itens da pré-venda
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
                  <p className="text-sm text-center">Adicione produtos para formar a pré-venda.</p>
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

                  <Button className="w-full h-12 text-base font-bold flex-shrink-0" onClick={() => setShowSaveDialog(true)} disabled={cart.length === 0}>
                    <Save className="h-5 w-5 mr-2" />
                    Salvar pré-venda — R$ {total.toFixed(2)}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Salvar pré-venda
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
                Vendedor *
              </Label>
              <Input placeholder="Nome do vendedor..." value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="h-9" />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={savePresale} disabled={isSaving || !sellerName.trim()} className="min-w-[140px]">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovaPreVenda;
