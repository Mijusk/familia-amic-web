import { redirect } from "next/navigation";
import { format, formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { requireUser } from "@/lib/auth";
import { getMembership, maskedDni } from "@/lib/data";
import { maskIban } from "@/lib/validation";
import { PageHeader } from "@/components/page-header";
import { MembershipForm } from "@/components/account/membership-form";

export default async function MembershipPage({ params }: PageProps<"/[lang]/compte/soci">) {
  const { lang, dict } = await loadPage(params);
  const user = await requireUser(lang, `/${lang}/compte/soci`);
  if (user.profile.account_type !== "familia") redirect(`/${lang}/compte`);
  const t = dict.membership;
  const membership = await getMembership(user.id);
  const status = membership?.status ?? "none";

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead} />

      <section className="max-w-2xl rounded-lg border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">{t.statusTitle}</h2>
        <p className="mt-1 font-display text-2xl font-extrabold">{t.status[status]}</p>
        <p className="mt-1 text-muted">
          {format(t.statusHelp[status], { date: membership?.member_since ? formatDate(lang, membership.member_since) : "" })}
        </p>
        {membership && <p className="mt-3 text-sm text-muted">{format(t.sepaReference, { ref: membership.sepa_reference })}</p>}
      </section>

      <MembershipForm
        t={t}
        errors={dict.errors}
        common={dict.common}
        initial={
          membership
            ? {
                address: membership.address,
                postal_code: membership.postal_code,
                city: membership.city,
                bank_name: membership.bank_name,
                ibanMasked: maskIban(membership.iban_last4),
                dniMasked: maskedDni(membership.dni_encrypted),
              }
            : undefined
        }
      />
    </div>
  );
}
