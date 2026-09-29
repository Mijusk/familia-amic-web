import Link from "next/link";
import { formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { requireAdmin } from "@/lib/auth";
import { listAllNews } from "@/lib/content";
import { Alert } from "@/components/form";
import { PageHeader } from "@/components/page-header";

export default async function AdminNews({ params, searchParams }: PageProps<"/[lang]/admin/noticies">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/noticies`);
  const t = dict.admin.news;
  const c = dict.admin.content;
  const news = await listAllNews();
  const { esborrada } = await searchParams;

  return (
    <div className="space-y-8">
      <PageHeader title={t.title}>
        <Link href={`/${lang}/admin/noticies/nova`} className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
          {t.new}
        </Link>
      </PageHeader>
      {esborrada && <Alert tone="success">{c.deleted}</Alert>}
      {news.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="grid gap-3">
          {news.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface p-4">
              <div className="min-w-0">
                <Link href={`/${lang}/admin/noticies/${n.id}`} className="font-semibold underline underline-offset-4" lang={n.lang}>
                  {n.title}
                </Link>
                <p className="text-sm text-muted">
                  {formatDate(lang, n.published_on)} ·{" "}
                  <span className={n.status === "publicada" ? "font-semibold text-accent" : ""}>{c.status[n.status]}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
