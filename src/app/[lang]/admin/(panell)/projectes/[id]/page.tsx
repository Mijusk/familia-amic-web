import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { deleteProject } from "@/lib/actions/content";
import { requireAdmin } from "@/lib/auth";
import { getProjectById } from "@/lib/content";
import { ProjectForm } from "@/components/admin/project-form";
import { ConfirmForm } from "@/components/confirm-form";
import { PageHeader } from "@/components/page-header";

export default async function EditProject({ params, searchParams }: PageProps<"/[lang]/admin/projectes/[id]">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireAdmin(lang, `/${lang}/admin/projectes/${id}`);
  const p = await getProjectById(id);
  if (!p) notFound();
  const { creat } = await searchParams;
  const t = dict.admin.projects;
  const c = dict.admin.content;

  return (
    <div className="space-y-8">
      <PageHeader title={t.editTitle} lead={p.title}>
        <div className="flex flex-wrap gap-4 font-semibold">
          <Link href={`/${lang}/admin/projectes/${p.id}/fotos`} className="text-accent underline underline-offset-4">
            {t.gallery}
          </Link>
          {p.status === "publicada" && (
            <Link href={`/${lang}/projectes/${p.slug}`} className="text-accent underline underline-offset-4">
              {c.view}
            </Link>
          )}
        </div>
      </PageHeader>
      <ProjectForm
        lang={lang}
        created={Boolean(creat)}
        initial={{
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          slug: p.slug,
          lang_text: p.lang,
          position: String(p.position),
          image_url: p.image_url ?? "",
          body: p.body,
          status: p.status,
        }}
        t={t}
        content={c}
        image={dict.admin.image}
        errors={dict.errors}
        common={dict.common}
        preview={{ t: dict.admin.preview }}
      />
      <ConfirmForm action={deleteProject} lang={lang} id={p.id} label={c.delete} confirmText={t.deleteConfirm} confirmButton={c.delete} cancel={dict.common.cancel} />
    </div>
  );
}
