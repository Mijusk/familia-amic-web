import { loadPage } from "@/i18n/page";
import { todayLocal } from "@/lib/activities";
import { listAllActivities } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { NewsForm } from "@/components/admin/news-form";
import { PageHeader } from "@/components/page-header";

export default async function NewNews({ params }: PageProps<"/[lang]/admin/noticies/nova">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/noticies/nova`);
  const activities = await listAllActivities();
  return (
    <div className="space-y-8">
      <PageHeader title={dict.admin.news.new} />
      <NewsForm
        lang={lang}
        initial={{ lang_text: lang, published_on: todayLocal(), status: "esborrany" }}
        activities={activities.map((a) => ({ id: a.id, title: a.title }))}
        t={dict.admin.news}
        content={dict.admin.content}
        image={dict.admin.image}
        featured={dict.admin.featured}
        errors={dict.errors}
        common={dict.common}
      />
    </div>
  );
}
