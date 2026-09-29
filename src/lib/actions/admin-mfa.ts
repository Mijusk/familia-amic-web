"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getCurrentUser, safeNext } from "@/lib/auth";
import type { ErrorKey } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

export type EnrollData = { factorId: string; qr: string; secret: string } | { error: ErrorKey };
export type VerifyState = { status: "idle" | "error"; error?: ErrorKey };

/** Da de alta el autenticador (TOTP) de un admin y devuelve el QR para escanearlo. */
export async function startTotpEnroll(): Promise<EnrollData> {
  const user = await getCurrentUser();
  if (!user || user.profile.account_type !== "admin") return { error: "generic" };
  const supabase = await createClient();
  // Un intento anterior sin terminar deja un factor sin verificar: se borra para empezar de cero.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Família Amic" });
  if (error || !data) return { error: "generic" };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyTotp(_prev: VerifyState, formData: FormData): Promise<VerifyState> {
  const raw = String(formData.get("lang") ?? "");
  const lang = isLocale(raw) ? raw : defaultLocale;
  const factorId = String(formData.get("factorId") ?? "");
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code) || !factorId) return { status: "error", error: "invalidCode" };

  const user = await getCurrentUser();
  if (!user || user.profile.account_type !== "admin") return { status: "error", error: "generic" };
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { status: "error", error: "invalidCode" };
  redirect(safeNext(lang, String(formData.get("next") ?? ""), `/${lang}/admin`));
}
