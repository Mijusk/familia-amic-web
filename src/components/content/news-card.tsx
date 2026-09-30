import Link from "next/link";
import { formatDate } from "@/i18n/format";
import type { News } from "@/lib/content";
import { Cover } from "@/components/content/cover";

export function NewsCard({ lang, news, headingLevel = "h2" }: { lang: string; news: News; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-line transition-shadow hover:shadow-lg hover:shadow-brand/10">
      <Cover src={news.image_url} tone="sky" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted">
          <time dateTime={news.published_on}>{formatDate(lang, news.published_on)}</time>
        </p>
        <Heading className="mt-1 font-display text-xl font-extrabold leading-snug" lang={news.lang}>
          <Link href={`/${lang}/noticies/${news.slug}`} className="after:absolute after:inset-0">
            {news.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-3 text-muted" lang={news.lang}>
          {news.summary}
        </p>
      </div>
    </article>
  );
}
