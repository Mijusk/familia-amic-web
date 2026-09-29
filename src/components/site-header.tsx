import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { LanguageSwitcher } from "./language-switcher";

export async function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  // Solo se enlazan secciones que ya existen; el resto se añade en su fase.
  const nav = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: "#contacte", label: dict.nav.contact },
  ];

  return (
    <header className="border-b border-line bg-surface">
      <a href="#contingut" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        {dict.nav.home}
      </a>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={`/${lang}`} className="font-display text-xl font-extrabold tracking-tight">
          Família <span className="text-accent">Amic</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <nav aria-label={dict.nav.menu}>
            <ul className="flex flex-wrap items-center gap-5 font-semibold">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  <li>
                    <Link href={`/${lang}/compte`} className="hover:text-accent">
                      {dict.nav.account}
                    </Link>
                  </li>
                  <li>
                    <form action={signOut}>
                      <input type="hidden" name="lang" value={lang} />
                      <button type="submit" className="font-semibold text-muted hover:text-foreground">
                        {dict.nav.logout}
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <li>
                  <Link href={`/${lang}/entrar`} className="rounded-md border border-accent px-3 py-1.5 text-accent hover:bg-accent-soft">
                    {dict.nav.login}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <LanguageSwitcher current={lang} label={dict.nav.language} />
        </div>
      </div>
    </header>
  );
}
