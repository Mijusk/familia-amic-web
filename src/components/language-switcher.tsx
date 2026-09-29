"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

const labels: Record<Locale, string> = { ca: "Català", es: "Castellano" };

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="flex gap-1 text-sm">
      {locales.map((locale) => {
        const href = pathname.replace(/^\/(ca|es)(?=\/|$)/, `/${locale}`);
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={href}
            lang={locale}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
            }}
            className={`rounded px-2 py-1 font-semibold ${active ? "bg-accent-soft text-accent" : "text-muted hover:text-foreground"}`}
          >
            <span aria-hidden="true">{locale.toUpperCase()}</span>
            <span className="sr-only">{labels[locale]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
