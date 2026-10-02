import { loadPage } from "@/i18n/page";
import { listCategories, todayLocal } from "@/lib/activities";
import { requireAdmin } from "@/lib/auth";
import { ActivityForm } from "@/components/admin/activity-form";
import { PageHeader } from "@/components/page-header";

export default async function NewActivity({ params }: PageProps<"/[lang]/admin/activitats/nova">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/activitats/nova`);
  const categories = await listCategories();
  const t = dict.admin.activities;
  return (
    <div className="space-y-8">
      <PageHeader title={t.newTitle} />
      <ActivityForm
        lang={lang}
        initial={{
          title: "",
          slug: "",
          lang_text: lang,
          summary: "",
          description: "",
          category_id: "",
          kind: "recurrent",
          weekday: "",
          start_time: "",
          end_time: "",
          starts_on: todayLocal(),
          ends_on: "",
          location: "",
          capacity: "",
          price: "",
          payment_method: "rebut",
          payment_notes: "",
          status: "esborrany",
          enrollment_open: "on",
        }}
        categories={categories.map((c) => ({ id: c.id, name: lang === "es" ? c.name_es : c.name_ca }))}
        t={t}
        status={dict.admin.status}
        image={dict.admin.image}
        featured={dict.admin.featured}
        weekdays={dict.activities.weekdays}
        errors={dict.errors}
        common={dict.common}
        preview={{ t: dict.admin.preview, activities: dict.activities, badges: { event: dict.home.badgeEvent, weekly: dict.home.weekly } }}
      />
    </div>
  );
}
