"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { updateProfile } from "@/lib/actions/account";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, SubmitButton } from "@/components/form";

type Props = {
  profile: { full_name: string; phone: string; email: string };
  t: Dictionary["account"]["myData"];
  errors: Dictionary["errors"];
  common: Dictionary["common"];
};

export function ProfileForm({ profile, t, errors, common }: Props) {
  const [state, action, pending] = useActionState(updateProfile, initialFormState);
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? profile;

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "success" && <Alert tone="success">{common.saved}</Alert>}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      <Field label={t.fullName} name="full_name" autoComplete="name" required defaultValue={v.full_name} error={fe.full_name && errors[fe.full_name]} />
      <Field label={t.phone} name="phone" type="tel" autoComplete="tel" required defaultValue={v.phone} error={fe.phone && errors[fe.phone]} />
      <Field label={t.email} name="email_readonly" type="email" value={profile.email} readOnly disabled hint={t.emailHint} />
      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {common.save}
      </SubmitButton>
    </form>
  );
}
