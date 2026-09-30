import Link from "next/link";
import { formatDate } from "@/i18n/format";
import type { News } from "@/lib/content";
import { Cover } from "@/components/content/cover";

type Props = { lang: string; news: News; headingLevel?: "h2" | "h3"; titleFirst?: boolean };

/** Tarjeta de noticia. En el listado, el título va antes de la portada (titleFirst); en el inicio, la foto arriba. */
export function NewsCard({ lang, news, headingLevel = "h2", titleFirst = false }: Props) {
  const Heading = headingLevel;
  const date = (
    <p className="text-sm text-muted">
      <time dateTime={news.published_on}>{formatDate(lang, news.published_on)}</time>
    </p>
  );
  const title = (
    <Heading className="font-display text-xl font-extrabold leading-snug" lang={news.lang}>
      <Link href={`/${lang}/noticies/${news.slug}`} className="after:absolute after:inset-0">
        {news.title}
      </Link>
    </Heading>
  );
  const summary = (
    <p className="line-clamp-3 text-muted" lang={news.lang}>
      {news.summary}
    </p>
  );
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-line transition-shadow hover:shadow-lg hover:shadow-brand/10">
      {titleFirst ? (
        <>
          <div className="space-y-1 p-5 pb-4">
            {date}
            {title}
          </div>
          <Cover src={news.image_url} tone="sky" />
          <div className="flex-1 p-5 pt-4">{summary}</div>
        </>
      ) : (
        <>
          <Cover src={news.image_url} tone="sky" />
          <div className="flex flex-1 flex-col gap-1 p-5">
            {date}
            {title}
            <div className="mt-1">{summary}</div>
          </div>
        </>
      )}
    </article>
  );
}
