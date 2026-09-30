import type { Metadata } from "next";
import Link from "next/link";
import { loadPage } from "@/i18n/page";
import { listProjects } from "@/lib/content";
import { ProjectImage } from "@/components/content/project-image";

export async function generateMetadata({ params }: PageProps<"/[lang]/projectes">): Promise<Metadata> {
  const { dict } = await loadPage(params);
  return { title: dict.projects.title, description: dict.projects.lead };
}

export default async function ProjectsPage({ params }: PageProps<"/[lang]/projectes">) {
  const { lang, dict } = await loadPage(params);
  const t = dict.projects;
  const projects = await listProjects();

  return (
    <>
      <section className="border-b border-line bg-accent-soft">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg">{t.lead}</p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {projects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
        ) : (
          <ol className="space-y-14 sm:space-y-20">
            {projects.map((p, i) => (
              <li key={p.id} className="group relative grid items-center gap-6 md:grid-cols-2 md:gap-12">
                <div className={`overflow-hidden rounded-2xl ${i % 2 ? "md:order-2" : ""}`}>
                  <ProjectImage project={p} className="aspect-[4/3] w-full transition duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                </div>
                <div lang={p.lang}>
                  <p aria-hidden="true" className="font-display text-5xl font-extrabold text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
                    <Link href={`/${lang}/projectes/${p.slug}`} className="after:absolute after:inset-0">
                      {p.title}
                    </Link>
                  </h2>
                  {p.subtitle && <p className="mt-3 text-lg text-muted">{p.subtitle}</p>}
                  <p className="mt-5 font-semibold text-accent underline-offset-4 group-hover:underline" lang={lang} aria-hidden="true">
                    {t.discover} →
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
