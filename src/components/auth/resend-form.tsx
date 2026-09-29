"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { resendConfirmation } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, SubmitButton } from "@/components/form";

type Props = {
  lang: Locale;
  t: Dictionary["auth"]["resend"];
  emailLabel: string;
  errors: Dictionary["errors"];
  saving: string;
  /** Si ya sabemos el correo (acaba de intentar entrar), no lo volvemos a pedir. */
  email?: string;
};

/** Pide un correo nuevo de confirmación de la cuenta. */
export function ResendForm({ lang, t, emailLabel, errors, saving, email }: Props) {
  const [state, action, pending] = useActionState(resendConfirmation, initialFormState);
  const fe = state.fieldErrors ?? {};

  if (state.status === "success") return <Alert tone="success">{t.sent}</Alert>;

  return (
    <form action={action} className="space-y-4 rounded-lg border border-line bg-surface p-4" noValidate>
      <input type="hidden" name="lang" value={lang} />
      <p>{t.lead}</p>
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      {email ? (
        <input type="hidden" name="resend_email" value={email} />
      ) : (
        <Field label={emailLabel} name="resend_email" type="email" autoComplete="email" required defaultValue={state.values?.resend_email} error={fe.email && errors[fe.email]} />
      )}
      <SubmitButton pending={pending} pendingLabel={saving}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
