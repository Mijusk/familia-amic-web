"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/** Menú desplegable para pantallas pequeñas. Funciona sin JavaScript; con él, se cierra al cambiar de página. */
export function MobileMenu({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details ref={ref} className="group lg:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-line px-3 font-semibold [&::-webkit-details-marker]:hidden">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
          <path d="M6 6l12 12M18 6L6 18" className="hidden group-open:block" />
        </svg>
        {label}
      </summary>
      <div className="absolute inset-x-0 z-20 mt-3 border-b border-line bg-surface px-4 pb-6 pt-2 shadow-lg sm:px-6">{children}</div>
    </details>
  );
}
