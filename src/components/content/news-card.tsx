import Link from "next/link";
import { formatDate } from "@/i18n/format";
import type { News } from "@/lib/content";

export function NewsCard({ lang, news, headingLevel = "h2" }: { lang: string; news: News; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface hover:shadow-md">
      {news.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- imágenes externas o de Storage, sin optimizador
        <img src={news.image_url} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted">
          <time dateTime={news.published_on}>{formatDate(lang, news.published_on)}</time>
        </p>
        <Heading className="mt-1 font-display text-xl font-extrabold" lang={news.lang}>
          <Link href={`/${lang}/noticies/${news.slug}`} className="after:absolute after:inset-0">
            {news.title}
          </Link>
        </Heading>
        <p className="mt-2 text-muted" lang={news.lang}>
          {news.summary}
        </p>
      </div>
    </article>
  );
}
