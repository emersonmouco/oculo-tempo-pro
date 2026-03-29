/**
 * Helper to bypass stale auto-generated Supabase types.
 * Use `db.from("table_name")` instead of `supabase.from("table_name")`
 * when the types.ts hasn't been regenerated yet.
 */
import { supabase } from "./client";

export const db = supabase as any;
