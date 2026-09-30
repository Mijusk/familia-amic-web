import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import { LanguageSwitcher } from "./language-switcher";
import { SiteMenu } from "./site-menu";

export async function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  const nav = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/associacio`, label: dict.nav.association },
    { href: `/${lang}/projectes`, label: dict.nav.projects },
    { href: `/${lang}/activitats`, label: dict.nav.activities },
    { href: `/${lang}/noticies`, label: dict.nav.news },
    { href: `/${lang}/recursos`, label: dict.nav.resources },
    { href: `/${lang}/collabora`, label: dict.nav.collaborate },
    { href: `/${lang}/contacte`, label: dict.nav.contact },
  ];

  return (
    <header className="relative border-t-4 border-b border-t-brand border-b-line bg-surface">
      <a href="#contingut" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        {dict.nav.skip}
      </a>
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6">
        <Link href={`/${lang}`} className="mr-auto font-display text-xl font-extrabold leading-tight tracking-tight">
          Família <span className="text-accent">Amic</span>
          <span className="hidden text-xs font-bold uppercase tracking-widest text-muted min-[400px]:block">{dict.nav.tagline}</span>
        </Link>

        <Link href={`/${lang}/activitats`} className="hidden font-semibold hover:text-accent md:block">
          {dict.nav.activities}
        </Link>
        <div className="hidden sm:block">
          <LanguageSwitcher current={lang} label={dict.nav.language} />
        </div>

        {/* Siempre a la vista, también en el móvil: entrar o ir a la cuenta. */}
        {user ? (
          <Link
            href={`/${lang}/compte`}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-accent px-3 font-semibold text-accent hover:bg-accent-soft"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
            <span className="sr-only sm:not-sr-only">{dict.nav.account}</span>
          </Link>
        ) : (
          <Link href={`/${lang}/entrar`} className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 font-semibold text-accent-contrast hover:opacity-90">
            {dict.nav.login}
          </Link>
        )}

        <SiteMenu label={dict.nav.menu}>
          <nav aria-label={dict.nav.menu}>
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex min-h-12 items-center border-b border-line font-display text-xl font-extrabold hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <ul className="flex flex-wrap items-center gap-3 font-semibold">
              {user ? (
                <>
                  <li>
                    <Link href={`/${lang}/compte`} className="inline-flex min-h-11 items-center rounded-md border border-line px-4 hover:border-accent">
                      {dict.nav.account}
                    </Link>
                  </li>
                  {user.profile.account_type === "admin" && (
                    <li>
                      <Link href={`/${lang}/admin`} className="inline-flex min-h-11 items-center rounded-md border border-line px-4 hover:border-accent">
                        {dict.nav.admin}
                      </Link>
                    </li>
                  )}
                  <li>
                    <form action={signOut}>
                      <input type="hidden" name="lang" value={lang} />
                      <button type="submit" className="min-h-11 px-2 text-muted underline underline-offset-4 hover:text-foreground">
                        {dict.nav.logout}
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href={`/${lang}/entrar`} className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 text-accent-contrast hover:opacity-90">
                      {dict.nav.login}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/registre`} className="inline-flex min-h-11 items-center rounded-md border border-line px-5 hover:border-accent">
                      {dict.nav.register}
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <div className="sm:hidden">
              <LanguageSwitcher current={lang} label={dict.nav.language} />
            </div>
          </div>
        </SiteMenu>
      </div>
    </header>
  );
}
