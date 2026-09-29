"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { updatePassword } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, SubmitButton } from "@/components/form";

type Props = { lang: Locale; t: Dictionary["auth"]["reset"]; hint: string; errors: Dictionary["errors"]; saving: string };

export function ResetForm({ lang, t, hint, errors, saving }: Props) {
  const [state, action, pending] = useActionState(updatePassword, initialFormState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      <Field label={t.password} name="password" type="password" autoComplete="new-password" required hint={hint} error={fe.password && errors[fe.password]} />
      <Field label={t.confirm} name="confirm" type="password" autoComplete="new-password" required error={fe.confirm && errors[fe.confirm]} />
      <SubmitButton pending={pending} pendingLabel={saving}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
