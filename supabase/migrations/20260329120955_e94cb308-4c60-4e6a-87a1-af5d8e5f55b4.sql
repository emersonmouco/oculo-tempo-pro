
ALTER TABLE public.legal_persons
  ADD COLUMN IF NOT EXISTS supplier_code TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS fax_number TEXT,
  ADD COLUMN IF NOT EXISTS business_activity_code TEXT,
  ADD COLUMN IF NOT EXISTS tax_regime TEXT,
  ADD COLUMN IF NOT EXISTS is_tax_exempt BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS legal_representative_name TEXT,
  ADD COLUMN IF NOT EXISTS legal_representative_phone TEXT;

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS sale_number TEXT,
  ADD COLUMN IF NOT EXISTS payment_details TEXT;
