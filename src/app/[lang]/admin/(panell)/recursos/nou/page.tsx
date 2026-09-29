import { loadPage } from "@/i18n/page";
import { requireAdmin } from "@/lib/auth";
import { ResourceForm } from "@/components/admin/resource-form";
import { PageHeader } from "@/components/page-header";

export default async function NewResource({ params }: PageProps<"/[lang]/admin/recursos/nou">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/recursos/nou`);
  return (
    <div className="space-y-8">
      <PageHeader title={dict.admin.resources.new} />
      <ResourceForm
        lang={lang}
        initial={{ lang_text: lang, category: "legals", status: "esborrany" }}
        t={dict.admin.resources}
        content={dict.admin.content}
        categories={dict.resources.categories}
        errors={dict.errors}
        common={dict.common}
      />
    </div>
  );
}
