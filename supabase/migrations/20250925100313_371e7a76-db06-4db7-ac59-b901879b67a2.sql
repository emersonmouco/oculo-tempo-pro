-- Create Person base table
CREATE TABLE public.persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  phone TEXT,
  mobile_phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Legal Person table (inherits from Person for clients/suppliers)
CREATE TABLE public.legal_persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  supplier_id UUID, -- Self-reference for supplier relationships
  company_name TEXT NOT NULL,
  supplier_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trade_name TEXT,
  cnpj VARCHAR(18), -- Format: XX.XXX.XXX/XXXX-XX
  state_registration TEXT,
  municipal_registration TEXT,
  website_url TEXT,
  fax_number TEXT,
  contact_email TEXT,
  business_activity_code TEXT,
  tax_regime TEXT,
  is_tax_exempt BOOLEAN NOT NULL DEFAULT false,
  supplier_since DATE,
  observations TEXT,
  legal_representative_name TEXT,
  legal_representative_phone TEXT,
  contact_person TEXT,
  payment_terms TEXT,
  delivery_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  barcode TEXT,
  category TEXT,
  brand TEXT,
  model TEXT,
  cost_price DECIMAL(10,2),
  sale_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER,
  unit_of_measure TEXT DEFAULT 'UN',
  weight DECIMAL(8,3),
  dimensions TEXT, -- Store as JSON string: {"length": x, "width": y, "height": z}
  color TEXT,
  size TEXT,
  material TEXT,
  supplier_id UUID REFERENCES public.legal_persons(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  has_serial_number BOOLEAN NOT NULL DEFAULT false,
  warranty_period_months INTEGER DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for persons
CREATE POLICY "Allow all operations on persons" ON public.persons FOR ALL USING (true);

-- Create policies for legal_persons  
CREATE POLICY "Allow all operations on legal_persons" ON public.legal_persons FOR ALL USING (true);

-- Create policies for products
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_persons_updated_at
  BEFORE UPDATE ON public.persons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_persons_updated_at
  BEFORE UPDATE ON public.legal_persons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_legal_persons_person_id ON public.legal_persons(person_id);
CREATE INDEX idx_legal_persons_supplier_id ON public.legal_persons(supplier_id);
CREATE INDEX idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX idx_persons_name ON public.persons(name);
CREATE INDEX idx_legal_persons_company_name ON public.legal_persons(company_name);
CREATE INDEX idx_products_name ON public.products(name);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_barcode ON public.products(barcode);