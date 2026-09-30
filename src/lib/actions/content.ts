"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { format } from "@/i18n/format";
import { logAction } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { contactSchema, newsSchema, projectSchema, resourceSchema, volunteerSchema } from "@/lib/content-schema";
import { associationEmail, sendEmail } from "@/lib/email";
import { formValues, type FormState } from "@/lib/forms";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { fieldErrors } from "./zod-errors";

function langOf(formData: FormData): Locale {
  const raw = String(formData.get("lang") ?? "");
  return isLocale(raw) ? raw : defaultLocale;
}

/** Comprobación rápida en la web; la de verdad la hace la base de datos (is_admin exige la sesión con 2FA). */
async function isAdmin() {
  const user = await getCurrentUser();
  return user?.profile.account_type === "admin";
}

const uuid = /^[0-9a-f-]{36}$/i;

// --- Noticias ----------------------------------------------------------------

export async function saveNews(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const lang = langOf(formData);
  if (!(await isAdmin())) return { status: "error", error: "generic", values };
  const id = String(formData.get("id") ?? "");
  if (id && !uuid.test(id)) return { status: "error", error: "generic", values };
  const parsed = newsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  const d = parsed.data;
  const slug = slugify(d.slug || d.title);
  if (slug.length < 2) return { status: "error", fieldErrors: { slug: "required" }, values };
  const row = {
    title: d.title,
    slug,
    lang: d.lang_text,
    summary: d.summary,
    body: d.body,
    image_url: d.image_url,
    activity_id: d.activity_id,
    published_on: d.published_on,
    status: d.status,
  };
  const supabase = await createClient();
  const { data, error } = id
    ? await supabase.from("news").update(row).eq("id", id).select("id").maybeSingle()
    : await supabase.from("news").insert(row).select("id").maybeSingle();
  if (error || !data) {
    if (error?.code === "23505") return { status: "error", fieldErrors: { slug: "slugTaken" }, values };
    console.error("[saveNews]", error?.message);
    return { status: "error", error: "generic", values };
  }
  await logAction(id ? "news_update" : "news_create", "news", data.id, { slug, status: d.status });
  revalidatePath(`/${lang}`, "layout");
  if (!id) redirect(`/${lang}/admin/noticies/${data.id}?creada=1`);
  return { status: "success", values: { ...values, slug } };
}

export async function deleteNews(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  if ((await isAdmin()) && uuid.test(id)) {
    const supabase = await createClient();
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (!error) await logAction("news_delete", "news", id);
    revalidatePath(`/${lang}`, "layout");
  }
  redirect(`/${lang}/admin/noticies?esborrada=1`);
}

// --- Recursos ------------------------------------------------------------------

export async function saveResource(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const lang = langOf(formData);
  if (!(await isAdmin())) return { status: "error", error: "generic", values };
  const id = String(formData.get("id") ?? "");
  if (id && !uuid.test(id)) return { status: "error", error: "generic", values };
  const parsed = resourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  const d = parsed.data;
  const slug = slugify(d.slug || d.title);
  if (slug.length < 2) return { status: "error", fieldErrors: { slug: "required" }, values };
  const row = {
    title: d.title,
    slug,
    lang: d.lang_text,
    category: d.category,
    summary: d.summary,
    body: d.body,
    external_url: d.external_url,
    position: d.position,
    status: d.status,
  };
  const supabase = await createClient();
  const { data, error } = id
    ? await supabase.from("resources").update(row).eq("id", id).select("id").maybeSingle()
    : await supabase.from("resources").insert(row).select("id").maybeSingle();
  if (error || !data) {
    if (error?.code === "23505") return { status: "error", fieldErrors: { slug: "slugTaken" }, values };
    console.error("[saveResource]", error?.message);
    return { status: "error", error: "generic", values };
  }
  await logAction(id ? "resource_update" : "resource_create", "resource", data.id, { slug, status: d.status });
  revalidatePath(`/${lang}`, "layout");
  if (!id) redirect(`/${lang}/admin/recursos/${data.id}?creat=1`);
  return { status: "success", values: { ...values, slug } };
}

