import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type Profile = {
  id: string;
  account_type: "familia" | "voluntari" | "admin";
  full_name: string;
  phone: string;
  locale: "ca" | "es";
};

/** Usuario con sesión válida (comprobada contra Supabase) y su perfil, o null. Se memoriza por petición. */
export const getCurrentUser = cache(async () => {
  if (!getSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, account_type, full_name, phone, locale")
    .eq("id", data.user.id)
    .single<Profile>();
  if (!profile) return null;
  return { id: data.user.id, email: data.user.email ?? "", profile };
});

/** Para páginas privadas: si no hay sesión, manda a entrar y vuelve después. */
export async function requireUser(lang: Locale, next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/entrar?next=${encodeURIComponent(next)}`);
  return user;
}

/** Solo acepta rutas internas del mismo idioma, para no redirigir a otras webs. */
export function safeNext(lang: Locale, next: string | null | undefined, fallback = `/${lang}/compte`) {
  if (next && next.startsWith(`/${lang}/`) && !next.startsWith("//") && !next.includes("\\")) return next;
  return fallback;
}
