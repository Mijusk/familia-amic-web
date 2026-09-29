import type { Metadata } from "next";
import { loadPage } from "@/i18n/page";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotForm } from "@/components/auth/forgot-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/recuperar">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.auth.forgot.title, robots: { index: false } };
}

export default async function ForgotPage({ params }: PageProps<"/[lang]/recuperar">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.auth.forgot;
  return (
    <AuthCard title={t.title} lead={t.lead}>
      <ForgotForm lang={lang} t={t} email={dict.auth.login.email} errors={dict.errors} saving={dict.common.saving} />
    </AuthCard>
  );
}
