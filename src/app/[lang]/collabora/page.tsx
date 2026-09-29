import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { loadPage } from "@/i18n/page";
import { PageHeader } from "@/components/page-header";

export async function generateMetadata({ params }: PageProps<"/[lang]/collabora">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.collaborate.title, description: dict.collaborate.lead };
}

const card = "flex flex-col rounded-lg border border-line border-t-4 border-t-brand bg-surface p-6";
const button = "mt-auto inline-flex min-h-11 w-fit items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90";

export default async function CollaboratePage({ params }: PageProps<"/[lang]/collabora">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.collaborate;

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
      <PageHeader title={t.title} lead={t.lead} />
      <div className="grid gap-5 md:grid-cols-3">
        <section className={card} aria-labelledby="soci">
          <h2 id="soci" className="font-display text-2xl font-extrabold">
            {t.memberTitle}
          </h2>
          <p className="mb-5 mt-2">{t.memberBody}</p>
          <Link href={`/${lang}/registre`} className={button}>
            {dict.home.memberCta}
          </Link>
        </section>
        <section className={card} aria-labelledby="voluntari">
          <h2 id="voluntari" className="font-display text-2xl font-extrabold">
            {t.volunteerTitle}
          </h2>
          <p className="mb-5 mt-2">{t.volunteerBody}</p>
          <Link href={`/${lang}/registre?tipus=voluntari`} className={button}>
            {dict.home.volunteerCta}
          </Link>
        </section>
        <section className={card} aria-labelledby="donatiu">
          <h2 id="donatiu" className="font-display text-2xl font-extrabold">
            {t.donateTitle}
          </h2>
          <p className="mt-2">{t.donateBody}</p>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-muted">Bizum</dt>
              <dd className="font-display text-2xl font-extrabold">{site.bizum}</dd>
            </div>
            {site.donationIban && (
              <div>
                <dt className="text-sm text-muted">{t.iban}</dt>
                <dd className="break-all font-semibold">{site.donationIban}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-sm text-muted">{t.donateNote}</p>
        </section>
      </div>
      <p className="max-w-3xl">
        {t.companies}{" "}
        <Link href={`/${lang}/contacte`} className="font-semibold text-accent underline underline-offset-4">
          {t.companiesCta}
        </Link>
      </p>
    </div>
  );
}
