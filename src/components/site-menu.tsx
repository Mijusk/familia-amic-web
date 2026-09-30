"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Menú desplegable (hamburguesa) en todas las pantallas. Funciona sin JavaScript; con él, se cierra al cambiar de
 * página, con Escape y al pulsar fuera.
 */
export function SiteMenu({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);
  useEffect(() => {
    const close = (e: KeyboardEvent | MouseEvent) => {
      const menu = ref.current;
      if (!menu?.open) return;
      if (e instanceof KeyboardEvent) {
        if (e.key !== "Escape") return;
        menu.open = false;
        menu.querySelector("summary")?.focus();
      } else if (!menu.contains(e.target as Node)) {
        menu.open = false;
      }
    };
    document.addEventListener("keydown", close);
    document.addEventListener("click", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("click", close);
    };
  }, []);

  return (
    <details ref={ref} className="group">
      <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-line px-3 font-semibold hover:border-accent [&::-webkit-details-marker]:hidden">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
          <path d="M6 6l12 12M18 6L6 18" className="hidden group-open:block" />
        </svg>
        <span className="sr-only sm:not-sr-only">{label}</span>
      </summary>
      <div className="absolute inset-x-0 z-30 mt-3 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-line bg-surface shadow-lg">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 sm:px-6">{children}</div>
      </div>
    </details>
  );
}
