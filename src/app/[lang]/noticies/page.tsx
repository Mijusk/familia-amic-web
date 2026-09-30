import type { Metadata } from "next";
import { loadPage } from "@/i18n/page";
import { listNews } from "@/lib/content";
import { NewsCard } from "@/components/content/news-card";
import { PageHeader } from "@/components/page-header";

export async function generateMetadata({ params }: PageProps<"/[lang]/noticies">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.news.title, description: dict.news.lead };
}

export default async function NewsPage({ params }: PageProps<"/[lang]/noticies">) {
  const { lang, dict } = await loadPage(params);
  const news = await listNews();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader title={dict.news.title} lead={dict.news.lead} />
      {news.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{dict.news.empty}</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <li key={n.id}>
              <NewsCard lang={lang} news={n} titleFirst />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
