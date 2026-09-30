"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { addReceiptAdjustment } from "@/lib/actions/receipts";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, Select, SubmitButton } from "@/components/form";

type Props = {
  lang: string;
  mes: string;
  families: { id: string; name: string }[];
  t: Dictionary["admin"]["receipts"];
  errors: Dictionary["errors"];
  common: Dictionary["common"];
};

/** Añade una línea extra (cargo o descuento) al recibo de una familia socia en el mes que se está viendo. */
export function AdjustmentForm({ lang, mes, families, t, errors, common }: Props) {
  const [state, action, pending] = useActionState(addReceiptAdjustment, initialFormState);
  const v = state.values ?? {};
  const err = (k: string) => (state.fieldErrors?.[k] ? errors[state.fieldErrors[k]!] : undefined);
  return (
    <form action={action} className="max-w-3xl space-y-4" noValidate>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="mes" value={mes} />
      {state.status === "success" && <Alert tone="success">{t.adjustAdded}</Alert>}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_10rem]">
        <Select
          label={t.adjustFamily}
          name="family_id"
          required
          defaultValue={v.family_id ?? ""}
          error={err("family_id")}
          options={[{ value: "", label: t.adjustChoose }, ...families.map((f) => ({ value: f.id, label: f.name }))]}
        />
        <Field label={t.adjustConcept} name="concept" required maxLength={120} hint={t.adjustConceptHint} defaultValue={v.concept} error={err("concept")} />
        <Field label={t.adjustAmount} name="amount" required inputMode="decimal" hint={t.adjustAmountHint} defaultValue={v.amount} error={err("amount")} />
      </div>
      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {t.adjustAdd}
      </SubmitButton>
    </form>
  );
}
