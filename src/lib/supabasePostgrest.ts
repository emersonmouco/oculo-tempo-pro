/**
 * PostgREST / Supabase REST errors the app handles explicitly.
 * @see https://postgrest.org/en/stable/errors.html
 */

export const STOCK_SCHEMA_SETUP_HINT =
  "No painel do Supabase: menu lateral → SQL Editor → New query → cole o conteúdo completo de `supabase/migrations/20260401000000_inventory_control.sql` do GitHub e execute (Run). Depois recarregue o app.";

/** PGRST205 — table/view not in schema cache (often: relation was never created). */
export function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as { code?: string }).code === "PGRST205";
}
