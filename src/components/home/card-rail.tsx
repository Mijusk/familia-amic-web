"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

type Labels = { prev: string; next: string };

const interval = 7000;

/**
 * Fila de tarjetas que se desliza en horizontal. Cada cierto tiempo avanza una tarjeta (solo si se ve en pantalla y
 * nadie la está usando) y, al hacer scroll por la página, se desplaza un poco. Sin animaciones si se ha pedido menos
 * movimiento.
 */
export function CardRail({ children, labels, label }: { children: ReactNode; labels: Labels; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const items = Children.toArray(children);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const width = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      io.disconnect();
    };
  }, []);

  // Avance automático, suave y lento.
  useEffect(() => {
    if (!visible || busy || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = track.current;
    if (!el || el.scrollWidth <= el.clientWidth + 4) return;
    const t = setInterval(() => step(1), interval);
    return () => clearInterval(t);
  }, [visible, busy]);

  // Pequeño desplazamiento al hacer scroll por la página.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = wrap.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const progress = (r.top + r.height / 2) / innerHeight - 0.5;
        el.style.transform = `translateX(${Math.max(-1, Math.min(1, progress)) * 18}px)`;
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
    };
  }, []);

  const arrow = (dir: 1 | -1, disabled: boolean) => (
    <button
      type="button"
      onClick={() => step(dir)}
      disabled={disabled && dir === -1}
      aria-label={dir === 1 ? labels.next : labels.prev}
      className="flex size-11 items-center justify-center rounded-full border border-line bg-surface shadow-sm hover:border-accent disabled:opacity-40"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === 1 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
      </svg>
    </button>
  );

  return (
    <div
      onMouseEnter={() => setBusy(true)}
      onMouseLeave={() => setBusy(false)}
      onFocus={() => setBusy(true)}
      onBlur={() => setBusy(false)}
      onTouchStart={() => setBusy(true)}
    >
      <div ref={wrap} className="transition-transform duration-300 ease-out will-change-transform">
        <ul ref={track} aria-label={label} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 sm:-mx-6 sm:px-6">
          {items.map((child, i) => (
            <li key={i} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]">
              {child}
            </li>
          ))}
        </ul>
      </div>
      {items.length > 1 && (
        <div className="mt-2 flex justify-end gap-2">
          {arrow(-1, edges.start)}
          {arrow(1, edges.end)}
        </div>
      )}
    </div>
  );
}
