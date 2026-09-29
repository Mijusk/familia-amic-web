"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { grantAdmin, type GrantState } from "@/lib/actions/admin";
import { Alert, Field, SubmitButton } from "@/components/form";

type Props = { lang: string; t: Dictionary["admin"]["admins"]; errors: Dictionary["errors"]; common: Dictionary["common"] };

export function GrantAdminForm({ lang, t, errors, common }: Props) {
  const [state, action, pending] = useActionState(grantAdmin, { status: "idle" } as GrantState);
  return (
    <form action={action} className="max-w-md space-y-4" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state.status === "success" && <Alert tone="success">{t.added}</Alert>}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      <Field label={t.email} name="email" type="email" required hint={t.emailHint} defaultValue={state.values?.email} />
      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {t.add}
      </SubmitButton>
    </form>
  );
}
