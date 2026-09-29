import Link from "next/link";
import { redirect } from "next/navigation";
import { format, formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { getQueuePositions, isCurrent, listMyEnrollments, todayLocal, type EnrollmentWithNames } from "@/lib/activities";
import { scheduleText } from "@/lib/activity-format";
import { unenroll } from "@/lib/actions/enrollments";
import { requireUser } from "@/lib/auth";
import { Alert } from "@/components/form";
import { ConfirmForm } from "@/components/confirm-form";
import { PageHeader } from "@/components/page-header";

export default async function EnrollmentsPage({ params, searchParams }: PageProps<"/[lang]/compte/inscripcions">) {
  const { lang, dict } = await loadPage(params);
  const user = await requireUser(lang, `/${lang}/compte/inscripcions`);
  if (user.profile.account_type !== "familia") redirect(`/${lang}/compte`);
  const { baixa } = await searchParams;
  const t = dict.enrollments;
  const [enrollments, positions] = await Promise.all([listMyEnrollments(), getQueuePositions()]);
  const today = todayLocal();
  const current = enrollments.filter((e) => isCurrent(e, today));
  const past = enrollments.filter((e) => !isCurrent(e, today));

  const statusKey = (e: EnrollmentWithNames) =>
    e.status === "baixa" ? "baixa" : e.is_trial ? "prova" : e.status === "cua" ? "cua" : isCurrent(e, today) ? "confirmada" : "acabada";

  const item = (e: EnrollmentWithNames, withActions: boolean) => {
    const name = `${e.participants?.first_name ?? ""} ${e.participants?.last_name ?? ""}`.trim();
    const key = statusKey(e);
    const details: string[] = [];
    if (e.status === "cua" && positions.get(e.id)) details.push(format(t.queuePosition, { n: positions.get(e.id)! }));
    if (e.is_trial && e.trial_date) details.push(format(t.trialOn, { date: formatDate(lang, e.trial_date) }));
    else if (e.status === "confirmada" && e.auto_renew && !e.ends_on) details.push(t.renews);
    else if (e.ends_on && e.status !== "cua") details.push(format(t.endsOn, { date: formatDate(lang, e.ends_on) }));
    const tone =
      key === "confirmada" || key === "prova" ? "bg-accent-soft text-accent" : key === "cua" ? "bg-warm-soft text-warm" : "bg-background text-muted";

    return (
      <li key={e.id} className="rounded-lg border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-display text-xl font-extrabold">{name}</p>
            {e.activities && (
              <p className="mt-1">
                <Link href={`/${lang}/activitats/${e.activities.slug}`} className="font-semibold underline underline-offset-4" lang={e.activities.lang}>
                  {e.activities.title}
                </Link>
                <span className="text-muted"> · {scheduleText(lang, dict.activities, e.activities)}</span>
              </p>
            )}
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tone}`}>{t.status[key]}</span>
        </div>
        {details.length > 0 && <p className="mt-2 text-muted">{details.join(" · ")}</p>}
        {withActions && (
          <div className="mt-3">
            <ConfirmForm
              action={unenroll}
              lang={lang}
              id={e.id}
              label={t.unenroll}
              confirmText={format(t.unenrollConfirm, { name, activity: e.activities?.title ?? "" })}
              confirmButton={t.unenrollButton}
              cancel={dict.common.cancel}
            />
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead}>
        <Link href={`/${lang}/activitats`} className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
          {t.browse}
        </Link>
      </PageHeader>
      {baixa && <Alert tone="success">{t.unenrolled}</Alert>}

      {enrollments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <>
          {current.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-extrabold">{t.current}</h2>
              <ul className="mt-4 grid gap-4">{current.map((e) => item(e, true))}</ul>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-extrabold">{t.past}</h2>
              <ul className="mt-4 grid gap-4">{past.map((e) => item(e, false))}</ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
