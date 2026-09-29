"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { saveParticipant } from "@/lib/actions/participants";
import { initialFormState } from "@/lib/forms";
import { Alert, Checkbox, Field, Select, SubmitButton, TextArea } from "@/components/form";

type Initial = {
  id?: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  relationship: string;
  disability_pct: string;
  has_dependency: "yes" | "no";
  dependency_grade: string;
  allergies: string;
  medical_notes: string;
  image_consent: boolean;
  dniMasked?: string;
};

type Props = { lang: Locale; initial?: Initial; t: Dictionary["participants"]; errors: Dictionary["errors"]; common: Dictionary["common"] };

const empty: Initial = {
  first_name: "",
  last_name: "",
  birth_date: "",
  relationship: "familiar",
  disability_pct: "",
  has_dependency: "no",
  dependency_grade: "",
  allergies: "",
  medical_notes: "",
  image_consent: false,
};

export function ParticipantForm({ lang, initial = empty, t, errors, common }: Props) {
  const [state, action, pending] = useActionState(saveParticipant, initialFormState);
  const v = { ...initial, ...state.values } as Initial & Record<string, string>;
  const fe = state.fieldErrors ?? {};
  const err = (name: string) => (fe[name] ? errors[fe[name]!] : undefined);
  const [dependency, setDependency] = useState(v.has_dependency);
  const editing = Boolean(initial.id);

  return (
    <form action={action} className="max-w-2xl space-y-8" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}

      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-extrabold">{t.sectionPerson}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.firstName} name="first_name" required autoComplete="off" defaultValue={v.first_name} error={err("first_name")} />
          <Field label={t.lastName} name="last_name" required autoComplete="off" defaultValue={v.last_name} error={err("last_name")} />
          <Field
            label={t.dni}
            name="dni"
            required={!editing}
            autoComplete="off"
            defaultValue={v.dni}
            placeholder={initial.dniMasked}
            hint={editing ? t.dniSaved : undefined}
            error={err("dni")}
          />
          <Field label={t.birthDate} name="birth_date" type="date" required defaultValue={v.birth_date} error={err("birth_date")} />
          <Select
            label={t.relationship}
            name="relationship"
            required
            defaultValue={v.relationship}
            error={err("relationship")}
            options={(["familiar", "alumne", "pacient", "amic"] as const).map((r) => ({ value: r, label: t.relationships[r] }))}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-extrabold">{t.sectionHealth}</legend>
        <p className="text-muted">{t.sectionHealthLead}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={t.disabilityPct}
            name="disability_pct"
            inputMode="numeric"
            optionalLabel={common.optional}
            defaultValue={v.disability_pct}
            error={err("disability_pct")}
          />
          <Select
            label={t.hasDependency}
            name="has_dependency"
            required
            value={dependency}
            onChange={(e) => setDependency(e.target.value as "yes" | "no")}
            options={[
              { value: "no", label: common.no },
              { value: "yes", label: common.yes },
            ]}
          />
          {dependency === "yes" && (
            <Select
              label={t.dependencyGrade}
              name="dependency_grade"
              required
              defaultValue={v.dependency_grade || "1"}
              error={err("dependency_grade")}
              options={["1", "2", "3"].map((n) => ({ value: n, label: t.grade.replace("{n}", n) }))}
            />
          )}
        </div>
        <TextArea label={t.allergies} name="allergies" optionalLabel={common.optional} maxLength={1000} defaultValue={v.allergies} error={err("allergies")} />
        <TextArea label={t.medicalNotes} name="medical_notes" optionalLabel={common.optional} maxLength={2000} defaultValue={v.medical_notes} error={err("medical_notes")} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-extrabold">{t.sectionConsent}</legend>
        <Checkbox label={t.guardian} name="guardian" required defaultChecked={editing || v.guardian === "on"} error={err("guardian")} />
        <Checkbox label={t.healthConsent} name="health_consent" required defaultChecked={editing || v.health_consent === "on"} error={err("health_consent")} />
        <Checkbox label={t.imageConsent} name="image_consent" defaultChecked={state.values ? state.values.image_consent === "on" : initial.image_consent} />
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pending={pending} pendingLabel={common.saving}>
          {t.save}
        </SubmitButton>
        <Link href={`/${lang}/compte/familia`} className="font-semibold text-muted underline underline-offset-4">
          {common.cancel}
        </Link>
      </div>
    </form>
  );
}