export async function deleteResource(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  if ((await isAdmin()) && uuid.test(id)) {
    const supabase = await createClient();
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (!error) await logAction("resource_delete", "resource", id);
    revalidatePath(`/${lang}`, "layout");
  }
  redirect(`/${lang}/admin/recursos?esborrat=1`);
}

// --- Proyectos -----------------------------------------------------------------

export async function saveProject(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const lang = langOf(formData);
  if (!(await isAdmin())) return { status: "error", error: "generic", values };
  const id = String(formData.get("id") ?? "");
  if (id && !uuid.test(id)) return { status: "error", error: "generic", values };
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  const d = parsed.data;
  const slug = slugify(d.slug || d.title);
  if (slug.length < 2) return { status: "error", fieldErrors: { slug: "required" }, values };
  const row = {
    title: d.title,
    slug,
    lang: d.lang_text,
    subtitle: d.subtitle,
    body: d.body,
    image_url: d.image_url,
    position: d.position,
    status: d.status,
  };
  const supabase = await createClient();
  const { data, error } = id
    ? await supabase.from("projects").update(row).eq("id", id).select("id").maybeSingle()
    : await supabase.from("projects").insert(row).select("id").maybeSingle();
  if (error || !data) {
    if (error?.code === "23505") return { status: "error", fieldErrors: { slug: "slugTaken" }, values };
    console.error("[saveProject]", error?.message);
    return { status: "error", error: "generic", values };
  }
  await logAction(id ? "project_update" : "project_create", "project", data.id, { slug, status: d.status });
  revalidatePath(`/${lang}`, "layout");
  if (!id) redirect(`/${lang}/admin/projectes/${data.id}?creat=1`);
  return { status: "success", values: { ...values, slug } };
}

export async function deleteProject(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  if ((await isAdmin()) && uuid.test(id)) {
    const supabase = await createClient();
    // Las fotos de la galería se borran con el proyecto; también sus ficheros.
    const { data: photos } = await supabase.from("project_photos").select("path").eq("project_id", id).returns<{ path: string }[]>();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      if (photos?.length) await supabase.storage.from("fotos").remove(photos.map((p) => p.path));
      await logAction("project_delete", "project", id);
    }
    revalidatePath(`/${lang}`, "layout");
  }
  redirect(`/${lang}/admin/projectes?esborrat=1`);
}

// --- Fotos de actividades y proyectos ----------------------------------------------
// El navegador sube el fichero directamente a Storage (con la sesión del admin); aquí solo se registra.

export type PhotoOwner = "activity" | "project";

const photoTables = {
  activity: { table: "activity_photos", column: "activity_id", folder: (id: string) => id, page: (lang: string, id: string) => `/${lang}/admin/activitats/${id}/fotos` },
  project: { table: "project_photos", column: "project_id", folder: (id: string) => `projectes/${id}`, page: (lang: string, id: string) => `/${lang}/admin/projectes/${id}/fotos` },
} as const;

