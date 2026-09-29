import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { Alert } from "@/components/form";

export async function generateMetadata({ params }: PageProps<"/[lang]/entrar">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.auth.login.title, robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[lang]/entrar">) {
  const { lang, dict } = await loadPage(params);
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  if (await getCurrentUser()) redirect(safeNext(lang, next));
  const t = dict.auth.login;

  return (
    <AuthCard
      title={t.title}
      lead={t.lead}
      footer={
        <p>
          {t.noAccount}{" "}
          <Link href={`/${lang}/registre`} className="font-semibold text-accent underline underline-offset-4">
            {t.register}
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        {sp.error === "link" && <Alert tone="error">{dict.errors.linkInvalid}</Alert>}
        <LoginForm lang={lang} next={next} t={t} errors={dict.errors} saving={dict.common.saving} />
      </div>
    </AuthCard>
  );
}
