"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { safeNext } from "@/lib/auth";
import { formValues, type ErrorKey, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { isValidPhone, normalizePhone } from "@/lib/validation";
import { fieldErrors } from "./zod-errors";

function langOf(formData: FormData): Locale {
  const lang = String(formData.get("lang") ?? "");
  return isLocale(lang) ? lang : defaultLocale;
}

async function siteOrigin() {
  const h = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL ?? h.get("origin") ?? `https://${h.get("host")}`;
}

/** Traduce los códigos de error de Supabase Auth a mensajes del diccionario. */
function authError(code: string | undefined): ErrorKey {
  switch (code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "weak_password":
      return "passwordWeak";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rateLimited";
    default:
      return "generic";
  }
}

const password = z.string().min(8, "passwordWeak").regex(/[A-Za-z]/, "passwordWeak").regex(/\d/, "passwordWeak");

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "required").max(120, "tooLong"),
  phone: z.string().trim().refine(isValidPhone, "invalidPhone"),
  email: z.email("invalidEmail"),
  password,
  privacy: z.literal("on", "consentRequired"),
});

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["password"]);
  if (!getSupabaseEnv()) return { status: "error", error: "notConfigured", values };
  const lang = langOf(formData);
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const { full_name, phone, email } = parsed.data;
  // Solo se puede elegir entre familia y voluntario; los admins se crean desde el panel.
  const accountType = formData.get("tipus") === "voluntari" ? "voluntari" : "familia";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/${lang}/auth/confirm?next=/${lang}/compte`,
      data: { full_name, phone: normalizePhone(phone), locale: lang, account_type: accountType },
    },
  });
  if (error) return { status: "error", error: authError(error.code), values };
  return { status: "success", detail: email };
}

const signInSchema = z.object({ email: z.email("invalidEmail"), password: z.string().min(1, "required") });

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["password"]);
  if (!getSupabaseEnv()) return { status: "error", error: "notConfigured", values };
  const lang = langOf(formData);
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { status: "error", error: authError(error.code), values };
  redirect(safeNext(lang, String(formData.get("next") ?? "")));
}

export async function signOut(formData: FormData) {
  const lang = langOf(formData);
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(`/${lang}`);
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  if (!getSupabaseEnv()) return { status: "error", error: "notConfigured", values };
  const lang = langOf(formData);
  const parsed = z.object({ email: z.email("invalidEmail") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteOrigin()}/${lang}/auth/confirm?next=/${lang}/nova-contrasenya`,
  });
  // No decimos si el correo existe o no: el mensaje de éxito es el mismo.
  if (error && authError(error.code) === "rateLimited") return { status: "error", error: "rateLimited", values };
  return { status: "success" };
}

/** Vuelve a enviar el correo para confirmar la cuenta (el enlace anterior caduca o se ha usado). */
export async function resendConfirmation(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  if (!getSupabaseEnv()) return { status: "error", error: "notConfigured", values };
  const lang = langOf(formData);
  // El campo se llama resend_email para no chocar con el del formulario de entrar en la misma página.
  const parsed = z.object({ email: z.email("invalidEmail") }).safeParse({ email: formData.get("resend_email") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${await siteOrigin()}/${lang}/auth/confirm?next=/${lang}/compte` },
  });
  // Igual que al recuperar la contraseña: no decimos si el correo existe o ya está confirmado.
  if (error && authError(error.code) === "rateLimited") return { status: "error", error: "rateLimited", values };
  return { status: "success" };
}

const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "passwordMismatch", path: ["confirm"] });

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!getSupabaseEnv()) return { status: "error", error: "notConfigured" };
  const lang = langOf(formData);
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { status: "error", error: "linkInvalid" };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", error: authError(error.code) };
  redirect(`/${lang}/compte`);
}
