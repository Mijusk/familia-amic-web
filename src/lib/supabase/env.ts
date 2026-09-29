/**
 * Claves públicas de Supabase (Project Settings → API).
 * Devuelve null si aún no están configuradas, para que la web
 * pueda arrancar en local sin proyecto de Supabase.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}
