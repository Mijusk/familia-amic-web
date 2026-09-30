"use client";

import type { Dictionary } from "@/i18n/get-dictionary";
import { Field } from "@/components/form";

type Props = { from?: string; until?: string; err: (name: string) => string | undefined; t: Dictionary["admin"]["featured"]; optional: string };

/** "Destacar en el inicio" entre dos fechas (noticias y actividades). */
export function FeaturedFields({ from, until, err, t, optional }: Props) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-line bg-warm-soft/60 p-5">
      <legend className="px-1 font-display text-lg font-extrabold">
        {t.title} <span className="font-sans text-base font-normal text-muted">({optional})</span>
      </legend>
      <p className="text-sm text-muted">{t.hint}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.from} name="featured_from" type="date" defaultValue={from} error={err("featured_from")} />
        <Field label={t.until} name="featured_until" type="date" defaultValue={until} error={err("featured_until")} />
      </div>
    </fieldset>
  );
}
