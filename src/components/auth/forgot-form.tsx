"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { requestPasswordReset } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, SubmitButton } from "@/components/form";

type Props = { lang: Locale; t: Dictionary["auth"]["forgot"]; email: string; errors: Dictionary["errors"]; saving: string };

export function ForgotForm({ lang, t, email, errors, saving }: Props) {
  const [state, action, pending] = useActionState(requestPasswordReset, initialFormState);
  const fe = state.fieldErrors ?? {};

  if (state.status === "success") return <Alert tone="success">{t.sent}</Alert>;

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      <Field label={email} name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={fe.email && errors[fe.email]} />
      <SubmitButton pending={pending} pendingLabel={saving}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
