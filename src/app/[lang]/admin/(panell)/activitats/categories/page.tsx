import Link from "next/link";
import { format } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { listCategories } from "@/lib/activities";
import { deleteCategory, saveCategory } from "@/lib/actions/categories";
import { listAllActivities } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { ConfirmForm } from "@/components/confirm-form";
import { Alert } from "@/components/form";
import { PageHeader } from "@/components/page-header";

const input = "mt-1 block w-full min-h-11 rounded-md border border-line bg-surface px-3 py-2";

function Fields({ id, values, t }: { id: string; values: { name_ca: string; name_es: string; sort_order: number | string }; t: Record<string, string> }) {
  return (
    <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_1fr_7rem]">
      <label className="block">
        <span className="font-semibold">{t.nameCa}</span>
        <input name="name_ca" required minLength={2} maxLength={60} defaultValue={values.name_ca} className={input} id={`${id}-ca`} lang="ca" />
      </label>
      <label className="block">
        <span className="font-semibold">{t.nameEs}</span>
        <input name="name_es" required minLength={2} maxLength={60} defaultValue={values.name_es} className={input} id={`${id}-es`} lang="es" />
      </label>
      <label className="block">
        <span className="font-semibold">{t.order}</span>
        <input name="sort_order" inputMode="numeric" pattern="\d{1,3}" defaultValue={values.sort_order} className={input} id={`${id}-order`} />
      </label>
    </div>
  );
}

export default async function AdminCategories({ params, searchParams }: PageProps<"/[lang]/admin/activitats/categories">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/activitats/categories`);
  const t = dict.admin.categories;
  const [categories, activities] = await Promise.all([listCategories(), listAllActivities()]);
  const { r } = await searchParams;
  const used = (id: string) => activities.filter((a) => a.category_id === id).length;
  const message = { desat: t.saved, esborrada: t.deleted }[String(r)];

  return (
    <div className="space-y-8">
      <Link href={`/${lang}/admin/activitats`} className="font-semibold text-accent underline underline-offset-4">
        ← {dict.admin.nav.activities}
      </Link>
      <PageHeader title={t.title} lead={t.lead} />
      {message && <Alert tone="success">{message}</Alert>}
      {r === "invalid" && <Alert tone="error">{t.invalid}</Alert>}
      {r === "error" && <Alert tone="error">{dict.errors.generic}</Alert>}

      <ul className="grid gap-4">
        {categories.map((c) => (
          <li key={c.id} id={`c-${c.id}`} className="space-y-3 rounded-lg border border-line bg-surface p-4">
            <form action={saveCategory} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="id" value={c.id} />
              <Fields id={c.id} values={c} t={t} />
              <button type="submit" className="min-h-11 rounded-md border border-accent px-4 font-semibold text-accent hover:bg-accent-soft">
                {dict.common.save}
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span>{format(t.usedBy, { n: used(c.id) })}</span>
              <ConfirmForm
                action={deleteCategory}
                lang={lang}
                id={c.id}
                label={dict.common.delete}
                confirmText={used(c.id) > 0 ? format(t.deleteConfirmUsed, { n: used(c.id) }) : t.deleteConfirm}
                confirmButton={dict.common.delete}
                cancel={dict.common.cancel}
              />
            </div>
          </li>
        ))}
      </ul>

      <section id="nova" className="space-y-3 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-extrabold">{t.new}</h2>
        <form action={saveCategory} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-line p-4">
          <input type="hidden" name="lang" value={lang} />
          <Fields id="nova" values={{ name_ca: "", name_es: "", sort_order: categories.length + 1 }} t={t} />
          <button type="submit" className="min-h-11 rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
            {t.add}
          </button>
        </form>
      </section>
    </div>
  );
}
