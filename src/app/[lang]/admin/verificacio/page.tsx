import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { requireUser, safeNext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EnrollTotp, VerifyCodeForm } from "@/components/admin/mfa-forms";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { robots: { index: false } };

export default async function MfaPage({ params, searchParams }: PageProps<"/[lang]/admin/verificacio">) {
  const { lang, dict } = await loadPage(params);
  const { next: rawNext } = await searchParams;
  const next = safeNext(lang, typeof rawNext === "string" ? rawNext : null, `/${lang}/admin`);
  const user = await requireUser(lang, `/${lang}/admin/verificacio`);
  if (user.profile.account_type !== "admin") notFound();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (claims?.claims.aal === "aal2") redirect(next);
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp.find((f) => f.status === "verified");
  const t = dict.admin.mfa;
  const props = { lang, next, t, errors: dict.errors, common: dict.common };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader title={verified ? t.verifyTitle : t.enrollTitle} lead={verified ? t.verifyLead : t.enrollLead} />
      {verified ? <VerifyCodeForm {...props} factorId={verified.id} /> : <EnrollTotp {...props} />}
      <p className="text-sm text-muted">{t.lost}</p>
    </div>
  );
}
