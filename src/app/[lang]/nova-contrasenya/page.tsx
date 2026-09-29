import type { Metadata } from "next";
import { loadPage } from "@/i18n/page";
import { requireUser } from "@/lib/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetForm } from "@/components/auth/reset-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/nova-contrasenya">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.auth.reset.title, robots: { index: false } };
}

export default async function NewPasswordPage({ params }: PageProps<"/[lang]/nova-contrasenya">) {
  const { lang, dict } = await loadPage(params);
  // Se llega aquí desde el enlace del correo, que ya ha abierto la sesión.
  await requireUser(lang, `/${lang}/nova-contrasenya`);
  const t = dict.auth.reset;
  return (
    <AuthCard title={t.title}>
      <ResetForm lang={lang} t={t} hint={dict.auth.register.passwordHint} errors={dict.errors} saving={dict.common.saving} />
    </AuthCard>
  );
}
