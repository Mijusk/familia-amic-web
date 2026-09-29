"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { saveResource } from "@/lib/actions/content";
import { initialFormState } from "@/lib/forms";
import { Alert, Field, Select, SubmitButton, TextArea } from "@/components/form";

type Props = {
  lang: string;
  initial: Record<string, string> & { id?: string };
  created?: boolean;
  t: Dictionary["admin"]["resources"];
  content: Dictionary["admin"]["content"];
  categories: Dictionary["resources"]["categories"];
  errors: Dictionary["errors"];
  common: Dictionary["common"];
};

export function ResourceForm({ lang, initial, created, t, content, categories, errors, common }: Props) {
  const [state, action, pending] = useActionState(saveResource, initialFormState);
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label={t.fCategory}
          name="category"
          required
          defaultValue={v.category}
          options={(["legals", "educacio", "salut"] as const).map((c) => ({ value: c, label: categories[c] }))}
        />
        <Select
          label={content.fLang}
          name="lang_text"
          defaultValue={v.lang_text}
          options={[
            { value: "ca", label: "Català" },
            { value: "es", label: "Castellano" },
          ]}
        />
        <Field label={content.fSlug} name="slug" defaultValue={v.slug} hint={content.fSlugHint} optionalLabel={common.optional} error={err("slug")} />
        <Field label={t.fPosition} name="position" inputMode="numeric" hint={t.fPositionHint} optionalLabel={common.optional} defaultValue={v.position} error={err("position")} />
      </div>
      <TextArea label={content.fSummary} name="summary" maxLength={400} rows={2} hint={content.fSummaryHint} optionalLabel={common.optional} defaultValue={v.summary} error={err("summary")} />
      <TextArea label={content.fBody} name="body" maxLength={30000} rows={16} hint={content.fBodyHint} optionalLabel={common.optional} defaultValue={v.body} error={err("body")} />
      <Field label={t.fLink} name="external_url" type="url" hint={t.fLinkHint} optionalLabel={common.optional} defaultValue={v.external_url} error={err("external_url")} />
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
