import { db } from "@/integrations/supabase/db";

const SEED_PRODUCTS = [
  { name: 'Armação Ray-Ban Aviator', sku: 'ARM-RB-001', barcode: '7891234567890', category: 'Armação', brand: 'Ray-Ban', model: 'Aviator RB3025', sale_price: 899.90, cost_price: 450.00, stock_quantity: 15, color: 'Dourado', material: 'Metal', warranty_period_months: 12, min_stock_level: 3 },
  { name: 'Armação Oakley Holbrook', sku: 'ARM-OK-001', barcode: '7891234567891', category: 'Armação', brand: 'Oakley', model: 'Holbrook OX8156', sale_price: 749.90, cost_price: 380.00, stock_quantity: 10, color: 'Preto Fosco', material: 'Acetato', warranty_period_months: 12, min_stock_level: 3 },
  { name: 'Armação Chilli Beans', sku: 'ARM-CB-001', barcode: '7891234567892', category: 'Armação', brand: 'Chilli Beans', model: 'Classic CT001', sale_price: 299.90, cost_price: 120.00, stock_quantity: 25, color: 'Tartaruga', material: 'Acetato', warranty_period_months: 6, min_stock_level: 5 },
  { name: 'Lente Essilor Varilux', sku: 'LEN-ES-001', barcode: '7891234567893', category: 'Lente', brand: 'Essilor', model: 'Varilux Comfort', sale_price: 1299.90, cost_price: 650.00, stock_quantity: 8, color: 'Transparente', material: 'Policarbonato', warranty_period_months: 12, min_stock_level: 2 },
  { name: 'Lente Zeiss SmartLife', sku: 'LEN-ZE-001', barcode: '7891234567894', category: 'Lente', brand: 'Zeiss', model: 'SmartLife Individual', sale_price: 1899.90, cost_price: 950.00, stock_quantity: 5, color: 'Transparente', material: 'Cristal', warranty_period_months: 12, min_stock_level: 2 },
  { name: 'Lente Hoya Blue Control', sku: 'LEN-HO-001', barcode: '7891234567895', category: 'Lente', brand: 'Hoya', model: 'Blue Control 1.67', sale_price: 599.90, cost_price: 280.00, stock_quantity: 20, color: 'Transparente', material: 'Resina', warranty_period_months: 6, min_stock_level: 5 },
  { name: 'Óculos Sol Ray-Ban Wayfarer', sku: 'SOL-RB-001', barcode: '7891234567896', category: 'Óculos de Sol', brand: 'Ray-Ban', model: 'Wayfarer RB2140', sale_price: 699.90, cost_price: 350.00, stock_quantity: 12, color: 'Preto', material: 'Acetato', warranty_period_months: 12, min_stock_level: 3 },
  { name: 'Relógio Casio G-Shock', sku: 'REL-CS-001', barcode: '7891234567897', category: 'Relógio', brand: 'Casio', model: 'G-Shock GA-2100', sale_price: 899.90, cost_price: 450.00, stock_quantity: 8, color: 'Preto', material: 'Resina', warranty_period_months: 24, min_stock_level: 2 },
  { name: 'Relógio Orient Automático', sku: 'REL-OR-001', barcode: '7891234567898', category: 'Relógio', brand: 'Orient', model: 'Bambino V2', sale_price: 1299.90, cost_price: 650.00, stock_quantity: 5, color: 'Prata', material: 'Aço Inoxidável', warranty_period_months: 24, min_stock_level: 2 },
  { name: 'Relógio Technos Legacy', sku: 'REL-TC-001', barcode: '7891234567899', category: 'Relógio', brand: 'Technos', model: 'Legacy 2315KZT', sale_price: 749.90, cost_price: 375.00, stock_quantity: 7, color: 'Dourado', material: 'Aço', warranty_period_months: 12, min_stock_level: 2 },
  { name: 'Cordão para Óculos', sku: 'ACE-CO-001', barcode: '7891234567900', category: 'Acessório', brand: 'Genérico', model: 'Cordão Couro', sale_price: 49.90, cost_price: 15.00, stock_quantity: 50, color: 'Marrom', material: 'Couro', warranty_period_months: 3, min_stock_level: 10 },
  { name: 'Estojo Rígido Óculos', sku: 'ACE-ES-001', barcode: '7891234567901', category: 'Acessório', brand: 'Genérico', model: 'Estojo Premium', sale_price: 39.90, cost_price: 12.00, stock_quantity: 40, color: 'Preto', material: 'Couro Sintético', warranty_period_months: 3, min_stock_level: 10 },
  { name: 'Flanela Microfibra', sku: 'ACE-FL-001', barcode: '7891234567902', category: 'Acessório', brand: 'Genérico', model: 'Microfibra Premium', sale_price: 14.90, cost_price: 3.00, stock_quantity: 100, color: 'Azul', material: 'Microfibra', min_stock_level: 20 },
  { name: 'Spray Limpa Lentes', sku: 'ACE-SP-001', barcode: '7891234567903', category: 'Acessório', brand: 'Clean Vision', model: 'Spray 60ml', sale_price: 29.90, cost_price: 8.00, stock_quantity: 60, min_stock_level: 15 },
  { name: 'Pulseira Relógio Couro', sku: 'ACE-PU-001', barcode: '7891234567904', category: 'Acessório Relógio', brand: 'Genérico', model: 'Pulseira 22mm', sale_price: 79.90, cost_price: 25.00, stock_quantity: 30, color: 'Marrom', material: 'Couro', warranty_period_months: 6, min_stock_level: 5 },
  { name: 'Bateria Relógio SR626SW', sku: 'ACE-BA-001', barcode: '7891234567905', category: 'Acessório Relógio', brand: 'Renata', model: 'SR626SW 377', sale_price: 19.90, cost_price: 5.00, stock_quantity: 200, min_stock_level: 50 },
  { name: 'Armação Infantil Miraflex', sku: 'ARM-MF-001', barcode: '7891234567906', category: 'Armação Infantil', brand: 'Miraflex', model: 'Baby Lux', sale_price: 349.90, cost_price: 180.00, stock_quantity: 10, color: 'Azul', material: 'Silicone', warranty_period_months: 12, min_stock_level: 3 },
  { name: 'Lente Transitions Gen 8', sku: 'LEN-TR-001', barcode: '7891234567907', category: 'Lente', brand: 'Transitions', model: 'Gen 8 1.74', sale_price: 1599.90, cost_price: 800.00, stock_quantity: 6, color: 'Cinza', material: 'Resina', warranty_period_months: 12, min_stock_level: 2 },
];

export async function seedProducts(): Promise<{ inserted: number; skipped: number }> {
  const { data: existing } = await supabase
    .from("products")
    .select("sku")
    .in("sku", SEED_PRODUCTS.map(p => p.sku));

  const existingSkus = new Set((existing || []).map(p => p.sku));
  const toInsert = SEED_PRODUCTS.filter(p => !existingSkus.has(p.sku));

  if (toInsert.length === 0) return { inserted: 0, skipped: SEED_PRODUCTS.length };

  const { error } = await db.from("products").insert(toInsert);
  if (error) throw error;

  return { inserted: toInsert.length, skipped: SEED_PRODUCTS.length - toInsert.length };
}
