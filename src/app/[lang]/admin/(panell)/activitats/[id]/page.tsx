import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { listCategories } from "@/lib/activities";
import { getActivityById } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { ActivityForm } from "@/components/admin/activity-form";
import { PageHeader } from "@/components/page-header";

export default async function EditActivity({ params, searchParams }: PageProps<"/[lang]/admin/activitats/[id]">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireAdmin(lang, `/${lang}/admin/activitats/${id}`);
  const [a, categories] = await Promise.all([getActivityById(id), listCategories()]);
  if (!a) notFound();
  const { creada } = await searchParams;
  const t = dict.admin.activities;

  return (
    <div className="space-y-8">
      <PageHeader title={t.editTitle} lead={a.title}>
        <div className="flex flex-wrap gap-4 font-semibold">
          <Link href={`/${lang}/admin/activitats/${a.id}/inscrits`} className="text-accent underline underline-offset-4">
            {t.roster}
          </Link>
          <Link href={`/${lang}/admin/activitats/${a.id}/fotos`} className="text-accent underline underline-offset-4">
            {dict.admin.photos.title}
          </Link>
          <Link href={`/${lang}/activitats/${a.slug}`} className="text-accent underline underline-offset-4">
            {t.view}
          </Link>
        </div>
      </PageHeader>
      <ActivityForm
        lang={lang}
        created={Boolean(creada)}
        initial={{
          id: a.id,
          title: a.title,
          slug: a.slug,
          lang_text: a.lang,
          summary: a.summary,
          description: a.description,
          image_url: a.image_url ?? "",
          category_id: a.category_id ?? "",
          kind: a.kind,
          weekday: a.weekday?.toString() ?? "",
          start_time: a.start_time?.slice(0, 5) ?? "",
          end_time: a.end_time?.slice(0, 5) ?? "",
          starts_on: a.starts_on,
          ends_on: a.ends_on ?? "",
          location: a.location,
          capacity: a.capacity?.toString() ?? "",
          price: a.price_cents == null ? "" : (a.price_cents / 100).toString(),
          payment_method: a.payment_method,
          payment_notes: a.payment_notes,
          status: a.status,
          enrollment_open: a.enrollment_open ? "on" : "",
          featured_from: a.featured_from ?? "",
          featured_until: a.featured_until ?? "",
        }}
        categories={categories.map((c) => ({ id: c.id, name: lang === "es" ? c.name_es : c.name_ca }))}
        t={t}
        status={dict.admin.status}
        image={dict.admin.image}
        featured={dict.admin.featured}
        weekdays={dict.activities.weekdays}
        errors={dict.errors}
        common={dict.common}
      />
    </div>
  );
}
