import type { Metadata } from "next";
import { loadPage } from "@/i18n/page";
import { getCurrentUser } from "@/lib/auth";
import { AccountTabs } from "@/components/account/account-tabs";

export const metadata: Metadata = { robots: { index: false } };

export default async function AccountLayout({ children, params }: LayoutProps<"/[lang]/compte">) {
  const { lang, dict } = await loadPage(params);
  // Cada página llama a requireUser con su propia ruta, para volver a ella tras entrar.
  const user = await getCurrentUser();
  if (!user) return children;
  const t = dict.account;
  const tabs =
    user.profile.account_type === "familia"
      ? [
          { href: `/${lang}/compte`, label: t.tabs.summary },
          { href: `/${lang}/compte/familia`, label: t.tabs.family },
          { href: `/${lang}/compte/inscripcions`, label: t.tabs.enrollments },
          { href: `/${lang}/compte/soci`, label: t.tabs.membership },
        ]
      : [{ href: `/${lang}/compte`, label: t.tabs.summary }];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">{t.title}</p>
      <div className="mt-4">
        <AccountTabs tabs={tabs} label={t.title} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
