"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { sendContact } from "@/lib/actions/content";
import { initialFormState } from "@/lib/forms";
import { Alert, Checkbox, Field, SubmitButton, TextArea } from "@/components/form";

type Props = { lang: string; t: Dictionary["contact"]; errors: Dictionary["errors"]; common: Dictionary["common"]; initial?: { name?: string; email?: string; phone?: string } };

export function ContactForm({ lang, t, errors, common, initial }: Props) {
  const [state, action, pending] = useActionState(sendContact, initialFormState);
  const v: Record<string, string | undefined> = { ...initial, ...state.values };
  const fe = state.fieldErrors ?? {};
  const err = (name: string) => (fe[name] ? errors[fe[name]!] : undefined);

  if (state.status === "success") {
    return (
      <Alert tone="success">
        <p className="font-semibold">{t.sentTitle}</p>
        <p className="mt-1">{t.sentBody}</p>
      </Alert>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      {/* Campo trampa para robots: oculto para las personas y para los lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <Field label={t.name} name="name" autoComplete="name" required defaultValue={v.name} error={err("name")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.email} name="email" type="email" autoComplete="email" required defaultValue={v.email} error={err("email")} />
        <Field label={t.phone} name="phone" type="tel" autoComplete="tel" optionalLabel={common.optional} defaultValue={v.phone} error={err("phone")} />
      </div>
      <TextArea label={t.message} name="message" required rows={6} maxLength={5000} defaultValue={v.message} error={err("message")} />
      <Checkbox label={t.privacy} name="privacy" required defaultChecked={v.privacy === "on"} error={err("privacy")} />
      <SubmitButton pending={pending} pendingLabel={t.sending}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}
