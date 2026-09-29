import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { deleteResource } from "@/lib/actions/content";
import { requireAdmin } from "@/lib/auth";
import { getResourceById } from "@/lib/content";
import { ResourceForm } from "@/components/admin/resource-form";
import { ConfirmForm } from "@/components/confirm-form";
import { PageHeader } from "@/components/page-header";

export default async function EditResource({ params, searchParams }: PageProps<"/[lang]/admin/recursos/[id]">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireAdmin(lang, `/${lang}/admin/recursos/${id}`);
  const r = await getResourceById(id);
  if (!r) notFound();
  const { creat } = await searchParams;
  const c = dict.admin.content;

  return (
    <div className="space-y-8">
      <PageHeader title={dict.admin.resources.editTitle} lead={r.title}>
        {r.status === "publicada" && (
          <Link href={`/${lang}/recursos/${r.slug}`} className="font-semibold text-accent underline underline-offset-4">
            {c.view}
          </Link>
        )}
      </PageHeader>
      <ResourceForm
        lang={lang}
        created={Boolean(creat)}
        initial={{
          id: r.id,
          title: r.title,
          slug: r.slug,
          lang_text: r.lang,
          category: r.category,
          summary: r.summary,
          body: r.body,
          external_url: r.external_url ?? "",
          position: String(r.position),
          status: r.status,
        }}
        t={dict.admin.resources}
        content={c}
        categories={dict.resources.categories}
        errors={dict.errors}
        common={dict.common}
      />
      <ConfirmForm action={deleteResource} lang={lang} id={r.id} label={c.delete} confirmText={c.deleteConfirm} confirmButton={c.delete} cancel={dict.common.cancel} />
    </div>
  );
}
