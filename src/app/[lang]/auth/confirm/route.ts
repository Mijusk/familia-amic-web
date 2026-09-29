import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { safeNext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino de los enlaces de los correos de Supabase (confirmar cuenta, recuperar contraseña).
 * Acepta el formato por defecto (?code=) y el de plantilla propia (?token_hash=&type=).
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/[lang]/auth/confirm">) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : defaultLocale;
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(lang, searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing token") };

  if (error) return NextResponse.redirect(new URL(`/${lang}/entrar?error=link`, origin));
  return NextResponse.redirect(new URL(next, origin));
}
