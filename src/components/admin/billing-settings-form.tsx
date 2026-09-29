"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { saveBillingSettings } from "@/lib/actions/receipts";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, SubmitButton } from "@/components/form";

type Props = {
  lang: string;
  t: Dictionary["admin"]["receipts"];
  errors: Dictionary["errors"];
  common: Dictionary["common"];
  fee: string;
  discount: string;
};

export function BillingSettingsForm({ lang, t, errors, common, fee, discount }: Props) {
  const [state, action, pending] = useActionState(saveBillingSettings, initialFormState);
  const v = state.values;
  const err = (k: string) => (state.fieldErrors?.[k] ? errors[state.fieldErrors[k]!] : undefined);
  return (
    <form action={action} className="max-w-md space-y-4" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state.status === "success" && <Alert tone="success">{t.saved}</Alert>}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      <Field label={t.fee} name="membership_fee" inputMode="decimal" hint={t.feeHint} defaultValue={v?.membership_fee ?? fee} error={err("membership_fee")} />
      <Field label={t.discount} name="discount_pct" inputMode="numeric" hint={t.discountHint} defaultValue={v?.discount_pct ?? discount} error={err("discount_pct")} />
      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {t.save}
      </SubmitButton>
    </form>
  );
}
