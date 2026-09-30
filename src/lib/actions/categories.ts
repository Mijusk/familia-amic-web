"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { logAction } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

function langOf(formData: FormData): Locale {
  const raw = String(formData.get("lang") ?? "");
  return isLocale(raw) ? raw : defaultLocale;
}

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.profile.account_type === "admin";
}

const uuid = /^[0-9a-f-]{36}$/i;

const schema = z.object({
  name_ca: z.string().trim().min(2).max(60),
  name_es: z.string().trim().min(2).max(60),
  sort_order: z.preprocess((v) => (v === "" || v == null ? "0" : v), z.string().regex(/^\d{1,3}$/).transform(Number)),
});

/** Crea o renombra una categoría. El slug (el de la URL del filtro) se fija al crearla y no cambia. */
export async function saveCategory(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  const back = `/${lang}/admin/activitats/categories`;
  if (!(await isAdmin()) || (id && !uuid.test(id))) redirect(`${back}?r=error`);
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${back}?r=invalid${id ? `#c-${id}` : "#nova"}`);
  const supabase = await createClient();
  let result = "desat";
  if (id) {
    const { error } = await supabase.from("categories").update(parsed.data).eq("id", id);
    if (error) result = "error";
    else await logAction("category_update", "category", id, { name: parsed.data.name_ca });
  } else {
    const base = slugify(parsed.data.name_ca).slice(0, 36) || "categoria";
    let { data, error } = await supabase.from("categories").insert({ ...parsed.data, slug: base }).select("id").maybeSingle();
    // Si el slug ya existe, se le añade un número.
    for (let n = 2; error?.code === "23505" && n < 10; n++) {
      ({ data, error } = await supabase.from("categories").insert({ ...parsed.data, slug: `${base}-${n}` }).select("id").maybeSingle());
    }
    if (error || !data) result = "error";
    else await logAction("category_create", "category", data.id, { name: parsed.data.name_ca });
  }
  if (result === "error") console.error("[saveCategory]", id);
  revalidatePath(`/${lang}`, "layout");
  redirect(`${back}?r=${result}`);
}

/** Borra una categoría: las actividades que la tenían se quedan sin categoría. */
export async function deleteCategory(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  let result = "error";
  if ((await isAdmin()) && uuid.test(id)) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").delete().eq("id", id).select("name_ca").maybeSingle<{ name_ca: string }>();
    if (!error && data) {
      result = "esborrada";
      await logAction("category_delete", "category", id, { name: data.name_ca });
    }
    revalidatePath(`/${lang}`, "layout");
  }
  redirect(`/${lang}/admin/activitats/categories?r=${result}`);
}
