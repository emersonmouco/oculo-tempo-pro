import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { supabase } from "@/integrations/supabase/client";
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
];

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

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku, barcode, category, brand, model, sale_price, stock_quantity, is_active")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os produtos.", variant: "destructive" });
      return;
    }
    setProducts(data || []);
  }, [toast]);

  const loadPersons = useCallback(async () => {
    const { data, error } = await supabase
      .from("persons")
      .select("id, name, mobile_phone, email")
      .order("name");

    if (error) {
      console.error("Erro ao carregar pessoas:", error);
      return;
    }
    setPersons(data || []);
  }, []);

  useEffect(() => {
    loadProducts();
    loadPersons();
  }, [loadProducts, loadPersons]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPersons = persons.filter(
    (p) =>
      p.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      p.mobile_phone.includes(customerSearchQuery) ||
      p.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const addToCart = (product: Product, qty: number = 1) => {
    const existing = cart.find((c) => c.product.id === product.id);
    const newQty = (existing?.quantity || 0) + qty;
    if (newQty > product.stock_quantity) {
      toast({ title: "Estoque insuficiente", description: `Disponível: ${product.stock_quantity}`, variant: "destructive" });
      return;
    }
    if (existing) {
      setCart(
        cart.map((c) =>
          c.product.id === product.id
            ? {
                ...c,
                quantity: c.quantity + qty,
                subtotal: (c.quantity + qty) * c.unitPrice,
              }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: qty,
          unitPrice: product.sale_price,
          subtotal: qty * product.sale_price,
        },
      ]);
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
      return prev.map((c) =>
        c.product.id === productId
          ? { ...c, quantity: newQty, subtotal: newQty * c.unitPrice }
          : c
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);

  const finalizeSale = async () => {
    if (cart.length === 0) {
      toast({ title: "Carrinho vazio", description: "Adicione produtos antes de finalizar.", variant: "destructive" });
      return;
    }
    if (!paymentMethod) {
      toast({ title: "Forma de pagamento", description: "Selecione a forma de pagamento.", variant: "destructive" });
      return;
    }

    setIsFinalizing(true);
    try {
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          person_id: selectedCustomer?.id || null,
          total,
          status: "finalizada",
          payment_method: paymentMethod,
          payment_details: paymentDetails || null,
          seller_name: "Vendedor",
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

      const { error: itemsError } = await supabase.from("sale_items").insert(items);
      if (itemsError) throw itemsError;

      for (const item of cart) {
        await supabase
          .from("products")
          .update({ stock_quantity: item.product.stock_quantity - item.quantity })
          .eq("id", item.product.id);
      }

      toast({
        title: "Venda finalizada!",
        description: `Venda ${saleData.sale_number || saleData.id} registrada. Total: R$ ${total.toFixed(2)}`,
      });

      setCart([]);
      setSelectedCustomer(null);
      setPaymentMethod("");
      setPaymentDetails("");
      loadProducts();
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível registrar a venda. Verifique se as tabelas sales e sale_items existem.",
        variant: "destructive",
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/vendas")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">PDV - Ponto de Venda</h1>
            <p className="text-sm text-muted-foreground">Registre vendas rapidamente</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Busca e Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={searchRef}
                        placeholder="Buscar por nome, SKU ou código de barras..."
                        className="pl-9"
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
                          {filteredProducts.slice(0, 8).map((product) => (
                            <CommandItem
                              key={product.id}
                              onSelect={() => addToCart(product)}
                              className="flex justify-between cursor-pointer"
                            >
                              <span className="truncate">
                                {product.brand && product.model
                                  ? `${product.brand} ${product.model}`
                                  : product.name}
                              </span>
                              <span className="font-medium text-primary ml-2">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Produtos em destaque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {products.slice(0, 12).map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto flex flex-col items-start p-3 text-left"
                    onClick={() => addToCart(product)}
                  >
                    <span className="font-medium text-sm truncate w-full">
                      {product.brand && product.model
                        ? `${product.brand} ${product.model}`
                        : product.name}
                    </span>
                    <span className="text-xs text-primary font-bold">
                      R$ {product.sale_price.toFixed(2)}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Carrinho ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Adicione produtos usando a busca ou clique nos produtos em destaque.
                </p>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.product.brand && item.product.model
                            ? `${item.product.brand} ${item.product.model}`
                            : item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          R$ {item.unitPrice.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-bold text-sm w-16 text-right">
                        R$ {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        {selectedCustomer ? selectedCustomer.name : "Cliente (opcional)"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar cliente..."
                          value={customerSearchQuery}
                          onValueChange={setCustomerSearchQuery}
                        />
                        <CommandList>
                          <CommandItem onSelect={() => { setSelectedCustomer(null); setCustomerSearchOpen(false); }}>
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
                              {p.name} - {p.mobile_phone}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <div className="space-y-2">
                    <Label>Forma de pagamento</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
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
                    {(paymentMethod === "parcelado" || paymentMethod === "cartao_credito") && (
                      <Input
                        placeholder="Ex: 3x sem juros"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                      />
                    )}
                  </div>

                  <Button
                    className="w-full erp-button-primary h-12"
                    onClick={finalizeSale}
                    disabled={isFinalizing}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {isFinalizing ? "Finalizando..." : "Finalizar Venda"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PDV;
