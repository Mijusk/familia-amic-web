import Link from "next/link";
import { format, formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { requireUser } from "@/lib/auth";
import { getMembership, listParticipants } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/account/profile-form";

export default async function AccountPage({ params }: PageProps<"/[lang]/compte">) {
  const { lang, dict } = await loadPage(params);
  const user = await requireUser(lang, `/${lang}/compte`);
  const t = dict.account;
  const isFamily = user.profile.account_type === "familia";
  const [participants, membership] = isFamily ? await Promise.all([listParticipants(), getMembership(user.id)]) : [[], null];
  const status = membership?.status ?? "none";

  return (
    <div className="space-y-10">
      <PageHeader title={format(t.hello, { name: user.profile.full_name.split(" ")[0] })} />

      {isFamily ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-display text-xl font-extrabold">{t.summary.familyTitle}</h2>
            <p className="mt-2 text-muted">
              {participants.length === 0
                ? t.summary.familyEmpty
                : participants.map((p) => p.first_name).join(", ")}
            </p>
            <Link href={`/${lang}/compte/familia/nou`} className="mt-4 inline-block font-semibold text-accent underline underline-offset-4">
              {t.summary.addParticipant}
            </Link>
          </section>
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-display text-xl font-extrabold">{t.summary.membershipTitle}</h2>
            <p className="mt-2 font-semibold">{dict.membership.status[status]}</p>
            <p className="mt-1 text-muted">{status === "none" ? t.summary.trialNote : format(dict.membership.statusHelp[status], { date: membership?.member_since ? formatDate(lang, membership.member_since) : "" })}</p>
            <Link href={`/${lang}/compte/soci`} className="mt-4 inline-block font-semibold text-accent underline underline-offset-4">
              {status === "none" ? dict.membership.title : dict.common.edit}
            </Link>
          </section>
        </div>
      ) : (
        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="font-display text-xl font-extrabold">{t.volunteer.title}</h2>
          <p className="mt-2 text-muted">{t.volunteer.body}</p>
        </section>
      )}

      <section className="max-w-xl">
        <h2 className="font-display text-2xl font-extrabold">{t.myData.title}</h2>
        <div className="mt-4">
          <ProfileForm
            profile={{ full_name: user.profile.full_name, phone: user.profile.phone, email: user.email }}
            t={t.myData}
            errors={dict.errors}
            common={dict.common}
          />
        </div>
      </section>
    </div>
  );
}
