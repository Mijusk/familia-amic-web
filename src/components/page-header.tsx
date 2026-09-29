import type { ReactNode } from "react";

export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {lead && <p className="mt-2 max-w-2xl text-muted">{lead}</p>}
      </div>
      {children}
    </div>
  );
}
