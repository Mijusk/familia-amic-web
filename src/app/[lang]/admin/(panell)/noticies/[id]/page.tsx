import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { deleteNews } from "@/lib/actions/content";
import { listAllActivities } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { getNewsById } from "@/lib/content";
import { NewsForm } from "@/components/admin/news-form";
import { ConfirmForm } from "@/components/confirm-form";
import { PageHeader } from "@/components/page-header";

export default async function EditNews({ params, searchParams }: PageProps<"/[lang]/admin/noticies/[id]">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireAdmin(lang, `/${lang}/admin/noticies/${id}`);
  const [n, activities] = await Promise.all([getNewsById(id), listAllActivities()]);
  if (!n) notFound();
  const { creada } = await searchParams;
  const c = dict.admin.content;

  return (
    <div className="space-y-8">
      <PageHeader title={dict.admin.news.editTitle} lead={n.title}>
        <div className="flex flex-wrap gap-4 font-semibold">
          <Link href={`/${lang}/admin/noticies/${n.id}/fotos`} className="text-accent underline underline-offset-4">
            {dict.admin.photos.title}
          </Link>
          {n.status === "publicada" && (
            <Link href={`/${lang}/noticies/${n.slug}`} className="text-accent underline underline-offset-4">
              {c.view}
            </Link>
          )}
        </div>
      </PageHeader>
      <NewsForm
        lang={lang}
        created={Boolean(creada)}
        initial={{
          id: n.id,
          title: n.title,
          slug: n.slug,
          lang_text: n.lang,
          summary: n.summary,
          body: n.body,
          image_url: n.image_url ?? "",
          activity_id: n.activity_id ?? "",
          published_on: n.published_on,
          status: n.status,
          featured_from: n.featured_from ?? "",
          featured_until: n.featured_until ?? "",
        }}
        activities={activities.map((a) => ({ id: a.id, title: a.title }))}
        t={dict.admin.news}
        content={c}
        image={dict.admin.image}
        featured={dict.admin.featured}
        errors={dict.errors}
        common={dict.common}
        preview={{ t: dict.admin.preview }}
      />
      <ConfirmForm action={deleteNews} lang={lang} id={n.id} label={c.delete} confirmText={c.deleteConfirm} confirmButton={c.delete} cancel={dict.common.cancel} />
    </div>
  );
}
