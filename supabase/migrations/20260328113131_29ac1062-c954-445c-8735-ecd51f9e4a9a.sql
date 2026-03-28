
CREATE TABLE public.persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE,
  phone TEXT,
  mobile_phone TEXT,
  email TEXT,
  cpf TEXT,
  rg TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read persons" ON public.persons FOR SELECT USING (true);
CREATE POLICY "Allow public insert persons" ON public.persons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update persons" ON public.persons FOR UPDATE USING (true) WITH CHECK (true);

CREATE TABLE public.legal_persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
  cnpj TEXT,
  company_name TEXT,
  trade_name TEXT,
  state_registration TEXT,
  municipal_registration TEXT,
  supplier_since DATE,
  observations TEXT,
  contact_person TEXT,
  contact_email TEXT,
  payment_terms TEXT,
  delivery_time TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_persons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read legal_persons" ON public.legal_persons FOR SELECT USING (true);
CREATE POLICY "Allow public insert legal_persons" ON public.legal_persons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update legal_persons" ON public.legal_persons FOR UPDATE USING (true) WITH CHECK (true);

CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES public.persons(id),
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  seller_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Allow public insert sales" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update sales" ON public.sales FOR UPDATE USING (true) WITH CHECK (true);

CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read sale_items" ON public.sale_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert sale_items" ON public.sale_items FOR INSERT WITH CHECK (true);