export async function addPhoto(input: { lang: string; owner: PhotoOwner; ownerId: string; path: string; caption: string }) {
  const lang: Locale = isLocale(input.lang) ? input.lang : defaultLocale;
  const t = photoTables[input.owner];
  if (!t || !(await isAdmin()) || !uuid.test(input.ownerId)) return { ok: false };
  // La ruta la ha elegido el navegador: se exige que esté en la carpeta de la actividad o del proyecto.
  if (!new RegExp(`^${t.folder(input.ownerId)}/[0-9a-f-]{36}\\.(jpe?g|png|webp)$`).test(input.path)) return { ok: false };
  const supabase = await createClient();
  const { data: last } = await supabase
    .from(t.table)
    .select("position")
    .eq(t.column, input.ownerId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle<{ position: number }>();
  const { data, error } = await supabase
    .from(t.table)
    .insert({ [t.column]: input.ownerId, path: input.path, caption: input.caption.trim().slice(0, 200), position: (last?.position ?? 0) + 1 })
    .select("id")
    .maybeSingle();
  if (error || !data) {
    console.error("[addPhoto]", error?.message);
    return { ok: false };
  }
  await logAction("photo_add", input.owner, input.ownerId, { path: input.path });
  revalidatePath(`/${lang}`, "layout");
  return { ok: true };
}

export async function deletePhoto(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  const owner: PhotoOwner = formData.get("owner") === "project" ? "project" : "activity";
  const ownerId = String(formData.get("owner_id") ?? formData.get("activity") ?? "");
  const t = photoTables[owner];
  if ((await isAdmin()) && uuid.test(id) && uuid.test(ownerId)) {
    const supabase = await createClient();
    const { data } = await supabase.from(t.table).delete().eq("id", id).eq(t.column, ownerId).select("path").maybeSingle<{ path: string }>();
    if (data) {
      await supabase.storage.from("fotos").remove([data.path]);
      await logAction("photo_delete", owner, ownerId, { path: data.path });
    }
    revalidatePath(`/${lang}`, "layout");
  }
  redirect(t.page(lang, ownerId));
}

// --- Contacto --------------------------------------------------------------------

export async function sendContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const lang = langOf(formData);
  if (!getSupabaseEnv()) return { status: "error", error: "notConfigured", values };
  // Campo trampa: invisible para las personas; si llega relleno es un robot. Se responde como si nada.
  if (String(formData.get("website") ?? "") !== "") return { status: "success" };
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({ name: d.name, email: d.email, phone: d.phone, message: d.message, locale: lang });
  if (error) {
    console.error("[sendContact]", error.message);
    return { status: "error", error: "generic", values };
  }
  const e = (await getDictionary("ca")).emails;
  await sendEmail({
    to: associationEmail,
    replyTo: d.email,
    subject: format(e.contactSubject, { name: d.name }),
    text: [format(e.contactBody, { name: d.name, email: d.email, phone: d.phone || "—" }), "", d.message].join("\n"),
  });
  return { status: "success" };
}

export async function setContactHandled(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  const handled = formData.get("handled") === "1";
  if ((await isAdmin()) && uuid.test(id)) {
    const supabase = await createClient();
    await supabase.from("contact_messages").update({ handled_at: handled ? new Date().toISOString() : null }).eq("id", id);
    revalidatePath(`/${lang}/admin`, "layout");
  }
  redirect(`/${lang}/admin/missatges`);
}

// --- Voluntariado ------------------------------------------------------------------

export async function saveVolunteerApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  values.areas = formData.getAll("areas").map(String).join(",");
  const lang = langOf(formData);
  const user = await getCurrentUser();
  if (user?.profile.account_type !== "voluntari") return { status: "error", error: "generic", values };
  const parsed = volunteerSchema.safeParse({ ...Object.fromEntries(formData), areas: formData.getAll("areas") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  const supabase = await createClient();
  const { data: existing } = await supabase.from("volunteer_applications").select("profile_id").eq("profile_id", user.id).maybeSingle();
  const { error } = existing
    ? await supabase.from("volunteer_applications").update(parsed.data).eq("profile_id", user.id)
    : await supabase.from("volunteer_applications").insert(parsed.data);
  if (error) {
    console.error("[saveVolunteerApplication]", error.message);
    return { status: "error", error: "generic", values };
  }
  if (!existing) {
    const e = (await getDictionary("ca")).emails;
    await sendEmail({
      to: associationEmail,
      replyTo: user.email,
      subject: format(e.volunteerSubject, { name: user.profile.full_name }),
      text: format(e.volunteerBody, {
        name: user.profile.full_name,
        email: user.email,
        phone: user.profile.phone,
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/ca/admin/voluntaris`,
      }),
    });
  }
  revalidatePath(`/${lang}/compte`, "layout");
  return { status: "success", values, detail: existing ? "updated" : "created" };
}

export async function setVolunteerStatus(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if ((await isAdmin()) && uuid.test(id) && ["nova", "contactada", "activa", "arxivada"].includes(status)) {
    const supabase = await createClient();
    const { error } = await supabase.from("volunteer_applications").update({ status }).eq("profile_id", id);
    if (!error) await logAction("volunteer_status", "profile", id, { status });
    revalidatePath(`/${lang}/admin`, "layout");
  }
  redirect(`/${lang}/admin/voluntaris#v-${id}`);
}
