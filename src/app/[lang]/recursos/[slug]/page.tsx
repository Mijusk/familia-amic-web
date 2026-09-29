import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { getResource } from "@/lib/content";
import { RichText } from "@/components/rich-text";

export async function generateMetadata({ params }: PageProps<"/[lang]/recursos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = await getResource(slug);
  return r ? { title: r.title, description: r.summary || undefined } : {};
}

export default async function ResourceDetail({ params }: PageProps<"/[lang]/recursos/[slug]">) {
  const { lang, dict } = await loadPage(params);
  const { slug } = await params;
  const r = await getResource(slug);
  if (!r) notFound();
  const t = dict.resources;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href={`/${lang}/recursos?categoria=${r.category}`} className="font-semibold text-accent underline underline-offset-4">
        ← {t.categories[r.category]}
      </Link>
      <article className="mt-6" lang={r.lang}>
        <h1 className="max-w-3xl font-display text-4xl font-extrabold">{r.title}</h1>
        {r.summary && <p className="mt-4 max-w-3xl text-lg">{r.summary}</p>}
        {r.body && (
          <div className="mt-6">
            <RichText source={r.body} />
          </div>
        )}
      </article>
      {r.external_url && (
        <p className="mt-8" lang={lang}>
          <a href={r.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-5 font-semibold hover:border-accent">
            {t.officialLink}
          </a>
        </p>
      )}
      <p className="mt-8 max-w-3xl rounded-lg bg-accent-soft p-5" lang={lang}>
        {t.help}{" "}
        <Link href={`/${lang}/contacte`} className="font-semibold text-accent underline underline-offset-4">
          {t.helpCta}
        </Link>
      </p>
    </div>
  );
}
