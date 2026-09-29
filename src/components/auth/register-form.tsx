"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { format } from "@/i18n/format";
import { signUp } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/forms";
import { Alert, Checkbox, Field, SubmitButton } from "@/components/form";

type Props = { lang: Locale; volunteer?: boolean; t: Dictionary["auth"]["register"]; errors: Dictionary["errors"]; saving: string };

export function RegisterForm({ lang, volunteer, t, errors, saving }: Props) {
  const [state, action, pending] = useActionState(signUp, initialFormState);
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.status === "success") {
    return (
      <Alert tone="success">
        <p className="font-semibold">{t.checkEmailTitle}</p>
        <p className="mt-1">{format(t.checkEmailBody, { email: state.detail ?? "" })}</p>
      </Alert>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {volunteer && <input type="hidden" name="tipus" value="voluntari" />}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      <Field label={t.fullName} name="full_name" autoComplete="name" required hint={volunteer ? undefined : t.fullNameHint} defaultValue={v.full_name} error={fe.full_name && errors[fe.full_name]} />
      <Field label={t.phone} name="phone" type="tel" autoComplete="tel" required defaultValue={v.phone} error={fe.phone && errors[fe.phone]} />
      <Field label={t.email} name="email" type="email" autoComplete="email" required defaultValue={v.email} error={fe.email && errors[fe.email]} />
      <Field label={t.password} name="password" type="password" autoComplete="new-password" required hint={t.passwordHint} error={fe.password && errors[fe.password]} />
      <Checkbox label={volunteer ? t.volunteerPrivacy : t.privacy} name="privacy" required defaultChecked={v.privacy === "on"} error={fe.privacy && errors[fe.privacy]} />
      <SubmitButton pending={pending} pendingLabel={saving}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
