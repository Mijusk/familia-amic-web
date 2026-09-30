import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { getLinkedActivity, getNews, listNewsPhotos, photoUrl } from "@/lib/content";
import { Gallery, type GalleryImage } from "@/components/content/gallery";
import { RichText } from "@/components/rich-text";

export async function generateMetadata({ params }: PageProps<"/[lang]/noticies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);
  return news ? { title: news.title, description: news.summary } : {};
}

export default async function NewsDetail({ params }: PageProps<"/[lang]/noticies/[slug]">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.news;
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) notFound();
  const [activity, photos] = await Promise.all([news.activity_id ? getLinkedActivity(news.activity_id) : null, listNewsPhotos(news.id)]);
  // La portada es la primera foto del visor; después, las fotos de la galería.
  const images: GalleryImage[] = [
    ...(news.image_url ? [{ src: news.image_url, alt: news.title }] : []),
    ...photos.map((p) => ({ src: photoUrl(p.path), alt: p.caption || t.photoAlt, caption: p.caption || undefined })),
  ];

  const specs = (
    <dl className="grid gap-4 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line" lang={lang}>
      <div>
        <dt className="text-sm font-semibold uppercase tracking-wider text-muted">{t.date}</dt>
        <dd className="mt-0.5 text-lg font-semibold">
          <time dateTime={news.published_on}>{formatDate(lang, news.published_on)}</time>
        </dd>
      </div>
      {activity && (
        <div>
          <dt className="text-sm font-semibold uppercase tracking-wider text-muted">{t.activityLabel}</dt>
          <dd className="mt-0.5 text-lg">
            <Link href={`/${lang}/activitats/${activity.slug}`} className="font-semibold text-accent underline underline-offset-4" lang={activity.lang}>
              {activity.title}
            </Link>
          </dd>
        </div>
      )}
    </dl>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href={`/${lang}/noticies`} className="font-semibold text-accent underline underline-offset-4">
        ← {t.back}
      </Link>
      <article className="mt-6" lang={news.lang}>
        <h1 className="max-w-4xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">{news.title}</h1>
        <div className={`mt-6 grid items-start gap-6 ${images.length > 0 ? "lg:grid-cols-[1.6fr_1fr]" : ""}`}>
          {images.length > 0 && <Gallery images={images} labels={dict.gallery} />}
          {specs}
        </div>
        <p className="mt-8 max-w-3xl text-xl leading-relaxed">{news.summary}</p>
        {news.body && (
          <div className="mt-6 max-w-3xl">
            <RichText source={news.body} />
          </div>
        )}
      </article>
    </div>
  );
}
