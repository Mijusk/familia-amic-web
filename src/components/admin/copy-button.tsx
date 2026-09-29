"use client";

import { useState } from "react";

/** Copia un dato al portapapeles para pegarlo en la web del banco. */
export function CopyButton({ value, label, done }: { value: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Sin permiso de portapapeles: el dato sigue visible para copiarlo a mano.
        }
      }}
      className="ml-2 rounded border border-line px-2 py-0.5 text-sm font-semibold hover:border-accent"
      aria-label={`${label}: ${value}`}
    >
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
