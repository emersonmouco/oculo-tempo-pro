/**
 * PostgREST / Supabase REST errors the app handles explicitly.
 * @see https://postgrest.org/en/stable/errors.html
 */

export const STOCK_SCHEMA_SETUP_HINT =
  "No Supabase: Project Settings → abra o SQL Editor, cole e execute o arquivo `supabase/migrations/20260401000000_inventory_control.sql` do repositório (cria stock_movements, pedidos de compra e políticas RLS). Depois recarregue o app.";

/** PGRST205 — table/view not in schema cache (often: relation was never created). */
export function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as { code?: string }).code === "PGRST205";
}
