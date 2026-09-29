"use client";

import { useActionState, useState, useTransition } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { startTotpEnroll, verifyTotp, type VerifyState } from "@/lib/actions/admin-mfa";
import { Alert, Field, SubmitButton } from "@/components/form";

type Common = { lang: string; next: string; t: Dictionary["admin"]["mfa"]; errors: Dictionary["errors"]; common: Dictionary["common"] };

export function VerifyCodeForm({ factorId, lang, next, t, errors, common }: Common & { factorId: string }) {
  const [state, action, pending] = useActionState(verifyTotp, { status: "idle" } as VerifyState);
  return (
    <form action={action} className="max-w-sm space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="factorId" value={factorId} />
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      <Field label={t.code} name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus />
      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {t.submit}
      </SubmitButton>
    </form>
  );
}

export function EnrollTotp(props: Common) {
  const { t, errors } = props;
  const [data, setData] = useState<Awaited<ReturnType<typeof startTotpEnroll>> | null>(null);
  const [pending, startTransition] = useTransition();

  if (!data || "error" in data) {
    return (
      <div className="space-y-4">
        {data && "error" in data && <Alert tone="error">{errors[data.error]}</Alert>}
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => setData(await startTotpEnroll()))}
          className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90 disabled:opacity-60"
        >
          {t.start}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* El QR llega de Supabase como SVG en una data URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={data.qr} alt="QR" width={200} height={200} className="rounded-md border border-line bg-white p-2" />
      <div>
        <p className="text-sm text-muted">{t.secret}</p>
        <code className="mt-1 block break-all rounded-md bg-surface px-3 py-2 font-mono text-sm" data-testid="totp-secret">
          {data.secret}
        </code>
      </div>
      <VerifyCodeForm {...props} factorId={data.factorId} />
    </div>
  );
}
