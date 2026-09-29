import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { format } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { PageHeader } from "@/components/page-header";

const pages = ["avis-legal", "privacitat", "cookies", "accessibilitat"] as const;
type LegalPage = (typeof pages)[number];
const isLegalPage = (p: string): p is LegalPage => (pages as readonly string[]).includes(p);

export function generateStaticParams() {
  return pages.map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/legal/[page]">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  const { page } = await params;
  return isLegalPage(page) ? { title: dict.legal.pages[page].title } : {};
}

export default async function LegalPage({ params }: PageProps<"/[lang]/legal/[page]">) {
  const { dict } = await loadPage(params);
  const { page } = await params;
  if (!isLegalPage(page)) notFound();
  const t = dict.legal.pages[page];
  const vars = { name: site.name, email: site.email, address: site.address, registry: site.registry.generalitat };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader title={t.title} lead={dict.legal.updated} />
      <div className="mt-8 max-w-3xl space-y-8">
        {t.sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-2xl font-extrabold">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-3">
                {format(p, vars)}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
