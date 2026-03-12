-- Tabela de clientes (pessoas físicas que compram na ótica)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(person_id)
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_number TEXT,
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'finalizada' CHECK (status IN ('pendente', 'finalizada', 'cancelada')),
  payment_method TEXT CHECK (payment_method IN ('pix', 'dinheiro', 'cartao_debito', 'cartao_credito', 'boleto', 'parcelado')),
  payment_details TEXT,
  seller_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sales_person_id ON public.sales(person_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_customers_person_id ON public.customers(person_id);

-- RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow all on sales" ON public.sales FOR ALL USING (true);
CREATE POLICY "Allow all on sale_items" ON public.sale_items FOR ALL USING (true);

-- Trigger para updated_at em sales
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar número da venda
CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sale_number IS NULL OR NEW.sale_number = '' THEN
    NEW.sale_number := 'V' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      LPAD(((SELECT COALESCE(COUNT(*), 0) FROM public.sales WHERE DATE(created_at) = CURRENT_DATE) + 1)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sale_number
  BEFORE INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_sale_number();
