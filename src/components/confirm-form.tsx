"use client";

import { useState } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  lang: string;
  id: string;
  label: string;
  confirmText: string;
  confirmButton: string;
  cancel: string;
};

/** Botón que pide confirmación en la propia página antes de enviar (sin diálogos del navegador). */
export function ConfirmForm({ action, lang, id, label, confirmText, confirmButton, cancel }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="font-semibold text-red-700 underline underline-offset-4 dark:text-red-400">
        {label}
      </button>
    );
  }

  return (
    <form action={action} className="max-w-2xl rounded-lg border border-red-600 p-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <p>{confirmText}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        <button type="submit" className="min-h-11 rounded-md bg-red-700 px-5 font-semibold text-white">
          {confirmButton}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="font-semibold text-muted underline underline-offset-4">
          {cancel}
        </button>
      </div>
    </form>
  );
}
