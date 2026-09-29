"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { signIn } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, SubmitButton } from "@/components/form";

type Props = { lang: Locale; next?: string; t: Dictionary["auth"]["login"]; errors: Dictionary["errors"]; saving: string };

export function LoginForm({ lang, next, t, errors, saving }: Props) {
  const [state, action, pending] = useActionState(signIn, initialFormState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      <Field label={t.email} name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} error={fe.email && errors[fe.email]} />
      <Field label={t.password} name="password" type="password" autoComplete="current-password" required error={fe.password && errors[fe.password]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SubmitButton pending={pending} pendingLabel={saving}>
          {t.submit}
        </SubmitButton>
        <Link href={`/${lang}/recuperar`} className="text-accent underline underline-offset-4">
          {t.forgot}
        </Link>
      </div>
    </form>
  );
}
