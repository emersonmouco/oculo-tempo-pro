-- ============================================================
-- MÓDULO: CONTROLE DE ESTOQUE ROBUSTO
-- Data: 2026-04-01
-- Descrição: Tabelas para rastreamento completo de movimentações
--            de estoque e pedidos de compra.
-- ============================================================

-- -------------------------------------------------------
-- 1. MOVIMENTAÇÕES DE ESTOQUE
--    Auditoria completa de cada entrada/saída/ajuste.
--    Nunca apagamos registros — é um ledger imutável.
-- -------------------------------------------------------
CREATE TABLE public.stock_movements (
  id                UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id        UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,

  -- Tipo da movimentação
  movement_type     TEXT        NOT NULL CHECK (movement_type IN (
    'entrada',            -- recebimento de mercadoria (compra/transferência)
    'saida',              -- saída por venda
    'ajuste_positivo',    -- inventário / correção para cima
    'ajuste_negativo',    -- inventário / correção para baixo / avaria
    'devolucao_cliente',  -- cliente devolveu produto (entra no estoque)
    'devolucao_fornecedor'-- produto enviado de volta ao fornecedor (sai do estoque)
  )),

  quantity          INTEGER     NOT NULL CHECK (quantity > 0),       -- sempre positivo
  previous_quantity INTEGER     NOT NULL,                            -- estoque antes
  new_quantity      INTEGER     NOT NULL,                            -- estoque depois

  -- Origem da movimentação (opcional — para rastreabilidade)
  reference_type    TEXT        CHECK (reference_type IN (
    'venda', 'compra', 'ajuste', 'devolucao', 'inventario'
  )),
  reference_id      UUID,       -- FK para sale.id ou purchase_order.id

  notes             TEXT,
  operator          TEXT,       -- nome do operador/vendedor
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read stock_movements"   ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow public insert stock_movements" ON public.stock_movements FOR INSERT WITH CHECK (true);

-- Índices para consultas frequentes
CREATE INDEX idx_stock_movements_product_id  ON public.stock_movements (product_id);
CREATE INDEX idx_stock_movements_created_at  ON public.stock_movements (created_at DESC);
CREATE INDEX idx_stock_movements_reference   ON public.stock_movements (reference_type, reference_id);


-- -------------------------------------------------------
-- 2. PEDIDOS DE COMPRA (PURCHASE ORDERS)
-- -------------------------------------------------------
CREATE TABLE public.purchase_orders (
  id             UUID    NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number   TEXT    UNIQUE,                              -- gerado automaticamente
  supplier_id    UUID    REFERENCES public.legal_persons(id) ON DELETE SET NULL,

  status         TEXT    NOT NULL DEFAULT 'rascunho' CHECK (status IN (
    'rascunho',         -- criado mas ainda não enviado
    'enviado',          -- enviado ao fornecedor
    'confirmado',       -- fornecedor confirmou
    'em_transito',      -- mercadoria a caminho
    'recebido_parcial', -- parte dos itens recebida
    'recebido',         -- todos os itens recebidos
    'cancelado'
  )),

  order_date     DATE    NOT NULL DEFAULT CURRENT_DATE,
  expected_date  DATE,
  received_date  DATE,

  subtotal       NUMERIC NOT NULL DEFAULT 0,
  discount       NUMERIC NOT NULL DEFAULT 0,
  total          NUMERIC NOT NULL DEFAULT 0,

  notes          TEXT,
  operator       TEXT,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read purchase_orders"   ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert purchase_orders" ON public.purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update purchase_orders" ON public.purchase_orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete purchase_orders" ON public.purchase_orders FOR DELETE USING (true);

CREATE INDEX idx_purchase_orders_status      ON public.purchase_orders (status);
CREATE INDEX idx_purchase_orders_supplier_id ON public.purchase_orders (supplier_id);


-- -------------------------------------------------------
-- 3. ITENS DOS PEDIDOS DE COMPRA
-- -------------------------------------------------------
CREATE TABLE public.purchase_order_items (
  id                  UUID    NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id   UUID    NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id          UUID    NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,

  quantity_ordered    INTEGER NOT NULL CHECK (quantity_ordered > 0),
  quantity_received   INTEGER NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
  unit_cost           NUMERIC NOT NULL DEFAULT 0,
  subtotal            NUMERIC NOT NULL DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read purchase_order_items"   ON public.purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert purchase_order_items" ON public.purchase_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update purchase_order_items" ON public.purchase_order_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete purchase_order_items" ON public.purchase_order_items FOR DELETE USING (true);

CREATE INDEX idx_poi_purchase_order_id ON public.purchase_order_items (purchase_order_id);
CREATE INDEX idx_poi_product_id        ON public.purchase_order_items (product_id);


-- -------------------------------------------------------
-- 4. FUNÇÃO: gera order_number automaticamente
--    Formato: PC-YYYYMMDD-NNNN
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  today    TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  seq      INTEGER;
BEGIN
  SELECT COUNT(*) + 1
    INTO seq
    FROM public.purchase_orders
   WHERE order_number LIKE 'PC-' || today || '-%';

  NEW.order_number := 'PC-' || today || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_purchase_order_number
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION public.generate_order_number();


-- -------------------------------------------------------
-- 5. FUNÇÃO: auto-atualiza updated_at em purchase_orders
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_purchase_order_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_purchase_order_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_purchase_order_timestamp();
