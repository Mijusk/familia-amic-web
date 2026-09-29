import Link from "next/link";
import { notFound } from "next/navigation";
import { format, formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { isCurrent, todayLocal } from "@/lib/activities";
import { scheduleText } from "@/lib/activity-format";
import { cancelEnrollmentAsAdmin, confirmEnrollment } from "@/lib/actions/admin";
import { getActivityById, getRoster, type RosterEntry } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { ageFrom } from "@/lib/data";
import { Alert } from "@/components/form";
import { ConfirmForm } from "@/components/confirm-form";
import { PageHeader } from "@/components/page-header";

export default async function Roster({ params, searchParams }: PageProps<"/[lang]/admin/activitats/[id]/inscrits">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireAdmin(lang, `/${lang}/admin/activitats/${id}/inscrits`);
  const activity = await getActivityById(id);
  if (!activity) notFound();
  const { r } = await searchParams;
  const t = dict.admin.roster;
  const roster = await getRoster(activity.id);
  const today = todayLocal();

  const confirmed = roster.filter((e) => e.status === "confirmada" && !e.is_trial && isCurrent(e, today));
  const queue = roster.filter((e) => e.status === "cua");
  const trials = roster.filter((e) => e.is_trial && isCurrent(e, today));
  const past = roster.filter((e) => !isCurrent(e, today)).reverse();
  const full = activity.capacity != null && confirmed.length >= activity.capacity;

  const health = (p: NonNullable<RosterEntry["participants"]>) => {
    const items = [
      p.disability_pct != null && format(t.disability, { pct: p.disability_pct }),
      p.has_dependency && p.dependency_grade && format(t.dependency, { n: p.dependency_grade }),
      p.allergies && format(t.allergies, { text: p.allergies }),
      p.medical_notes && format(t.notes, { text: p.medical_notes }),
    ].filter(Boolean) as string[];
    return items.length ? items : [t.noHealth];
  };

  const row = (e: RosterEntry, i: number, kind: "confirmed" | "queue" | "trial" | "past") => {
    const p = e.participants;
    const name = p ? `${p.first_name} ${p.last_name}` : "";
    const when =
      kind === "trial" && e.trial_date
        ? format(t.trialOn, { date: formatDate(lang, e.trial_date) })
        : kind === "queue"
          ? format(t.position, { n: i + 1 })
          : [
              format(t.since, { date: formatDate(lang, e.starts_on) }),
              e.ends_on ? format(t.until, { date: formatDate(lang, e.ends_on) }) : e.auto_renew ? t.renews : null,
            ]
              .filter(Boolean)
              .join(" ");
    return (
      <li key={e.id} className="rounded-lg border border-line bg-surface p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.3fr]">
          <div>
            <p className="font-display text-lg font-extrabold">{name}</p>
            {p && <p className="text-muted">{format(t.age, { age: ageFrom(p.birth_date) })}</p>}
            {p && !p.image_consent && <p className="mt-1 inline-block rounded-full bg-warm-soft px-3 py-0.5 text-sm font-semibold text-warm">{t.noPhotos}</p>}
            <p className="mt-1 text-sm">{when}</p>
          </div>
          <div className="text-[0.95rem]">
            <p className="text-sm text-muted">{t.family}</p>
            <p>
              <Link href={`/${lang}/admin/families/${e.family_id}`} className="font-semibold underline underline-offset-4">
                {e.profiles?.full_name}
              </Link>
            </p>
            <p>
              <a href={`tel:${e.profiles?.phone}`} className="underline underline-offset-4">
                {e.profiles?.phone}
              </a>
            </p>
            {e.email && <p className="break-all">{e.email}</p>}
          </div>
          <div className="text-[0.95rem]">
            <p className="text-sm text-muted">{t.health}</p>
            {p && (
              <ul className="space-y-0.5">
                {health(p).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {kind !== "past" && (
          <div className="mt-4 flex flex-wrap items-start gap-4">
            {kind === "queue" && (
              <form action={confirmEnrollment}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="activity" value={activity.id} />
                {full && <input type="hidden" name="over" value="1" />}
                <button type="submit" className="min-h-11 rounded-md bg-accent px-4 font-semibold text-accent-contrast hover:opacity-90">
                  {full ? t.confirmOver : t.confirm}
                </button>
              </form>
            )}
            <ConfirmForm
              action={cancelEnrollmentAsAdmin}
              lang={lang}
              id={e.id}
              hidden={{ activity: activity.id }}
              label={t.cancel}
              confirmText={format(t.cancelConfirm, { name })}
              confirmButton={t.cancelButton}
              cancel={dict.common.cancel}
            />
          </div>
        )}
      </li>
    );
  };

  const section = (title: string, items: RosterEntry[], kind: "confirmed" | "queue" | "trial" | "past", extra?: string) => (
    <section>
      <h2 className="font-display text-2xl font-extrabold">
        {title} {extra && <span className="text-base font-normal text-muted">· {extra}</span>}
      </h2>
      {kind === "queue" && full && items.length > 0 && <p className="mt-1 text-muted">{t.fullNote}</p>}
      {items.length === 0 ? <p className="mt-3 text-muted">{t.empty}</p> : <ul className="mt-4 grid gap-4">{items.map((e, i) => row(e, i, kind))}</ul>}
    </section>
  );

  return (
    <div className="space-y-10">
      <PageHeader title={`${t.title}: ${activity.title}`} lead={scheduleText(lang, dict.activities, activity)}>
        <Link href={`/${lang}/admin/activitats/${activity.id}`} className="font-semibold text-accent underline underline-offset-4">
          {dict.admin.activities.edit}
        </Link>
      </PageHeader>
      {r === "confirmada" && <Alert tone="success">{t.confirmedMsg}</Alert>}
      {r === "baixa" && <Alert tone="success">{t.cancelledMsg}</Alert>}
      {r === "full" && <Alert tone="error">{dict.errors.activityFull}</Alert>}
      {r === "error" && <Alert tone="error">{dict.errors.generic}</Alert>}
      {section(
        t.confirmed,
        confirmed,
        "confirmed",
        activity.capacity != null ? format(t.capacityOf, { n: confirmed.length, capacity: activity.capacity }) : format(t.noLimit, { n: confirmed.length }),
      )}
      {section(t.queue, queue, "queue")}
      {section(t.trials, trials, "trial")}
      {past.length > 0 && section(t.past, past, "past")}
    </div>
  );
}
