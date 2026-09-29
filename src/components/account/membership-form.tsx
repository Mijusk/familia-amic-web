"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { format } from "@/i18n/format";
import { saveMembership } from "@/lib/actions/membership";
import { initialFormState } from "@/lib/forms";
import { Alert, Checkbox, Field, SubmitButton } from "@/components/form";

type Initial = { address: string; postal_code: string; city: string; bank_name: string; ibanMasked?: string; dniMasked?: string };

type Props = { initial?: Initial; t: Dictionary["membership"]; errors: Dictionary["errors"]; common: Dictionary["common"] };

export function MembershipForm({ initial, t, errors, common }: Props) {
  const [state, action, pending] = useActionState(saveMembership, initialFormState);
  const v = { address: "", postal_code: "", city: "", bank_name: "", ...initial, ...state.values } as Initial & Record<string, string>;
  const fe = state.fieldErrors ?? {};
  const err = (name: string) => (fe[name] ? errors[fe[name]!] : undefined);
  const editing = Boolean(initial);

  return (
    <form action={action} className="max-w-2xl space-y-8" noValidate>
      {state.status === "success" && <Alert tone="success">{editing ? common.saved : t.sent}</Alert>}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}

      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-extrabold">{t.sectionHolder}</legend>
        <Field label={t.dni} name="dni" required={!editing} autoComplete="off" defaultValue={state.status === "error" ? v.dni : undefined} placeholder={initial?.dniMasked} hint={editing ? t.dniSaved : undefined} error={err("dni")} />
        <Field label={t.address} name="address" required autoComplete="street-address" defaultValue={v.address} error={err("address")} />
        <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
          <Field label={t.postalCode} name="postal_code" required inputMode="numeric" autoComplete="postal-code" defaultValue={v.postal_code} error={err("postal_code")} />
          <Field label={t.city} name="city" required autoComplete="address-level2" defaultValue={v.city} error={err("city")} />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-extrabold">{t.sectionBank}</legend>
        <Field label={t.bankName} name="bank_name" required defaultValue={v.bank_name} error={err("bank_name")} />
        <Field
          label={t.iban}
          name="iban"
          required={!editing}
          autoComplete="off"
          defaultValue={state.status === "error" ? v.iban : undefined}
          placeholder={initial?.ibanMasked ?? "ES00 0000 0000 0000 0000 0000"}
          hint={editing && initial?.ibanMasked ? format(t.ibanSaved, { iban: initial.ibanMasked }) : t.ibanHint}
          error={err("iban")}
        />
        <Checkbox label={t.sepa} name="sepa" required defaultChecked={v.sepa === "on"} error={err("sepa")} />
      </fieldset>

      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {editing ? t.update : t.submit}
      </SubmitButton>
    </form>
  );
}
