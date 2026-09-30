import { loadPage } from "@/i18n/page";
import { deleteSlide, saveSlide } from "@/lib/actions/content";
import { requireAdmin } from "@/lib/auth";
import { listAllHomeSlides, type HomeSlide } from "@/lib/content";
import { ImageInput } from "@/components/admin/image-input";
import { ConfirmForm } from "@/components/confirm-form";
import { Alert } from "@/components/form";
import { PageHeader } from "@/components/page-header";

const input = "mt-1 block w-full min-h-11 rounded-md border border-line bg-surface px-3 py-2";

function Fields({ id, slide, t }: { id: string; slide?: HomeSlide; t: Record<string, string> }) {
  return (
    <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_1fr_6rem]">
      <label className="block">
        <span className="font-semibold">{t.caption}</span>
        <input name="caption" maxLength={140} defaultValue={slide?.caption} className={input} id={`${id}-caption`} />
      </label>
      <label className="block">
        <span className="font-semibold">{t.link}</span>
        <input name="link_url" maxLength={500} defaultValue={slide?.link_url ?? ""} placeholder="/ca/activitats" className={input} id={`${id}-link`} />
      </label>
      <label className="block">
        <span className="font-semibold">{t.order}</span>
        <input name="position" inputMode="numeric" defaultValue={slide?.position ?? 0} className={input} id={`${id}-order`} />
      </label>
      <label className="flex items-center gap-3 sm:col-span-3">
        <input type="checkbox" name="active" defaultChecked={slide?.active ?? true} className="size-5 accent-[var(--accent)]" id={`${id}-active`} />
        <span>{t.active}</span>
      </label>
    </div>
  );
}

export default async function AdminHomeSlides({ params, searchParams }: PageProps<"/[lang]/admin/portada">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/portada`);
  const t = dict.admin.slides;
  const slides = await listAllHomeSlides();
  const { r } = await searchParams;
  const message = { desat: t.saved, esborrada: t.deleted }[String(r)];

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead} />
      {message && <Alert tone="success">{message}</Alert>}
      {r === "invalid" && <Alert tone="error">{t.invalid}</Alert>}
      {r === "error" && <Alert tone="error">{dict.errors.generic}</Alert>}

      {slides.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="grid gap-4">
          {slides.map((s) => (
            <li key={s.id} id={`s-${s.id}`} className="grid gap-4 rounded-lg border border-line bg-surface p-4 md:grid-cols-[14rem_1fr]">
              {/* eslint-disable-next-line @next/next/no-img-element -- imagen de Storage, sin optimizador */}
              <img src={s.image_url} alt="" className={`aspect-[4/3] w-full rounded-md object-cover ${s.active ? "" : "opacity-50"}`} />
              <div className="space-y-3">
                <form action={saveSlide} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="image_url" value={s.image_url} />
                  <Fields id={s.id} slide={s} t={t} />
                  <button type="submit" className="min-h-11 rounded-md border border-accent px-4 font-semibold text-accent hover:bg-accent-soft">
                    {dict.common.save}
                  </button>
                </form>
                <ConfirmForm
                  action={deleteSlide}
                  lang={lang}
                  id={s.id}
                  label={dict.common.delete}
                  confirmText={t.deleteConfirm}
                  confirmButton={dict.common.delete}
                  cancel={dict.common.cancel}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <section id="nova" className="space-y-3 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-extrabold">{t.new}</h2>
        <p className="text-sm text-muted">{t.linkHint}</p>
        <form action={saveSlide} className="space-y-5 rounded-lg border border-dashed border-line p-5">
          <input type="hidden" name="lang" value={lang} />
          <ImageInput name="image_url" label={t.image} t={dict.admin.image} />
          <Fields id="nova" slide={{ id: "", image_url: "", caption: "", link_url: null, position: slides.length + 1, active: true }} t={t} />
          <button type="submit" className="min-h-11 rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
            {t.add}
          </button>
        </form>
      </section>
    </div>
  );
}
