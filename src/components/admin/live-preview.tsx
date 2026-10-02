"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Activity } from "@/lib/activities";
import type { News } from "@/lib/content";
import { framed } from "@/lib/image-frame";
import { ActivityCard } from "@/components/activities/activity-card";
import { NewsCard } from "@/components/content/news-card";
import { ProjectImage } from "@/components/content/project-image";

/** Textos de la vista previa que pasa cada página al formulario. */
export type PreviewTexts = {
  t: Dictionary["admin"]["preview"];
  /** Solo actividades: textos del horario y de las etiquetas. */
  activities?: Dictionary["activities"];
  badges?: { event: string; weekly: string };
};

type Props = PreviewTexts & { kind: "news" | "activity" | "project"; lang: string };

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Vista previa en directo de una noticia, actividad o proyecto mientras se rellena el formulario: la tarjeta tal como
 * sale en las listas y el principio de su página. Lee los campos del formulario que la contiene; no guarda nada.
 */
export function LivePreview({ kind, lang, t, activities, badges }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState<Record<string, string>>({});

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const read = () => setV(Object.fromEntries([...new FormData(form).entries()].map(([k, x]) => [k, String(x)])));
    read();
    form.addEventListener("input", read);
    form.addEventListener("change", read);
    return () => {
      form.removeEventListener("input", read);
      form.removeEventListener("change", read);
    };
  }, []);

  const title = v.title?.trim() || t.untitled;
  const summary = (kind === "project" ? v.subtitle : v.summary)?.trim() || t.noSummary;
  const image = v.image_url || null;
  const textLang = v.lang_text === "es" ? "es" : "ca";

  let card: React.ReactNode;
  if (kind === "news") {
    const news = { id: "preview", slug: "", lang: textLang, title, summary, image_url: image, published_on: v.published_on || today() } as News;
    card = <NewsCard lang={lang} news={news} headingLevel="h3" titleFirst />;
  } else if (kind === "activity" && activities && badges) {
    const a = {
      id: "preview",
      slug: "",
      lang: textLang,
      title,
      summary,
      image_url: image,
      kind: v.kind === "recurrent" ? "recurrent" : "puntual",
      weekday: v.weekday ? Number(v.weekday) : null,
      start_time: v.start_time || null,
      end_time: v.end_time || null,
      starts_on: v.starts_on || today(),
      ends_on: v.ends_on || null,
    } as Activity;
    card = <ActivityCard lang={lang} activity={a} t={activities} badges={badges} />;
  } else {
    card = (
      <article className="overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-line">
        <ProjectImage project={{ title, image_url: image }} className="aspect-[4/3] w-full" />
        <div className="p-5" lang={textLang}>
          <h3 className="font-display text-xl font-extrabold">{title}</h3>
          <p className="mt-1 line-clamp-3 text-muted">{summary}</p>
        </div>
      </article>
    );
  }

  const cover = image ? framed(image) : null;

  return (
    <aside ref={ref} aria-label={t.title} className="space-y-4 lg:sticky lg:top-6 lg:self-start" data-testid="live-preview">
      <div>
        <h2 className="font-display text-xl font-extrabold">{t.title}</h2>
        <p className="text-sm text-muted">{t.hint}</p>
      </div>
      <figure>
        {/* La tarjeta no se puede pulsar: solo es para ver cómo queda. */}
        <div inert className="pointer-events-none">
          {card}
        </div>
        <figcaption className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">{t.card}</figcaption>
      </figure>
      <figure>
        <div inert className="pointer-events-none overflow-hidden rounded-xl bg-background p-4 ring-1 ring-line" lang={textLang}>
          <p className="font-display text-lg font-extrabold leading-tight">{title}</p>
          <div className="mt-3 aspect-[4/3] overflow-hidden rounded-lg bg-mint-soft">
            {/* eslint-disable-next-line @next/next/no-img-element -- vista previa de Storage o de una dirección externa */}
            {cover && <img src={cover.src} alt="" className="size-full object-cover" style={cover.style} />}
          </div>
          <p className="mt-3 line-clamp-2 text-sm">{summary}</p>
        </div>
        <figcaption className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">{t.page}</figcaption>
      </figure>
    </aside>
  );
}
