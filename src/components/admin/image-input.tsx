"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/client";

const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const maxBytes = 5 * 1024 * 1024;

type Props = { name: string; label: string; defaultValue?: string; error?: string; optionalLabel?: string; t: Dictionary["admin"]["image"] };

/**
 * Imagen de portada (noticias, actividades, proyectos). El navegador sube el fichero a Storage con la sesión del admin
 * (carpeta imatges/ del bucket "fotos") y el formulario guarda su dirección pública. También se puede pegar una dirección.
 */
export function ImageInput({ name, label, defaultValue = "", error, optionalLabel, t }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!types[file.type] || file.size > maxBytes) return setProblem(`${file.name}: ${t.invalidFile}`);
    setBusy(true);
    setProblem(null);
    const supabase = createClient();
    const path = `imatges/${crypto.randomUUID()}.${types[file.type]}`;
    const { error: uploadError } = await supabase.storage.from("fotos").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    setBusy(false);
    if (uploadError) return setProblem(`${file.name}: ${t.uploadError}`);
    setUrl(supabase.storage.from("fotos").getPublicUrl(path).data.publicUrl);
  }

  const message = problem ?? error;
  return (
    <fieldset className="space-y-3" aria-describedby={`${name}-image-hint`}>
      <legend className="font-semibold">
        {label}
        {optionalLabel && <span className="ml-1 font-normal text-muted">({optionalLabel})</span>}
      </legend>
      <p id={`${name}-image-hint`} className="text-sm text-muted">
        {t.hint}
      </p>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- vista previa de Storage o de una dirección externa
        <img src={url} alt={t.preview} className="aspect-[16/9] w-full max-w-md rounded-md border border-line object-cover" />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-accent px-4 font-semibold text-accent hover:bg-accent-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent">
          {busy ? t.uploading : url ? t.change : t.choose}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              upload(e.currentTarget.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="min-h-11 font-semibold text-red-700 underline underline-offset-4 dark:text-red-400">
            {t.remove}
          </button>
        )}
      </div>
      {message && (
        <p id={`${name}-error`} role="alert" className="text-sm font-semibold text-red-700 dark:text-red-400">
          {message}
        </p>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted">{t.pasteUrl}</summary>
        <label htmlFor={name} className="sr-only">
          {t.pasteUrl}
        </label>
        <input
          id={name}
          name={name}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-invalid={error ? true : undefined}
          className="mt-2 block min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-foreground"
        />
      </details>
    </fieldset>
  );
}
