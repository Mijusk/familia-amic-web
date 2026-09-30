import { loadPage } from "@/i18n/page";
import { requireAdmin } from "@/lib/auth";
import { ProjectForm } from "@/components/admin/project-form";
import { PageHeader } from "@/components/page-header";

export default async function NewProject({ params }: PageProps<"/[lang]/admin/projectes/nou">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/projectes/nou`);
  return (
    <div className="space-y-8">
      <PageHeader title={dict.admin.projects.new} />
      <ProjectForm
        lang={lang}
        initial={{ lang_text: lang, position: "0", status: "esborrany" }}
        t={dict.admin.projects}
        content={dict.admin.content}
        image={dict.admin.image}
        errors={dict.errors}
        common={dict.common}
      />
    </div>
  );
}
