import type { Metadata } from "next";
import Link from "next/link";
import { loadPage } from "@/i18n/page";
import { listResources, resourceCategories, type ResourceCategory } from "@/lib/content";
import { PageHeader } from "@/components/page-header";

export async function generateMetadata({ params }: PageProps<"/[lang]/recursos">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.resources.title, description: dict.resources.lead };
}

export default async function ResourcesPage({ params, searchParams }: PageProps<"/[lang]/recursos">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.resources;
  const { categoria } = await searchParams;
  const current = resourceCategories.find((c) => c === categoria);
  const resources = await listResources(current);
  const groups = (current ? [current] : resourceCategories)
    .map((c) => ({ category: c as ResourceCategory, items: resources.filter((r) => r.category === c) }))
    .filter((g) => g.items.length > 0);

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
            <Link href={`/${lang}/recursos`} className={chip(!current)} aria-current={!current ? "page" : undefined}>
              {t.all}
            </Link>
          </li>
          {resourceCategories.map((c) => (
            <li key={c}>
              <Link href={`/${lang}/recursos?categoria=${c}`} className={chip(current === c)} aria-current={current === c ? "page" : undefined}>
                {t.categories[c]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {groups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        groups.map((g) => (
          <section key={g.category} aria-labelledby={`cat-${g.category}`}>
            <h2 id={`cat-${g.category}`} className="font-display text-2xl font-extrabold">
              {t.categories[g.category]}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {g.items.map((r) => (
                <li key={r.id} className="relative rounded-lg border border-line bg-surface p-5 hover:shadow-md">
                  <h3 className="font-display text-lg font-extrabold" lang={r.lang}>
                    <Link href={`/${lang}/recursos/${r.slug}`} className="after:absolute after:inset-0">
                      {r.title}
                    </Link>
                  </h3>
                  {r.summary && (
                    <p className="mt-1 text-muted" lang={r.lang}>
                      {r.summary}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
