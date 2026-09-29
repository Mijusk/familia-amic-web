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

export default async function RegisterPage({ params, searchParams }: PageProps<"/[lang]/registre">) {
  const { lang, dict } = await loadPage(params);
  if (await getCurrentUser()) redirect(`/${lang}/compte`);
  const t = dict.auth.register;
  const volunteer = (await searchParams).tipus === "voluntari";

  return (
    <AuthCard
      title={volunteer ? t.volunteerTitle : t.title}
      lead={volunteer ? t.volunteerLead : t.lead}
      footer={
        <>
          <p>
            {t.haveAccount}{" "}
            <Link href={`/${lang}/entrar`} className="font-semibold text-accent underline underline-offset-4">
              {t.login}
            </Link>
          </p>
          <p className="mt-2">
            <Link href={volunteer ? `/${lang}/registre` : `/${lang}/registre?tipus=voluntari`} className="font-semibold text-accent underline underline-offset-4">
              {volunteer ? t.switchToFamily : t.switchToVolunteer}
            </Link>
          </p>
        </>
      }
    >
      <RegisterForm lang={lang} volunteer={volunteer} t={t} errors={dict.errors} saving={dict.common.saving} />
    </AuthCard>
  );
}
