import Link from "next/link";
import { loadPage } from "@/i18n/page";
import { listActivities } from "@/lib/activities";
import { scheduleText } from "@/lib/activity-format";
import { listNews } from "@/lib/content";
import { NewsCard } from "@/components/content/news-card";

const primary = "inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90";
const secondary = "inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-5 font-semibold hover:border-accent";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.home;
  const [activities, news] = await Promise.all([listActivities(), listNews({ limit: 3 })]);

  return (
    <>
      <section className="border-b border-line bg-accent-soft">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-extrabold leading-tight sm:text-6xl">{t.title}</h1>
          <p className="mt-6 max-w-2xl text-lg">{t.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${lang}/associacio`} className={primary}>
              {t.aboutCta}
            </Link>
            <Link href={`/${lang}/registre`} className={secondary}>
              {t.memberCta}
            </Link>
            <Link href={`/${lang}/collabora`} className={secondary}>
              {t.collaborateCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6" aria-labelledby="que-fem">
        <h2 id="que-fem" className="font-display text-3xl font-extrabold">
          {t.whatTitle}
        </h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-3">
          {t.what.map((item) => (
            <li key={item.title} className="rounded-lg border border-line border-t-4 border-t-brand bg-surface p-5">
              <h3 className="font-display text-xl font-extrabold">{item.title}</h3>
              <p className="mt-2 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-surface" aria-labelledby="properes">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="properes" className="font-display text-3xl font-extrabold">
              {t.activitiesTitle}
            </h2>
            <Link href={`/${lang}/activitats`} className="font-semibold text-accent underline underline-offset-4">
              {t.allActivities}
            </Link>
          </div>
          {activities.length === 0 ? (
            <p className="mt-6 text-muted">{t.noActivities}</p>
          ) : (
            <ul className="mt-6 grid gap-5 sm:grid-cols-3">
              {activities.slice(0, 3).map((a) => (
                <li key={a.id} className="relative rounded-lg border border-line bg-background p-5 hover:shadow-md">
                  <h3 className="font-display text-xl font-extrabold" lang={a.lang}>
                    <Link href={`/${lang}/activitats/${a.slug}`} className="after:absolute after:inset-0">
                      {a.title}
                    </Link>
                  </h3>
                  <p className="mt-2 font-semibold">{scheduleText(lang, dict.activities, a)}</p>
                  <p className="mt-1 text-muted" lang={a.lang}>
                    {a.summary}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {news.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6" aria-labelledby="novetats">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="novetats" className="font-display text-3xl font-extrabold">
              {t.newsTitle}
            </h2>
            <Link href={`/${lang}/noticies`} className="font-semibold text-accent underline underline-offset-4">
              {t.allNews}
            </Link>
          </div>
          <ul className="mt-6 grid gap-5 sm:grid-cols-3">
            {news.map((n) => (
              <li key={n.id}>
                <NewsCard lang={lang} news={n} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6" aria-label={dict.nav.collaborate}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg bg-warm-soft p-6">
            <h2 className="font-display text-2xl font-extrabold">{t.volunteerTitle}</h2>
            <p className="mt-2">{t.volunteerBody}</p>
            <Link href={`/${lang}/registre?tipus=voluntari`} className={`${secondary} mt-4`}>
              {t.volunteerCta}
            </Link>
          </div>
          <div className="rounded-lg bg-accent-soft p-6">
            <h2 className="font-display text-2xl font-extrabold">{t.donateTitle}</h2>
            <p className="mt-2">{t.donateBody}</p>
            <Link href={`/${lang}/collabora`} className={`${secondary} mt-4`}>
              {t.donateCta}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
