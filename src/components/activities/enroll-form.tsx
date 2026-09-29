"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { format, formatDate } from "@/i18n/format";
import { enroll, type EnrollState } from "@/lib/actions/enrollments";
import { Alert, SubmitButton } from "@/components/form";

type Person = { id: string; name: string; note?: string };

type Props = {
  lang: Locale;
  slug: string;
  recurrent: boolean;
  isMember: boolean;
  full: boolean;
  people: Person[];
  trialDates: string[];
  monthEnd: string;
  t: Dictionary["activities"];
  errors: Dictionary["errors"];
  common: Dictionary["common"];
};

const initial: EnrollState = { status: "idle" };

export function EnrollForm({ lang, slug, recurrent, isMember, full, people, trialDates, monthEnd, t, errors, common }: Props) {
  const [state, action, pending] = useActionState(enroll, initial);

  if (state.status === "success" && state.results) {
    const good = state.results.some((r) => ["confirmada", "cua", "prova"].includes(r.result));
    return (
      <div className="space-y-4">
        <Alert tone={good ? "success" : "info"}>
          <p className="font-semibold">{t.resultsTitle}</p>
          <ul className="mt-2 space-y-1">
            {state.results.map((r) => (
              <li key={r.name}>
                <span className="font-semibold">{r.name}:</span>{" "}
                {format(t.results[r.result], { date: r.date ? formatDate(lang, r.date) : "" })}
              </li>
            ))}
          </ul>
          {state.emailed && <p className="mt-2 text-sm">{t.emailSent}</p>}
        </Alert>
        <Link href={`/${lang}/compte/inscripcions`} className="inline-block font-semibold text-accent underline underline-offset-4">
          {t.seeEnrollments}
        </Link>
      </div>
    );
  }

  const trial = !isMember;
  const available = people.filter((p) => !p.note);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="activity" value={slug} />
      {state.error && <Alert tone="error">{state.error === "noneSelected" ? t.noneSelected : errors[state.error]}</Alert>}

      {trial && (
        <div className="rounded-md border-l-4 border-warm bg-warm-soft p-4">
          <p className="font-semibold">{t.trialTitle}</p>
          <p className="mt-1">{t.trialBody}</p>
          <Link href={`/${lang}/compte/soci`} className="mt-2 inline-block font-semibold underline underline-offset-4">
            {t.becomeMember}
          </Link>
        </div>
      )}
      {!trial && full && <Alert tone="info">{t.fullWarning}</Alert>}

      <fieldset>
        <legend className="font-semibold">{t.whoLabel}</legend>
        <ul className="mt-3 space-y-3">
          {people.map((p) => (
            <li key={p.id} className="flex items-start gap-3">
              <input
                id={`p-${p.id}`}
                type="checkbox"
                name="participant"
                value={p.id}
                disabled={Boolean(p.note)}
                defaultChecked={available.length === 1 && !p.note}
                className="mt-1 size-5 shrink-0 accent-[var(--accent)]"
              />
              <label htmlFor={`p-${p.id}`}>
                {p.name}
                {p.note && <span className="ml-2 text-sm text-muted">({p.note})</span>}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {!trial && recurrent && (
        <fieldset>
          <legend className="font-semibold">{t.renewLabel}</legend>
          <div className="mt-3 space-y-3">
            <label className="flex items-start gap-3">
              <input type="radio" name="renew" value="monthly" defaultChecked className="mt-1 size-5 accent-[var(--accent)]" />
              {t.renewMonthly}
            </label>
            <label className="flex items-start gap-3">
              <input type="radio" name="renew" value="once" className="mt-1 size-5 accent-[var(--accent)]" />
              {format(t.renewOnce, { date: formatDate(lang, monthEnd) })}
            </label>
          </div>
        </fieldset>
      )}

      {trial && (
        <div>
          <label htmlFor="trial_date" className="block font-semibold">
            {t.trialDate}
          </label>
          <select id="trial_date" name="trial_date" className="mt-1 block min-h-11 w-full max-w-xs rounded-md border border-line bg-surface px-3 py-2">
            {trialDates.map((d) => (
              <option key={d} value={d}>
                {formatDate(lang, d)}
              </option>
            ))}
          </select>
        </div>
      )}

      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {trial ? t.submitTrial : t.submit}
      </SubmitButton>
    </form>
  );
}
