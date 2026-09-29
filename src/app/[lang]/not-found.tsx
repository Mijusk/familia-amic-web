"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, isLocale } from "@/i18n/config";
import ca from "@/i18n/dictionaries/ca.json";
import es from "@/i18n/dictionaries/es.json";

export default function NotFound() {
  // not-found no recibe params: deducimos el idioma de la URL.
  const segment = usePathname().split("/")[1] ?? "";
  const lang = isLocale(segment) ? segment : defaultLocale;
  const t = (lang === "es" ? es : ca).notFound;

  return (
    <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
      <p className="font-display text-6xl font-extrabold text-accent">404</p>
      <h1 className="mt-4 font-display text-3xl font-extrabold">{t.title}</h1>
      <p className="mt-3 text-muted">{t.body}</p>
      <Link href={`/${lang}`} className="mt-6 inline-block font-semibold text-accent underline underline-offset-4">
        {t.back}
      </Link>
    </section>
  );
}
