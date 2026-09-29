import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";

export async function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  const nav = [
    { href: `/${lang}/associacio`, label: dict.nav.association },
    { href: `/${lang}/activitats`, label: dict.nav.activities },
    { href: `/${lang}/noticies`, label: dict.nav.news },
    { href: `/${lang}/recursos`, label: dict.nav.resources },
    { href: `/${lang}/collabora`, label: dict.nav.collaborate },
    { href: `/${lang}/contacte`, label: dict.nav.contact },
  ];

  const accountLinks = (vertical: boolean) =>
    user ? (
      <>
        <li>
          <Link href={`/${lang}/compte`} className="hover:text-accent">
            {dict.nav.account}
          </Link>
        </li>
        {user.profile.account_type === "admin" && (
          <li>
            <Link href={`/${lang}/admin`} className="hover:text-accent">
              {dict.nav.admin}
            </Link>
          </li>
        )}
        <li>
          <form action={signOut}>
            <input type="hidden" name="lang" value={lang} />
            <button type="submit" className={`font-semibold text-muted hover:text-foreground ${vertical ? "min-h-11" : ""}`}>
              {dict.nav.logout}
            </button>
          </form>
        </li>
      </>
    ) : (
      <li>
        <Link href={`/${lang}/entrar`} className="inline-flex min-h-11 items-center rounded-md border border-accent px-3 text-accent hover:bg-accent-soft">
          {dict.nav.login}
        </Link>
      </li>
    );

  return (
    <header className="relative border-t-4 border-b border-t-brand border-b-line bg-surface">
      <a href="#contingut" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        {dict.nav.skip}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={`/${lang}`} className="font-display text-xl font-extrabold leading-tight tracking-tight">
          Família <span className="text-accent">Amic</span>
          <span className="block text-xs font-bold uppercase tracking-widest text-muted">{dict.nav.tagline}</span>
        </Link>

        <nav aria-label={dict.nav.menu} className="hidden lg:block">
          <ul className="flex items-center gap-5 font-semibold">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
            {accountLinks(false)}
          </ul>
        </nav>
        <div className="hidden lg:block">
          <LanguageSwitcher current={lang} label={dict.nav.language} />
        </div>

        <MobileMenu label={dict.nav.menu}>
          <nav aria-label={dict.nav.menu}>
            <ul className="grid gap-1 text-lg font-semibold [&_a]:flex [&_a]:min-h-11 [&_a]:items-center">
              <li>
                <Link href={`/${lang}`} className="hover:text-accent">
                  {dict.nav.home}
                </Link>
              </li>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-4 grid gap-2 border-t border-line pt-4 font-semibold">{accountLinks(true)}</ul>
          </nav>
          <div className="mt-4">
            <LanguageSwitcher current={lang} label={dict.nav.language} />
          </div>
        </MobileMenu>
      </div>
    </header>
  );
}
