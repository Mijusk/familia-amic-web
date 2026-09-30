import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { listActivities } from "@/lib/activities";
import { listNews, listResources } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

// Páginas públicas, en los dos idiomas. Las de cuenta y panel quedan fuera (y bloqueadas en robots).
const pages = ["", "/associacio", "/activitats", "/noticies", "/recursos", "/collabora", "/contacte", "/legal/avis-legal", "/legal/privacitat", "/legal/cookies", "/legal/accessibilitat"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [activities, news, resources] = await Promise.all([listActivities(), listNews(), listResources()]);
  const paths: { path: string; lastModified?: string }[] = [
    ...pages.map((path) => ({ path })),
    ...activities.map((a) => ({ path: `/activitats/${a.slug}` })),
    ...news.map((n) => ({ path: `/noticies/${n.slug}`, lastModified: n.published_on })),
    ...resources.map((r) => ({ path: `/recursos/${r.slug}` })),
  ];
  return paths.flatMap(({ path, lastModified }) =>
    locales.map((lang) => ({
      url: `${siteUrl}/${lang}${path}`,
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) },
    })),
  );
}
