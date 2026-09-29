import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { home } = await getDictionary(lang);

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">{home.eyebrow}</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">{home.title}</h1>
      <p className="mt-6 max-w-2xl text-lg text-muted">{home.lead}</p>
      <a
        href="#contacte"
        className="mt-8 inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90"
      >
        {home.contactCta}
      </a>
    </section>
  );
}
