"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { saveNews } from "@/lib/actions/content";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, Select, SubmitButton, TextArea } from "@/components/form";
import { FeaturedFields } from "./featured-fields";
import { ImageInput } from "./image-input";

type Props = {
  lang: string;
  initial: Record<string, string> & { id?: string };
  activities: { id: string; title: string }[];
  created?: boolean;
  t: Dictionary["admin"]["news"];
  content: Dictionary["admin"]["content"];
  image: Dictionary["admin"]["image"];
  featured: Dictionary["admin"]["featured"];
  errors: Dictionary["errors"];
  common: Dictionary["common"];
};

export function NewsForm({ lang, initial, activities, created, t, content, image, featured, errors, common }: Props) {
  const [state, action, pending] = useActionState(saveNews, initialFormState);
  const v = { ...initial, ...state.values };
  const fe = state.fieldErrors ?? {};
  const err = (name: string) => (fe[name] ? errors[fe[name]!] : undefined);

  return (
    <form action={action} className="max-w-3xl space-y-5" noValidate>
      <input type="hidden" name="lang" value={lang} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {state.error && <Alert tone="error">{errors[state.error]}</Alert>}
      {!state.error && Object.keys(fe).length > 0 && <Alert tone="error">{errors.reviewForm}</Alert>}
      {(state.status === "success" || (created && state.status === "idle")) && <Alert tone="success">{created && state.status === "idle" ? t.created : content.saved}</Alert>}

      <Field label={content.fTitle} name="title" required defaultValue={v.title} error={err("title")} />
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
        <Field label={t.fDate} name="published_on" type="date" required defaultValue={v.published_on} error={err("published_on")} />
      </div>
      <TextArea label={content.fSummary} name="summary" required maxLength={400} rows={2} hint={content.fSummaryHint} defaultValue={v.summary} error={err("summary")} />
      <TextArea label={content.fBody} name="body" maxLength={20000} rows={14} hint={content.fBodyHint} optionalLabel={common.optional} defaultValue={v.body} error={err("body")} />
      <ImageInput label={t.fImage} name="image_url" optionalLabel={common.optional} defaultValue={v.image_url} error={err("image_url")} t={image} />
      <Select
        label={t.fActivity}
        name="activity_id"
        defaultValue={v.activity_id}
        options={[{ value: "", label: t.noActivity }, ...activities.map((a) => ({ value: a.id, label: a.title }))]}
      />
      <FeaturedFields from={v.featured_from} until={v.featured_until} err={err} t={featured} optional={common.optional} />
      <Select
        label={content.fStatus}
        name="status"
        defaultValue={v.status}
        options={(["esborrany", "publicada"] as const).map((s) => ({ value: s, label: content.status[s] }))}
      />
      <SubmitButton pending={pending} pendingLabel={common.saving}>
        {common.save}
      </SubmitButton>
    </form>
  );
}
