import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { getProject, listProjectPhotos, listProjects, photoUrl } from "@/lib/content";
import { framed, parseFrame } from "@/lib/image-frame";
import { ProjectImage } from "@/components/content/project-image";
import { RichText } from "@/components/rich-text";

export async function generateMetadata({ params }: PageProps<"/[lang]/projectes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.subtitle || undefined,
    ...(project.image_url ? { openGraph: { images: [parseFrame(project.image_url).src] } } : {}),
  };
}

export default async function ProjectDetail({ params }: PageProps<"/[lang]/projectes/[slug]">) {
  const { lang, dict } = await loadPage(params);
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const t = dict.projects;
  const [photos, all] = await Promise.all([listProjectPhotos(project.id), listProjects()]);
  const others = all.filter((p) => p.id !== project.id).slice(0, 3);
  const cover = project.image_url;

  return (
    <>
      <header className="relative isolate overflow-hidden border-b border-line bg-accent-soft">
        {cover && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- imagen de Storage, sin optimizador */}
            <img src={framed(cover).src} alt="" style={framed(cover).style} className="absolute inset-0 -z-10 size-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          </>
        )}
        <div className={`mx-auto flex max-w-5xl flex-col px-4 sm:px-6 ${cover ? "min-h-[24rem] justify-between py-8 text-white sm:min-h-[30rem]" : "py-12 sm:py-16"}`}>
          <Link href={`/${lang}/projectes`} className={`self-start font-semibold underline underline-offset-4 ${cover ? "rounded bg-black/40 px-2 py-1 text-white" : "text-accent"}`}>
            ← {t.back}
          </Link>
          <div className="mt-10" lang={project.lang}>
            <p className={`text-sm font-semibold uppercase tracking-widest ${cover ? "text-white/90" : "text-accent"}`} lang={lang}>
              {t.eyebrow}
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">{project.title}</h1>
            {project.subtitle && <p className={`mt-4 max-w-2xl text-lg sm:text-xl ${cover ? "text-white/95" : ""}`}>{project.subtitle}</p>}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div lang={project.lang}>{project.body ? <RichText source={project.body} /> : null}</div>
          <aside className="self-start rounded-lg border border-line border-t-4 border-t-brand bg-surface p-5 lg:sticky lg:top-6">
            <h2 className="font-display text-xl font-extrabold">{t.ctaTitle}</h2>
            <p className="mt-2 text-muted">{t.ctaBody}</p>
            <Link href={`/${lang}/contacte`} className="mt-4 inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
              {t.ctaButton}
            </Link>
          </aside>
        </div>

        {photos.length > 0 && (
          <section className="mt-14" aria-labelledby="fotos">
            <h2 id="fotos" className="font-display text-3xl font-extrabold">
              {t.photos}
            </h2>
            <ul className="mt-6 columns-2 gap-3 sm:columns-3 [&>li]:mb-3 [&>li]:break-inside-avoid">
              {photos.map((ph) => (
                <li key={ph.id}>
                  <figure>
                    <a href={photoUrl(ph.path)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element -- fotos de Storage, sin optimizador de imágenes */}
                      <img src={photoUrl(ph.path)} alt={ph.caption || t.photoAlt} className="w-full transition duration-500 hover:scale-105 motion-reduce:transition-none" loading="lazy" />
                    </a>
                    {ph.caption && <figcaption className="mt-1 text-sm text-muted">{ph.caption}</figcaption>}
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        )}

        {others.length > 0 && (
          <section className="mt-14 border-t border-line pt-10" aria-labelledby="altres">
            <h2 id="altres" className="font-display text-2xl font-extrabold">
              {t.others}
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-3">
              {others.map((p) => (
                <li key={p.id} className="group relative overflow-hidden rounded-lg border border-line bg-surface hover:shadow-md">
                  <ProjectImage project={p} className="aspect-[16/10] w-full" />
                  <div className="p-4" lang={p.lang}>
                    <h3 className="font-display text-lg font-extrabold">
                      <Link href={`/${lang}/projectes/${p.slug}`} className="after:absolute after:inset-0">
                        {p.title}
                      </Link>
                    </h3>
                    {p.subtitle && <p className="mt-1 line-clamp-2 text-sm text-muted">{p.subtitle}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
