"use client";

import { useActionState, useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { saveActivity } from "@/lib/actions/admin";
import { initialFormState } from "@/lib/forms";
import { Alert, Checkbox, Field, Select, SubmitButton, TextArea } from "@/components/form";

export type ActivityInitial = Record<string, string> & { id?: string; kind: string; payment_method: string };

type Props = {
  lang: string;
  initial: ActivityInitial;
  categories: { id: string; name: string }[];
  created?: boolean;
  t: Dictionary["admin"]["activities"];
  status: Dictionary["admin"]["status"];
  weekdays: string[];
  errors: Dictionary["errors"];
  common: Dictionary["common"];
};

export function ActivityForm({ lang, initial, categories, created, t, status, weekdays, errors, common }: Props) {
  const [state, action, pending] = useActionState(saveActivity, initialFormState);
  const v = { ...initial, ...state.values } as ActivityInitial;
  const fe = state.fieldErrors ?? {};
  const err = (name: string) => (fe[name] ? errors[fe[name]!] : undefined);
  const [kind, setKind] = useState(v.kind);
  const [payment, setPayment] = useState(v.payment_method);

  return (
    <form action={action} className="max-w-3xl space-y-8" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      {!state.error && Object.keys(fe).length > 0 && <Alert tone="error">{errors.reviewForm}</Alert>}
      {(state.status === "success" || (created && state.status === "idle")) && <Alert tone="success">{created && state.status === "idle" ? t.created : t.saved}</Alert>}

      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-extrabold">{t.sectionMain}</legend>
        <Field label={t.fTitle} name="title" required defaultValue={v.title} error={err("title")} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.fSlug} name="slug" defaultValue={v.slug} hint={t.fSlugHint.replace("{slug}", v.slug || "…")} optionalLabel={common.optional} error={err("slug")} />
          <Select
            label={t.fLang}
            name="lang_text"
            defaultValue={v.lang_text}
            options={[
              { value: "ca", label: "Català" },
              { value: "es", label: "Castellano" },
            ]}
          />
        </div>
        <TextArea label={t.fSummary} name="summary" required maxLength={300} rows={2} hint={t.fSummaryHint} defaultValue={v.summary} error={err("summary")} />
        <TextArea label={t.fDescription} name="description" maxLength={5000} rows={6} optionalLabel={common.optional} defaultValue={v.description} error={err("description")} />
        <Select
          label={t.fCategory}
          name="category_id"
          defaultValue={v.category_id}
          options={[{ value: "", label: t.noCategory }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-extrabold">{t.sectionWhen}</legend>
        <Select
          label={t.fKind}
          name="kind"
          required
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          options={(["recurrent", "puntual"] as const).map((k) => ({ value: k, label: t.kinds[k] }))}
        />
        {kind === "recurrent" && (
          <div className="grid gap-5 sm:grid-cols-3">
            <Select
              label={t.fWeekday}
              name="weekday"
              required
              defaultValue={v.weekday || "1"}
              error={err("weekday")}
              options={weekdays.map((w, i) => ({ value: String(i + 1), label: w }))}
            />
            <Field label={t.fStart} name="start_time" type="time" required defaultValue={v.start_time} error={err("start_time")} />
            <Field label={t.fEnd} name="end_time" type="time" required defaultValue={v.end_time} error={err("end_time")} />
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.fStartsOn} name="starts_on" type="date" required hint={t.fStartsOnHint} defaultValue={v.starts_on} error={err("starts_on")} />
          <Field label={t.fEndsOn} name="ends_on" type="date" hint={t.fEndsOnHint} optionalLabel={common.optional} defaultValue={v.ends_on} error={err("ends_on")} />
        </div>
        <Field label={t.fLocation} name="location" optionalLabel={common.optional} defaultValue={v.location} error={err("location")} />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-extrabold">{t.sectionEnroll}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.fCapacity} name="capacity" inputMode="numeric" hint={t.fCapacityHint} optionalLabel={common.optional} defaultValue={v.capacity} error={err("capacity")} />
          <Select
            label={t.fPayment}
            name="payment_method"
            required
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            options={(["rebut", "transferencia", "gratuit"] as const).map((p) => ({ value: p, label: t.payments[p] }))}
          />
        </div>
        {payment !== "gratuit" && (
          <Field label={t.fPrice} name="price" inputMode="decimal" hint={t.fPriceHint} optionalLabel={common.optional} defaultValue={v.price} error={err("price")} />
        )}
        {payment === "transferencia" && (
          <TextArea label={t.fPaymentNotes} name="payment_notes" maxLength={500} rows={2} hint={t.fPaymentNotesHint} defaultValue={v.payment_notes} error={err("payment_notes")} />
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label={t.fStatus}
            name="status"
            required
            defaultValue={v.status}
            options={(["esborrany", "publicada", "cancellada", "finalitzada"] as const).map((s) => ({ value: s, label: status[s] }))}
          />
          <div className="sm:pt-8">
            <Checkbox label={t.fOpen} name="enrollment_open" defaultChecked={v.enrollment_open === "on"} />
          </div>
        </div>
      </fieldset>

      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {t.save}
      </SubmitButton>
    </form>
  );
}
