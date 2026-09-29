import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { getLinkedActivity, getNews } from "@/lib/content";
import { RichText } from "@/components/rich-text";

export async function generateMetadata({ params }: PageProps<"/[lang]/noticies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);
  return news ? { title: news.title, description: news.summary } : {};
}

export default async function NewsDetail({ params }: PageProps<"/[lang]/noticies/[slug]">) {
  const { lang, dict } = await loadPage(params);
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) notFound();
  const activity = news.activity_id ? await getLinkedActivity(news.activity_id) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href={`/${lang}/noticies`} className="font-semibold text-accent underline underline-offset-4">
        ← {dict.news.back}
      </Link>
      <article className="mt-6" lang={news.lang}>
        <p className="text-muted" lang={lang}>
          <time dateTime={news.published_on}>{formatDate(lang, news.published_on)}</time>
        </p>
        <h1 className="mt-1 max-w-3xl font-display text-4xl font-extrabold">{news.title}</h1>
        <p className="mt-4 max-w-3xl text-lg">{news.summary}</p>
        {news.image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- imágenes externas o de Storage, sin optimizador
          <img src={news.image_url} alt="" className="mt-6 max-h-[28rem] w-full max-w-3xl rounded-lg object-cover" />
        )}
        {news.body && (
          <div className="mt-6">
            <RichText source={news.body} />
          </div>
        )}
      </article>
      {activity && (
        <p className="mt-8 max-w-3xl rounded-lg border border-line bg-surface p-5" lang={lang}>
          {dict.news.relatedActivity}{" "}
          <Link href={`/${lang}/activitats/${activity.slug}`} className="font-semibold text-accent underline underline-offset-4" lang={activity.lang}>
            {activity.title}
          </Link>
        </p>
      )}
    </div>
  );
}
