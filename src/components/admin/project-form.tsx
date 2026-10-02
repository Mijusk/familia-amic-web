"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { saveProject } from "@/lib/actions/content";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, Select, SubmitButton, TextArea } from "@/components/form";
import { ImageInput } from "./image-input";
import { LivePreview, type PreviewTexts } from "./live-preview";

type Props = {
  lang: string;
  initial: Record<string, string> & { id?: string };
  created?: boolean;
  t: Dictionary["admin"]["projects"];
  content: Dictionary["admin"]["content"];
  image: Dictionary["admin"]["image"];
  errors: Dictionary["errors"];
  common: Dictionary["common"];
  preview: PreviewTexts;
};

export function ProjectForm({ lang, initial, created, t, content, image, errors, common, preview }: Props) {
  const [state, action, pending] = useActionState(saveProject, initialFormState);
  const v = { ...initial, ...state.values };
  const fe = state.fieldErrors ?? {};
  const err = (name: string) => (fe[name] ? errors[fe[name]!] : undefined);

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[minmax(0,48rem)_20rem]" noValidate>
      <div className="min-w-0 space-y-5">
        <input type="hidden" name="lang" value={lang} />
        {initial.id && <input type="hidden" name="id" value={initial.id} />}
        {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
        {!state.error && Object.keys(fe).length > 0 && <Alert tone="error">{errors.reviewForm}</Alert>}
        {(state.status === "success" || (created && state.status === "idle")) && <Alert tone="success">{created && state.status === "idle" ? t.created : content.saved}</Alert>}

        <Field label={content.fTitle} name="title" required maxLength={120} defaultValue={v.title} error={err("title")} />
        <Field label={t.fSubtitle} name="subtitle" maxLength={200} hint={t.fSubtitleHint} optionalLabel={common.optional} defaultValue={v.subtitle} error={err("subtitle")} />
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label={content.fSlug} name="slug" defaultValue={v.slug} hint={content.fSlugHint} optionalLabel={common.optional} error={err("slug")} />
          <Select
            label={content.fLang}
            name="lang_text"
            defaultValue={v.lang_text}
            options={[
              { value: "ca", label: "Català" },
              { value: "es", label: "Castellano" },
            ]}
          />
          <Field label={t.fPosition} name="position" inputMode="numeric" hint={t.fPositionHint} optionalLabel={common.optional} defaultValue={v.position} error={err("position")} />
        </div>
        <ImageInput label={t.fImage} name="image_url" optionalLabel={common.optional} defaultValue={v.image_url} error={err("image_url")} t={image} />
        <TextArea label={t.fBody} name="body" maxLength={20000} rows={14} hint={content.fBodyHint} optionalLabel={common.optional} defaultValue={v.body} error={err("body")} />
        <Select
          label={content.fStatus}
          name="status"
          defaultValue={v.status}
          options={(["esborrany", "publicada"] as const).map((s) => ({ value: s, label: content.status[s] }))}
        />
        <SubmitButton pending={pending} pendingLabel={common.saving}>
          {common.save}
        </SubmitButton>
      </div>
      <LivePreview kind="project" lang={lang} {...preview} />
    </form>
  );
}
