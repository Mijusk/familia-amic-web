import { loadPage } from "@/i18n/page";
import { listAccounts } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { GrantAdminForm } from "@/components/admin/grant-admin-form";
import { PageHeader } from "@/components/page-header";

export default async function Admins({ params }: PageProps<"/[lang]/admin/administradors">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/administradors`);
  const t = dict.admin.admins;
  const admins = (await listAccounts()).filter((a) => a.account_type === "admin");
  return (
    <div className="space-y-10">
      <PageHeader title={t.title} lead={t.lead} />
      <GrantAdminForm lang={lang} t={t} errors={dict.errors} common={dict.common} />
      <section>
        <h2 className="font-display text-2xl font-extrabold">{t.list}</h2>
        <ul className="mt-4 space-y-2">
          {admins.map((a) => (
            <li key={a.id}>
              <span className="font-semibold">{a.full_name}</span> <span className="text-muted">· {a.email}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
