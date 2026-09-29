import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/** Cliente de Supabase para componentes de cliente ("use client"). */
export function createClient() {
  const env = getSupabaseEnv();
  if (!env) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local");
  return createBrowserClient(env.url, env.key);
}
