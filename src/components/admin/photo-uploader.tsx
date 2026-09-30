"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { addPhoto, type PhotoOwner } from "@/lib/actions/content";
import { createClient } from "@/lib/supabase/client";
import { Alert, Field } from "@/components/form";

const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const maxBytes = 5 * 1024 * 1024;

type Props = { lang: string; owner: PhotoOwner; ownerId: string; t: Dictionary["admin"]["photos"] };

/** Sube las fotos de una actividad o un proyecto directamente del navegador a Storage (con la sesión del admin) y después las registra. */
export function PhotoUploader({ lang, owner, ownerId, t }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function upload(form: HTMLFormElement) {
    const data = new FormData(form);
    const files = data.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    const caption = String(data.get("caption") ?? "");
    if (files.length === 0) return setMessage({ tone: "error", text: t.chooseFiles });
    const invalid = files.find((f) => !types[f.type] || f.size > maxBytes);
    if (invalid) return setMessage({ tone: "error", text: `${invalid.name}: ${t.invalidFile}` });
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    let done = 0;
    for (const file of files) {
      const folder = owner === "project" ? `projectes/${ownerId}` : owner === "news" ? `noticies/${ownerId}` : ownerId;
      const path = `${folder}/${crypto.randomUUID()}.${types[file.type]}`;
      const { error } = await supabase.storage.from("fotos").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
      if (error || !(await addPhoto({ lang, owner, ownerId, path, caption })).ok) {
        if (!error) await supabase.storage.from("fotos").remove([path]);
        setMessage({ tone: "error", text: `${file.name}: ${t.uploadError}` });
        break;
      }
      done++;
    }
    setBusy(false);
    if (done > 0) {
      form.reset();
      if (done === files.length) setMessage({ tone: "success", text: t.uploaded.replace("{n}", String(done)) });
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        upload(e.currentTarget);
      }}
      className="max-w-2xl space-y-5 rounded-lg border border-line bg-surface p-5"
    >
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <div>
        <label htmlFor="files" className="block font-semibold">
          {t.files}
        </label>
        <p id="files-hint" className="mt-1 text-sm text-muted">
          {t.filesHint}
        </p>
        <input id="files" name="files" type="file" multiple accept="image/jpeg,image/png,image/webp" aria-describedby="files-hint" className="mt-2 block w-full" />
      </div>
      <Field label={t.caption} name="caption" maxLength={200} hint={t.captionHint} />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90 disabled:opacity-60"
      >
        {busy ? t.uploading : t.upload}
      </button>
    </form>
  );
}
