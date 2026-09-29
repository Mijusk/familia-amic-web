import type { Metadata } from "next";
import Link from "next/link";
import { collaborators } from "@/config/collaborators";
import { site } from "@/config/site";
import { format } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { PageHeader } from "@/components/page-header";

export async function generateMetadata({ params }: PageProps<"/[lang]/associacio">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.association.title, description: dict.association.lead };
}

const h2 = "font-display text-2xl font-extrabold";

export default async function AssociationPage({ params }: PageProps<"/[lang]/associacio">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.association;
  const sections = [
    { id: "qui-som", label: t.whoTitle },
    { id: "drets", label: t.rightsTitle },
    { id: "formem-part", label: t.networksTitle },
    { id: "collaboradors", label: t.collaboratorsTitle },
    { id: "transparencia", label: t.transparencyTitle },
    { id: "denuncies", label: t.complaintsTitle },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader title={t.title} lead={t.lead} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-label={t.onThisPage} className="lg:sticky lg:top-6 lg:self-start">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="font-semibold text-accent underline underline-offset-4">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-3xl space-y-12">
          <section id="qui-som" aria-labelledby="qui-som-t">
            <h2 id="qui-som-t" className={h2}>
              {t.whoTitle}
            </h2>
            {t.who.map((p) => (
              <p key={p} className="mt-4">
                {p}
              </p>
            ))}
            <p className="mt-4 text-muted">{format(t.registry, site.registry)}</p>
          </section>

          <section id="drets" aria-labelledby="drets-t">
            <h2 id="drets-t" className={h2}>
              {t.rightsTitle}
            </h2>
            <p className="mt-4">{t.rightsLead}</p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              {t.rights.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <Link href={`/${lang}/registre`} className="mt-5 inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
              {dict.home.memberCta}
            </Link>
          </section>

          <section id="formem-part" aria-labelledby="formem-part-t">
            <h2 id="formem-part-t" className={h2}>
              {t.networksTitle}
            </h2>
            <ul className="mt-4 list-disc space-y-1 pl-6">
              {t.networks.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </section>

          <section id="collaboradors" aria-labelledby="collaboradors-t">
            <h2 id="collaboradors-t" className={h2}>
              {t.collaboratorsTitle}
            </h2>
            <p className="mt-4">{t.collaboratorsLead}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {collaborators.map((c) => (
                <li key={c} className="rounded-full border border-line bg-surface px-3 py-1 text-[0.95rem]">
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section id="transparencia" aria-labelledby="transparencia-t">
            <h2 id="transparencia-t" className={h2}>
              {t.transparencyTitle}
            </h2>
            <p className="mt-4">{t.transparency}</p>
            <p className="mt-3">
              {t.reportsAsk}{" "}
              <a href={`mailto:${site.email}`} className="font-semibold text-accent underline underline-offset-4">
                {site.email}
              </a>
            </p>
          </section>

          <section id="denuncies" aria-labelledby="denuncies-t">
            <h2 id="denuncies-t" className={h2}>
              {t.complaintsTitle}
            </h2>
            <p className="mt-4">{t.complaints}</p>
            <a href={site.complaintsForm} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-5 font-semibold hover:border-accent">
              {t.complaintsCta}
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
