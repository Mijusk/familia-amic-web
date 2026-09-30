"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = { id: string; image_url: string; caption: string; link_url: string | null };
type Labels = { prev: string; next: string; pause: string; play: string; slide: string; region: string };

const interval = 6000;

/** Fotos del inicio que van pasando con un fundido suave. Se para al pasar el ratón, al enfocar o con el botón de pausa. */
export function HeroSlider({ slides, labels }: { slides: Slide[]; labels: Labels }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const reduced = useRef(false);
  const count = slides.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) setPlaying(false);
  }, []);
  useEffect(() => {
    if (!playing || hovered || count < 2) return;
    const t = setTimeout(() => go(index + 1), interval);
    return () => clearTimeout(t);
  }, [index, playing, hovered, count, go]);

  const current = slides[index];
  const caption = current?.caption && (
    <p className="font-display text-lg font-extrabold leading-snug text-white sm:text-2xl">
      {current.caption}
      {current.link_url && <span aria-hidden="true"> →</span>}
    </p>
  );

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.region}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mint-soft shadow-xl shadow-brand/10 ring-1 ring-line">
        {slides.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- imágenes de Storage, sin optimizador
          <img
            key={s.id}
            src={s.image_url}
            alt=""
            aria-hidden={i !== index}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1200ms] ease-out motion-reduce:transition-none ${
              i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          />
        ))}
        {current?.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16 sm:p-7 sm:pt-20" aria-live={playing ? "off" : "polite"}>
            {current.link_url ? (
              <Link href={current.link_url} className="block hover:underline">
                {caption}
              </Link>
            ) : (
              caption
            )}
          </div>
        )}
        {current?.link_url && !current.caption && <Link href={current.link_url} className="absolute inset-0" aria-label={labels.slide.replace("{n}", String(index + 1)).replace("{total}", String(count))} />}
      </div>

      {count > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={labels.slide.replace("{n}", String(i + 1)).replace("{total}", String(count))}
                aria-current={i === index ? "true" : undefined}
                className="flex size-11 items-center justify-center"
              >
                <span className={`block h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-accent" : "w-2.5 bg-line hover:bg-brand"}`} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPlaying((p) => !p)} className="flex size-11 items-center justify-center rounded-full border border-line bg-surface hover:border-accent" aria-label={playing ? labels.pause : labels.play}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
                {playing ? <path d="M7 5h3v14H7zM14 5h3v14h-3z" /> : <path d="M8 5v14l11-7z" />}
              </svg>
            </button>
            <button type="button" onClick={() => go(index - 1)} className="flex size-11 items-center justify-center rounded-full border border-line bg-surface hover:border-accent" aria-label={labels.prev}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button type="button" onClick={() => go(index + 1)} className="flex size-11 items-center justify-center rounded-full border border-line bg-surface hover:border-accent" aria-label={labels.next}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
