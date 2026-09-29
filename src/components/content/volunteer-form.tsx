"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { saveVolunteerApplication } from "@/lib/actions/content";
import { volunteerAreas } from "@/lib/content-schema";
import { initialFormState } from "@/lib/forms";
import { Alert, SubmitButton, TextArea } from "@/components/form";

type Props = {
  lang: string;
  initial: { areas: string[]; availability: string; experience: string; motivation: string } | null;
  t: Dictionary["volunteer"];
  errors: Dictionary["errors"];
  common: Dictionary["common"];
};

export function VolunteerForm({ lang, initial, t, errors, common }: Props) {
  const [state, action, pending] = useActionState(saveVolunteerApplication, initialFormState);
  const v = { ...initial, ...state.values };
  const areas = state.values ? (state.values.areas ?? "").split(",") : (initial?.areas ?? []);
  const fe = state.fieldErrors ?? {};
  const err = (name: string) => (fe[name] ? errors[fe[name]!] : undefined);

  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      {state.status === "success" && <Alert tone="success">{state.detail === "created" ? t.sent : common.saved}</Alert>}

      <fieldset aria-describedby={err("areas") ? "areas-error" : undefined}>
        <legend className="font-semibold">{t.areas}</legend>
        <p className="text-sm text-muted">{t.areasHint}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {volunteerAreas.map((a) => (
            <label key={a} className="flex min-h-11 items-center gap-3 rounded-md border border-line bg-surface px-3">
              <input type="checkbox" name="areas" value={a} defaultChecked={areas.includes(a)} className="size-5 accent-[var(--accent)]" />
              {t.areaNames[a]}
            </label>
          ))}
        </div>
        {err("areas") && (
          <p id="areas-error" className="mt-1 text-sm font-semibold text-red-700 dark:text-red-400">
            {err("areas")}
          </p>
        )}
      </fieldset>
      <TextArea label={t.availability} name="availability" required maxLength={500} hint={t.availabilityHint} defaultValue={v.availability} error={err("availability")} />
      <TextArea label={t.experience} name="experience" maxLength={2000} optionalLabel={common.optional} defaultValue={v.experience} error={err("experience")} />
      <TextArea label={t.motivation} name="motivation" maxLength={2000} optionalLabel={common.optional} defaultValue={v.motivation} error={err("motivation")} />
      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {initial ? common.save : t.submit}
      </SubmitButton>
    </form>
  );
}
