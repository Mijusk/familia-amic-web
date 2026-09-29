import Link from "next/link";
import { loadPage } from "@/i18n/page";
import { requireAdmin } from "@/lib/auth";
import { listAllResources, resourceCategories } from "@/lib/content";
import { Alert } from "@/components/form";
import { PageHeader } from "@/components/page-header";

export default async function AdminResources({ params, searchParams }: PageProps<"/[lang]/admin/recursos">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/recursos`);
  const t = dict.admin.resources;
  const c = dict.admin.content;
  const resources = await listAllResources();
  const { esborrat } = await searchParams;

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead}>
        <Link href={`/${lang}/admin/recursos/nou`} className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
          {t.new}
        </Link>
      </PageHeader>
      {esborrat && <Alert tone="success">{c.deleted}</Alert>}
      {resources.length === 0 && <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>}
      {resourceCategories.map((cat) => {
        const items = resources.filter((r) => r.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="space-y-3">
            <h2 className="font-display text-2xl font-extrabold">{dict.resources.categories[cat]}</h2>
            <ul className="grid gap-2">
              {items.map((r) => (
                <li key={r.id} className="flex flex-wrap items-baseline gap-x-3 rounded-lg border border-line bg-surface px-4 py-3">
                  <Link href={`/${lang}/admin/recursos/${r.id}`} className="font-semibold underline underline-offset-4" lang={r.lang}>
                    {r.title}
                  </Link>
                  <span className={`text-sm ${r.status === "publicada" ? "font-semibold text-accent" : "text-muted"}`}>{c.status[r.status]}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
