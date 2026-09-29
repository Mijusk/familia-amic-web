import type { ReactNode } from "react";

/** Columna estrecha y centrada para los formularios de acceso. */
export function AuthCard({ title, lead, children, footer }: { title: string; lead?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-extrabold">{title}</h1>
      {lead && <p className="mt-2 text-muted">{lead}</p>}
      <div className="mt-8 rounded-lg border border-line bg-surface p-5 sm:p-6">{children}</div>
      {footer && <div className="mt-6 text-center">{footer}</div>}
    </section>
  );
}
