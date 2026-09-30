import Link from "next/link";
import { loadPage } from "@/i18n/page";
import { requireAdmin } from "@/lib/auth";
import { listAllProjects } from "@/lib/content";
import { Alert } from "@/components/form";
import { PageHeader } from "@/components/page-header";

export default async function AdminProjects({ params, searchParams }: PageProps<"/[lang]/admin/projectes">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/projectes`);
  const t = dict.admin.projects;
  const c = dict.admin.content;
  const projects = await listAllProjects();
  const { esborrat } = await searchParams;

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead}>
        <Link href={`/${lang}/admin/projectes/nou`} className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
          {t.new}
        </Link>
      </PageHeader>
      {esborrat && <Alert tone="success">{c.deleted}</Alert>}
      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="grid gap-3">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- imagen de Storage, sin optimizador
                <img src={p.image_url} alt="" className="size-16 shrink-0 rounded-md object-cover" />
              ) : (
                <span aria-hidden="true" className="size-16 shrink-0 rounded-md bg-accent-soft" />
              )}
              <div className="min-w-0">
                <Link href={`/${lang}/admin/projectes/${p.id}`} className="font-semibold underline underline-offset-4" lang={p.lang}>
                  {p.title}
                </Link>
                <p className="text-sm text-muted">
                  {t.positionShort} {p.position} · <span className={p.status === "publicada" ? "font-semibold text-accent" : ""}>{c.status[p.status]}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
