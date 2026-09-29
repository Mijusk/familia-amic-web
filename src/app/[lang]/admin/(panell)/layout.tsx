import type { Metadata } from "next";
import { loadPage } from "@/i18n/page";
import { AccountTabs } from "@/components/account/account-tabs";

export const metadata: Metadata = { robots: { index: false } };

// Cada página del panel llama a requireAdmin con su propia ruta; el layout solo pinta la navegación.
export default async function AdminLayout({ children, params }: LayoutProps<"/[lang]/admin">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.admin;
  const tabs = [
    { href: `/${lang}/admin`, label: t.nav.home },
    { href: `/${lang}/admin/activitats`, label: t.nav.activities },
    { href: `/${lang}/admin/families`, label: t.nav.families },
    { href: `/${lang}/admin/rebuts`, label: t.nav.receipts },
    { href: `/${lang}/admin/missatges`, label: t.nav.messages },
    { href: `/${lang}/admin/voluntaris`, label: t.nav.volunteers },
    { href: `/${lang}/admin/noticies`, label: t.nav.news },
    { href: `/${lang}/admin/recursos`, label: t.nav.resources },
    { href: `/${lang}/admin/administradors`, label: t.nav.admins },
    { href: `/${lang}/admin/registre`, label: t.nav.log },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">{t.title}</p>
      <div className="mt-4">
        <AccountTabs tabs={tabs} label={t.title} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
