import type { Metadata } from "next";
import Link from "next/link";
import { loadPage } from "@/i18n/page";
import { freeSpots, getSpots, listActivities, listCategories } from "@/lib/activities";
import { priceText, scheduleText, spotsText } from "@/lib/activity-format";
import { PageHeader } from "@/components/page-header";

export async function generateMetadata({ params }: PageProps<"/[lang]/activitats">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.activities.title, description: dict.activities.lead };
}

export default async function ActivitiesPage({ params, searchParams }: PageProps<"/[lang]/activitats">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.activities;
  const { categoria } = await searchParams;
  const categories = await listCategories();
  const current = categories.find((c) => c.slug === categoria);
  const [activities, spots] = await Promise.all([listActivities(current?.id), getSpots()]);
  const categoryName = (id: string | null) => {
    const c = categories.find((x) => x.id === id);
    return c ? (lang === "es" ? c.name_es : c.name_ca) : null;
  };

  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 font-semibold ${
      active ? "border-accent bg-accent text-accent-contrast" : "border-line bg-surface hover:border-accent"
    }`;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader title={t.title} lead={t.lead} />

      <nav aria-label={t.filterLabel}>
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link href={`/${lang}/activitats`} className={chip(!current)} aria-current={!current ? "page" : undefined}>
              {t.all}
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/${lang}/activitats?categoria=${c.slug}`}
                className={chip(current?.id === c.id)}
                aria-current={current?.id === c.id ? "page" : undefined}
              >
                {lang === "es" ? c.name_es : c.name_ca}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {activities.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {activities.map((a) => {
            const free = freeSpots(a, spots.get(a.id));
            return (
              <li key={a.id} className="relative flex flex-col rounded-lg border border-line border-t-4 border-t-brand bg-surface p-5 hover:shadow-md">
                {categoryName(a.category_id) && (
                  <p className="text-sm font-semibold uppercase tracking-wider text-accent">{categoryName(a.category_id)}</p>
                )}
                <h2 className="mt-1 font-display text-2xl font-extrabold" lang={a.lang}>
                  <Link href={`/${lang}/activitats/${a.slug}`} className="after:absolute after:inset-0">
                    {a.title}
                  </Link>
                </h2>
                <p className="mt-2 text-muted" lang={a.lang}>
                  {a.summary}
                </p>
                <dl className="mt-4 space-y-1 text-[0.95rem]">
                  <div>
                    <dt className="sr-only">{t.when}</dt>
                    <dd className="font-semibold">{scheduleText(lang, t, a)}</dd>
                  </div>
                  {a.location && (
                    <div>
                      <dt className="sr-only">{t.where}</dt>
                      <dd>{a.location}</dd>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4">
                    <dt className="sr-only">{t.price}</dt>
                    <dd>{priceText(lang, t, a)}</dd>
                    <dt className="sr-only">{t.spots}</dt>
                    <dd className={free === 0 ? "font-semibold text-warm" : "text-muted"}>{spotsText(t, free)}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
