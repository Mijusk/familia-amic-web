import Link from "next/link";
import { format, formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { listActivities, todayLocal } from "@/lib/activities";
import { listFeatured, listHomeSlides, listNews } from "@/lib/content";
import { ActivityCard } from "@/components/activities/activity-card";
import { Cover } from "@/components/content/cover";
import { NewsCard } from "@/components/content/news-card";
import { CardRail } from "@/components/home/card-rail";
import { HeroSlider } from "@/components/home/hero-slider";
import { Reveal } from "@/components/reveal";

const primary = "inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-semibold text-accent-contrast shadow-sm hover:opacity-90";
const secondary = "inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-6 font-semibold hover:border-accent";
const more = "inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4";
const whatTones = ["bg-mint-soft", "bg-warm-soft", "bg-sky-soft"];

/** Dibujo del inicio mientras no haya fotos subidas desde el panel. */
function HeroArt() {
  return (
    <div aria-hidden="true" className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mint-soft ring-1 ring-line">
      <span className="absolute -left-10 top-8 size-48 rounded-full bg-brand/25" />
      <span className="absolute bottom-6 left-1/3 size-32 rounded-full bg-warm-soft" />
      <span className="absolute -right-8 -top-10 size-56 rounded-full bg-sky-soft" />
      <span className="absolute bottom-10 right-10 size-24 rounded-full bg-brand/40" />
      <span className="absolute left-1/2 top-1/3 size-14 rounded-full bg-white" />
    </div>
  );
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.home;
  const [activities, news, slides, featured] = await Promise.all([listActivities(), listNews({ limit: 8 }), listHomeSlides(), listFeatured(todayLocal())]);
  const railLabels = { prev: t.railPrev, next: t.railNext };
  // Primero los eventos que se acercan, por fecha; después las actividades de cada semana.
  const upcoming = [...activities].sort((a, b) => (a.kind === b.kind ? a.starts_on.localeCompare(b.starts_on) : a.kind === "puntual" ? -1 : 1)).slice(0, 10);
  // Un solo destacado ocupa todo el ancho, con la foto al lado; si hay más, van en columnas.
  const single = featured.length === 1;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-accent-soft to-background">
        <span aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full bg-brand/10 blur-2xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="inline-flex rounded-full bg-surface px-4 py-1.5 text-sm font-semibold text-accent shadow-sm ring-1 ring-line">{t.eyebrow}</p>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{t.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted">{t.lead}</p>
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
          {/* En el móvil las fotos van primero, para que se vean sin tener que bajar. */}
          <div className="order-first lg:order-none">
            {slides.length > 0 ? (
              <HeroSlider
              slides={slides}
              labels={{ prev: t.sliderPrev, next: t.sliderNext, pause: t.sliderPause, play: t.sliderPlay, slide: t.sliderSlide, region: t.sliderRegion }}
            />
            ) : (
              <HeroArt />
            )}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-6" aria-labelledby="destacat">
          <h2 id="destacat" className="sr-only">
            {t.featuredTitle}
          </h2>
          <ul className={single ? "" : "grid gap-6 md:grid-cols-2"}>
            {featured.map((f) => {
              const href = f.kind === "activity" ? `/${lang}/activitats/${f.slug}` : `/${lang}/noticies/${f.slug}`;
              const badge = f.kind === "news" ? t.badgeNews : f.activity_kind === "puntual" ? t.badgeEvent : t.badgeActivity;
              return (
                <li key={`${f.kind}-${f.slug}`} className="h-full">
                  <Reveal className="h-full">
                    <article className={`group relative grid h-full overflow-hidden rounded-2xl bg-surface shadow-lg shadow-brand/10 ring-2 ring-brand/40 ${single ? "md:grid-cols-[1.2fr_1fr]" : "grid-rows-[auto_1fr]"}`}>
                      <Cover src={f.image_url} tone="warm" className={single ? "aspect-[16/9] md:aspect-auto md:min-h-72" : "aspect-[16/9]"} />
                      <div className="flex flex-col justify-center p-6 sm:p-7">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-white">
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
                              <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z" />
                            </svg>
                            {t.featuredTitle}
                          </span>
                          <span className="rounded-full bg-warm-soft px-3 py-1 text-warm">{badge}</span>
                        </p>
                        <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight sm:text-3xl" lang={f.lang}>
                          <Link href={href} className="after:absolute after:inset-0">
                            {f.title}
                          </Link>
                        </h3>
                        <p className="mt-3 text-muted" lang={f.lang}>
                          {f.summary}
                        </p>
                        <p className="mt-2 text-sm text-muted">{format(t.featuredUntil, { date: formatDate(lang, f.featured_until) })}</p>
                        <span aria-hidden="true" className={`${primary} mt-6 self-start`}>
                          {f.kind === "activity" && f.enrollment_open ? t.featuredActivityCta : f.kind === "activity" ? t.moreInfo : t.featuredNewsCta}
                        </span>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6" aria-labelledby="properes">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="properes" className="font-display text-3xl font-extrabold">
              {t.activitiesTitle}
            </h2>
            <Link href={`/${lang}/activitats`} className={more}>
              {t.allActivities}
            </Link>
          </div>
          {activities.length === 0 ? (
            <p className="mt-6 rounded-xl bg-mint-soft p-6 text-muted">{t.noActivities}</p>
          ) : (
            <div className="mt-6">
              <CardRail labels={railLabels} label={t.activitiesTitle}>
                {upcoming.map((a) => (
                  <ActivityCard key={a.id} lang={lang} activity={a} t={dict.activities} badges={{ event: t.badgeEvent, weekly: t.weekly }} />
                ))}
              </CardRail>
            </div>
          )}
        </Reveal>
      </section>

      {news.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6" aria-labelledby="novetats">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="novetats" className="font-display text-3xl font-extrabold">
                {t.newsTitle}
              </h2>
              <Link href={`/${lang}/noticies`} className={more}>
                {t.allNews}
              </Link>
            </div>
            <div className="mt-6">
              <CardRail labels={railLabels} label={t.newsTitle}>
                {news.map((n) => (
                  <NewsCard key={n.id} lang={lang} news={n} headingLevel="h3" />
                ))}
              </CardRail>
            </div>
          </Reveal>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6" aria-labelledby="que-fem">
        <Reveal>
          <h2 id="que-fem" className="font-display text-3xl font-extrabold">
            {t.whatTitle}
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-3">
            {t.what.map((item, i) => (
              <li key={item.title} className={`rounded-xl p-6 ${whatTones[i % whatTones.length]}`}>
                <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-surface font-display text-lg font-extrabold text-accent shadow-sm">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-extrabold">{item.title}</h3>
                <p className="mt-2 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-label={dict.nav.collaborate}>
        <Reveal className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-warm-soft p-7">
            <h2 className="font-display text-2xl font-extrabold">{t.volunteerTitle}</h2>
            <p className="mt-2">{t.volunteerBody}</p>
            <Link href={`/${lang}/registre?tipus=voluntari`} className={`${secondary} mt-5`}>
              {t.volunteerCta}
            </Link>
          </div>
          <div className="rounded-xl bg-accent-soft p-7">
            <h2 className="font-display text-2xl font-extrabold">{t.donateTitle}</h2>
            <p className="mt-2">{t.donateBody}</p>
            <Link href={`/${lang}/collabora`} className={`${secondary} mt-5`}>
              {t.donateCta}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
