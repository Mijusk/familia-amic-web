import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  // En la fase 0 solo existen Inici y Contacte; el resto de secciones se añaden en sus fases.
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
        <div className="flex flex-wrap items-center gap-6">
          <nav aria-label={dict.nav.menu}>
            <ul className="flex gap-5 font-semibold">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitcher current={lang} label={dict.nav.language} />
        </div>
      </div>
    </header>
  );
}
