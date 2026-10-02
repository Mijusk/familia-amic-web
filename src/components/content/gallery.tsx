"use client";

import { useEffect, useRef, useState } from "react";
import { framed, parseFrame } from "@/lib/image-frame";

export type GalleryImage = { src: string; alt: string; caption?: string };
type Labels = { region: string; prev: string; next: string; open: string; close: string; counter: string; thumb: string };

const count = (template: string, n: number, total: number) => template.replace("{n}", String(n)).replace("{total}", String(total));

function Arrow({ dir, onClick, label, big = false }: { dir: 1 | -1; onClick: () => void; label: string; big?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition hover:bg-white ${big ? "size-12 sm:size-14" : "size-11"}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === 1 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
      </svg>
    </button>
  );
}

/**
 * Visor de fotos: la primera es la portada y las flechas pasan a las siguientes. Al hacer clic se abre en grande sobre
 * un fondo oscuro, con flechas a los lados (también con el teclado y deslizando el dedo).
 */
export function Gallery({ images, labels }: { images: GalleryImage[]; labels: Labels }) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number | null>(null);
  const total = images.length;
  const many = total > 1;
  const go = (i: number) => setIndex(((i % total) + total) % total);
  const current = images[index];

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClose = () => document.documentElement.classList.remove("overflow-hidden");
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const open = () => {
    dialog.current?.showModal();
    document.documentElement.classList.add("overflow-hidden");
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (!many) return;
    if (e.key === "ArrowRight") go(index + 1);
    if (e.key === "ArrowLeft") go(index - 1);
  };
  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touch.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touch.current === null || !many) return;
      const dx = e.changedTouches[0].clientX - touch.current;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      touch.current = null;
    },
  };

  return (
    <section aria-label={labels.region} aria-roledescription="carousel" onKeyDown={onKey}>
      <div className="group relative overflow-hidden rounded-2xl bg-mint-soft shadow-lg shadow-brand/10 ring-1 ring-line" {...swipe}>
        <button type="button" onClick={open} className="block w-full cursor-zoom-in" aria-label={`${labels.open}: ${current.alt}`}>
          <span className="block aspect-[4/3] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- imágenes de Storage o externas, sin optimizador */}
            <img key={current.src} src={framed(current.src).src} alt={current.alt} style={framed(current.src).style} className="size-full animate-[fade_.4s_ease] object-cover motion-reduce:animate-none" />
          </span>
        </button>
        {many && (
          <>
            <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between [&>*]:pointer-events-auto">
              <Arrow dir={-1} onClick={() => go(index - 1)} label={labels.prev} />
              <Arrow dir={1} onClick={() => go(index + 1)} label={labels.next} />
            </div>
            <p className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white tabular-nums" aria-live="polite">
              {count(labels.counter, index + 1, total)}
            </p>
          </>
        )}
      </div>
      {current.caption && <p className="mt-2 text-sm text-muted">{current.caption}</p>}
      {many && (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <li key={i} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={count(labels.thumb, i + 1, total)}
                aria-current={i === index ? "true" : undefined}
                className={`block overflow-hidden rounded-md ring-2 transition ${i === index ? "ring-accent" : "opacity-70 ring-transparent hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- miniaturas de Storage */}
                <img src={framed(img.src).src} alt="" loading="lazy" style={framed(img.src).style} className="h-16 w-20 object-cover sm:h-20 sm:w-24" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        aria-label={labels.region}
        onKeyDown={onKey}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4 sm:p-8" onClick={(e) => e.target === e.currentTarget && dialog.current?.close()} {...swipe}>
          {/* En grande se ve la foto entera, sin encuadre. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- imágenes de Storage o externas, sin optimizador */}
          <img key={current.src} src={parseFrame(current.src).src} alt={current.alt} className="max-h-[80dvh] max-w-full animate-[fade_.3s_ease] rounded-lg motion-reduce:animate-none object-contain shadow-2xl" />
          <p className="max-w-2xl text-center text-white">
            {many && <span className="font-semibold tabular-nums">{count(labels.counter, index + 1, total)}</span>}
            {current.caption && <span className="ml-3 text-white/80">{current.caption}</span>}
          </p>
        </div>
        {many && (
          <>
            <div className="fixed left-2 top-1/2 -translate-y-1/2 sm:left-6">
              <Arrow dir={-1} onClick={() => go(index - 1)} label={labels.prev} big />
            </div>
            <div className="fixed right-2 top-1/2 -translate-y-1/2 sm:right-6">
              <Arrow dir={1} onClick={() => go(index + 1)} label={labels.next} big />
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label={labels.close}
          autoFocus
          className="fixed right-3 top-3 flex size-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md hover:bg-white sm:right-6 sm:top-6"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </dialog>
    </section>
  );
}
