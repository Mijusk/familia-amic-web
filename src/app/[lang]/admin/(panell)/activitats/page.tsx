import Link from "next/link";
import { format } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { getSpots } from "@/lib/activities";
import { scheduleText } from "@/lib/activity-format";
import { listAllActivities } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";

export default async function AdminActivities({ params }: PageProps<"/[lang]/admin/activitats">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/activitats`);
  const t = dict.admin.activities;
  const [activities, spots] = await Promise.all([listAllActivities(), getSpots()]);

  return (
    <div className="space-y-8">
      <PageHeader title={t.title}>
        <Link href={`/${lang}/admin/activitats/categories`} className="font-semibold text-accent underline underline-offset-4">
          {dict.admin.categories.title}
        </Link>
        <Link href={`/${lang}/admin/activitats/nova`} className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
          {t.new}
        </Link>
      </PageHeader>
      {activities.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="grid gap-4">
          {activities.map((a) => {
            const s = spots.get(a.id) ?? { occupied: 0, queued: 0 };
            return (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface p-5">
                <div className="min-w-0">
                  <p className="font-display text-xl font-extrabold" lang={a.lang}>
                    {a.title}
                  </p>
                  <p className="text-muted">{scheduleText(lang, dict.activities, a)}</p>
                  <p className="mt-1 text-sm">
                    <span className={`mr-2 rounded-full px-2 py-0.5 font-semibold ${a.status === "publicada" ? "bg-accent-soft text-accent" : "bg-background text-muted"}`}>
                      {dict.admin.status[a.status]}
                    </span>
                    <span className={s.queued > 0 ? "font-semibold text-warm" : "text-muted"}>{format(t.enrolledCount, s)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 font-semibold">
                  <Link href={`/${lang}/admin/activitats/${a.id}/inscrits`} className="text-accent underline underline-offset-4">
                    {t.roster}
                  </Link>
                  <Link href={`/${lang}/admin/activitats/${a.id}`} className="text-accent underline underline-offset-4">
                    {t.edit}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
