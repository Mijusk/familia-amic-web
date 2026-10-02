"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { defaultFrame, parseFrame, withFrame } from "@/lib/image-frame";
import { createClient } from "@/lib/supabase/client";
import { FrameEditor, type Shape } from "./frame-editor";

const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const maxBytes = 5 * 1024 * 1024;

type Props = {
  name: string;
  /** Para usar varios en la misma página (fotos del inicio). */
  id?: string;
  label: string;
  defaultValue?: string;
  error?: string;
  optionalLabel?: string;
  /** Formas en que sale la foto en la web; la primera es la que se encuadra arrastrando. */
  use?: Shape[];
  t: Dictionary["admin"]["image"];
};

/**
 * Imagen de portada (noticias, actividades, proyectos). El navegador sube el fichero a Storage con la sesión del admin
 * (carpeta imatges/ del bucket "fotos") y el formulario guarda su dirección pública. También se puede pegar una dirección.
 * Después se encuadra (qué parte se ve y con cuánto zoom); el encuadre viaja en la dirección (lib/image-frame.ts).
 */
export function ImageInput({ name, id = name, label, defaultValue = "", error, optionalLabel, use = ["card", "page", "wide"], t }: Props) {
  const [src, setSrc] = useState(() => parseFrame(defaultValue).src);
  const [frame, setFrame] = useState(() => parseFrame(defaultValue).frame);
  const value = withFrame(src, frame);
  const hidden = useRef<HTMLInputElement>(null);
  const setUrl = (u: string) => {
    const p = parseFrame(u);
    setSrc(p.src);
    setFrame(u === src ? frame : p.frame);
  };
  // Avisa al formulario de cada cambio (la vista previa lo escucha).
  useEffect(() => {
    hidden.current?.form?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [value]);
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
    setSrc(supabase.storage.from("fotos").getPublicUrl(path).data.publicUrl);
    setFrame(defaultFrame);
  }

  const message = problem ?? error;
  return (
    <fieldset className="space-y-3" aria-describedby={`${id}-image-hint`}>
      <legend className="font-semibold">
        {label}
        {optionalLabel && <span className="ml-1 font-normal text-muted">({optionalLabel})</span>}
      </legend>
      <p id={`${id}-image-hint`} className="text-sm text-muted">
        {t.hint}
      </p>
      <input ref={hidden} type="hidden" name={name} value={value} />
      {src && <FrameEditor src={src} frame={frame} onChange={setFrame} use={use} t={t} />}
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-accent px-4 font-semibold text-accent hover:bg-accent-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent">
          {busy ? t.uploading : src ? t.change : t.choose}
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
        {src && (
          <button type="button" onClick={() => setUrl("")} className="min-h-11 font-semibold text-red-700 underline underline-offset-4 dark:text-red-400">
            {t.remove}
          </button>
        )}
      </div>
      {message && (
        <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-red-700 dark:text-red-400">
          {message}
        </p>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted">{t.pasteUrl}</summary>
        <label htmlFor={id} className="sr-only">
          {t.pasteUrl}
        </label>
        <input
          id={id}
          type="url"
          value={src}
          onChange={(e) => setUrl(e.target.value)}
          aria-invalid={error ? true : undefined}
          className="mt-2 block min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-foreground"
        />
      </details>
    </fieldset>
  );
}
