import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { freeSpots, getActivity, getSpots, isCurrent, listCategories, listEnrollments, monthEnd, todayLocal, upcomingSessions } from "@/lib/activities";
import { priceText, scheduleText, spotsText } from "@/lib/activity-format";
import { getCurrentUser } from "@/lib/auth";
import { listNews, listPhotos, photoUrl } from "@/lib/content";
import { getMembership, listParticipants } from "@/lib/data";
import { EnrollForm } from "@/components/activities/enroll-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/activitats/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivity(slug);
  return activity ? { title: activity.title, description: activity.summary } : {};
}

export default async function ActivityPage({ params }: PageProps<"/[lang]/activitats/[slug]">) {
  const { lang, dict } = await loadPage(params);
  const { slug } = await params;
  const activity = await getActivity(slug);
  if (!activity) notFound();
  const t = dict.activities;

  const [spots, categories, user, photos, news] = await Promise.all([
    getSpots(),
    listCategories(),
    getCurrentUser(),
    listPhotos(activity.id),
    listNews({ activityId: activity.id, limit: 5 }),
  ]);
  const free = freeSpots(activity, spots.get(activity.id));
  const category = categories.find((c) => c.id === activity.category_id);
  const today = todayLocal();
  const ended = activity.status !== "publicada" || (activity.kind === "puntual" ? (activity.ends_on ?? activity.starts_on) < today : Boolean(activity.ends_on && activity.ends_on < today));
  const open = !ended && activity.enrollment_open;

  let enrollBlock: React.ReactNode;
  if (!open) {
    enrollBlock = <p className="text-muted">{t.enrollClosed}</p>;
  } else if (!user) {
    const next = encodeURIComponent(`/${lang}/activitats/${activity.slug}`);
    enrollBlock = (
      <div className="space-y-4">
        <p>{t.loginToEnroll}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${lang}/entrar?next=${next}`} className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
            {t.login}
          </Link>
          <Link href={`/${lang}/registre`} className="inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-5 font-semibold hover:border-accent">
            {t.register}
          </Link>
        </div>
      </div>
    );
  } else if (user.profile.account_type !== "familia") {
    enrollBlock = <p className="text-muted">{t.notFamily}</p>;
  } else {
    const [participants, enrollments, membership] = await Promise.all([listParticipants(), listEnrollments(), getMembership(user.id)]);
    const isMember = membership?.status === "pendent" || membership?.status === "actiu";
    const trialDates = isMember ? [] : upcomingSessions(activity);
    if (participants.length === 0) {
      enrollBlock = (
        <div className="space-y-3">
          <p>{t.noParticipants}</p>
          <Link href={`/${lang}/compte/familia/nou`} className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
            {t.addParticipant}
          </Link>
        </div>
      );
    } else if (!isMember && trialDates.length === 0) {
      enrollBlock = <p className="text-muted">{t.enrollClosed}</p>;
    } else {
      const people = participants.map((p) => {
        const here = enrollments.find((e) => e.activity_id === activity.id && e.participant_id === p.id && isCurrent(e, today));
        const trialUsed = enrollments.some((e) => e.participant_id === p.id && e.is_trial && e.status !== "baixa");
        const note = here
          ? here.status === "cua"
            ? t.inQueue
            : t.alreadyIn
          : !isMember && trialUsed
            ? t.results.prova_usada
            : undefined;
        return { id: p.id, name: `${p.first_name} ${p.last_name}`, note };
      });
      enrollBlock = (
        <EnrollForm
          lang={lang}
          slug={activity.slug}
          recurrent={activity.kind === "recurrent"}
          isMember={isMember}
          full={free === 0}
          people={people}
          trialDates={trialDates}
          monthEnd={monthEnd(today > activity.starts_on ? today : activity.starts_on)}
          t={t}
          errors={dict.errors}
          common={dict.common}
        />
      );
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href={`/${lang}/activitats`} className="font-semibold text-accent underline underline-offset-4">
        ← {t.back}
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <article lang={activity.lang}>
          {activity.image_url && (
            // eslint-disable-next-line @next/next/no-img-element -- imagen de Storage, sin optimizador
            <img src={activity.image_url} alt="" className="mb-6 aspect-[16/9] w-full rounded-lg object-cover" />
          )}
          {category && (
            <p className="text-sm font-semibold uppercase tracking-wider text-accent" lang={lang}>
              {lang === "es" ? category.name_es : category.name_ca}
            </p>
          )}
          <h1 className="mt-1 font-display text-4xl font-extrabold">{activity.title}</h1>
          {activity.status !== "publicada" && activity.status !== "esborrany" && (
            <p className="mt-2 inline-block rounded-full bg-warm-soft px-3 py-1 font-semibold text-warm" lang={lang}>
              {t.closedStatus[activity.status]}
            </p>
          )}
          <p className="mt-4 text-lg">{activity.summary}</p>
          {activity.description && <div className="mt-4 whitespace-pre-line text-muted">{activity.description}</div>}

          {photos.length > 0 && (
            <section className="mt-10" aria-labelledby="fotos" lang={lang}>
              <h2 id="fotos" className="font-display text-2xl font-extrabold">
                {t.photos}
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((p) => (
                  <li key={p.id}>
                    <figure>
                      <a href={photoUrl(p.path)} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element -- fotos de Storage, sin optimizador de imágenes */}
                        <img src={photoUrl(p.path)} alt={p.caption || t.photoAlt} className="aspect-[4/3] w-full rounded-md object-cover" loading="lazy" />
                      </a>
                      {p.caption && <figcaption className="mt-1 text-sm text-muted">{p.caption}</figcaption>}
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {news.length > 0 && (
            <section className="mt-10" aria-labelledby="noticies" lang={lang}>
              <h2 id="noticies" className="font-display text-2xl font-extrabold">
                {t.relatedNews}
              </h2>
              <ul className="mt-3 space-y-2">
                {news.map((n) => (
                  <li key={n.id}>
                    <Link href={`/${lang}/noticies/${n.slug}`} className="font-semibold text-accent underline underline-offset-4" lang={n.lang}>
                      {n.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="space-y-6" lang={lang}>
          <dl className="space-y-3 rounded-lg border border-line border-t-4 border-t-brand bg-surface p-5">
            <div>
              <dt className="text-sm text-muted">{t.when}</dt>
              <dd className="font-semibold">{scheduleText(lang, t, activity)}</dd>
            </div>
            {activity.location && (
              <div>
                <dt className="text-sm text-muted">{t.where}</dt>
                <dd className="font-semibold">{activity.location}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted">{t.price}</dt>
              <dd className="font-semibold">{priceText(lang, t, activity)}</dd>
              {activity.payment_method === "rebut" && activity.price_cents ? <dd className="text-sm text-muted">{t.paymentRebut}</dd> : null}
              {activity.payment_method === "transferencia" && <dd className="text-sm text-muted">{activity.payment_notes || t.paymentTransferencia}</dd>}
            </div>
            <div>
              <dt className="text-sm text-muted">{t.spots}</dt>
              <dd className={`font-semibold ${free === 0 ? "text-warm" : ""}`}>{spotsText(t, free)}</dd>
            </div>
          </dl>

          <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby="enroll-title">
            <h2 id="enroll-title" className="font-display text-2xl font-extrabold">
              {t.enrollTitle}
            </h2>
            <div className="mt-4">{enrollBlock}</div>
          </section>
        </aside>
      </div>
    </div>
  );
}
