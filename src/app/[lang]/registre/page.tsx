import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { getCurrentUser } from "@/lib/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/registre">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.auth.register.title };
}

export default async function RegisterPage({ params }: PageProps<"/[lang]/registre">) {
  const { lang, dict } = await loadPage(params);
  if (await getCurrentUser()) redirect(`/${lang}/compte`);
  const t = dict.auth.register;

  return (
    <AuthCard
      title={t.title}
      lead={t.lead}
      footer={
        <p>
          {t.haveAccount}{" "}
          <Link href={`/${lang}/entrar`} className="font-semibold text-accent underline underline-offset-4">
            {t.login}
          </Link>
        </p>
      }
    >
      <RegisterForm lang={lang} t={t} errors={dict.errors} saving={dict.common.saving} />
    </AuthCard>
  );
}
