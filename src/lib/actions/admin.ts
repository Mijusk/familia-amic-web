"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { format } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { logAction } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { formValues, type ErrorKey, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { activitySchema } from "@/lib/activity-schema";
import { slugify } from "@/lib/slug";
import { fieldErrors } from "./zod-errors";

function langOf(formData: FormData): Locale {
  const raw = String(formData.get("lang") ?? "");
  return isLocale(raw) ? raw : defaultLocale;
}

/** Comprobación rápida en la web; la de verdad la hace la base de datos (is_admin exige la sesión con 2FA). */
async function adminOrNull() {
  const user = await getCurrentUser();
  return user?.profile.account_type === "admin" ? user : null;
}

const uuid = /^[0-9a-f-]{36}$/i;

export async function saveActivity(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  // Una casilla sin marcar no llega en el formulario: se guarda explícitamente para no recuperar el valor anterior.
  values.enrollment_open = formData.get("enrollment_open") === "on" ? "on" : "";
  const lang = langOf(formData);
  if (!(await adminOrNull())) return { status: "error", error: "generic", values };
  const id = String(formData.get("id") ?? "");
  if (id && !uuid.test(id)) return { status: "error", error: "generic", values };

  const parsed = activitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  const d = parsed.data;
  const slug = d.slug ? slugify(d.slug) : slugify(d.title);
  if (slug.length < 2) return { status: "error", fieldErrors: { slug: "required" }, values };
  const recurrent = d.kind === "recurrent";

  const row = {
    title: d.title,
    slug,
    lang: d.lang_text,
    summary: d.summary,
    description: d.description,
    image_url: d.image_url,
    category_id: d.category_id,
    kind: d.kind,
    weekday: recurrent ? Number(d.weekday) : null,
    start_time: recurrent ? d.start_time : null,
    end_time: recurrent ? d.end_time : null,
    starts_on: d.starts_on,
    ends_on: d.ends_on,
    location: d.location,
    capacity: d.capacity,
    price_cents: d.payment_method === "gratuit" ? null : d.price,
    payment_method: d.payment_method,
    payment_notes: d.payment_notes,
    enrollment_open: formData.get("enrollment_open") === "on",
    status: d.status,
    featured_from: d.featured_from,
    featured_until: d.featured_until,
  };

  const supabase = await createClient();
  const { data, error } = id
    ? await supabase.from("activities").update(row).eq("id", id).select("id").maybeSingle()
    : await supabase.from("activities").insert(row).select("id").maybeSingle();
  if (error || !data) {
    if (error?.code === "23505") return { status: "error", fieldErrors: { slug: "slugTaken" }, values };
    console.error("[saveActivity]", error?.message);
    return { status: "error", error: "generic", values };
  }
  await logAction(id ? "activity_update" : "activity_create", "activity", data.id, { slug, status: d.status });
  revalidatePath(`/${lang}/activitats`, "layout");
  revalidatePath(`/${lang}/admin`, "layout");
  if (!id) redirect(`/${lang}/admin/activitats/${data.id}?creada=1`);
  return { status: "success", values: { ...values, slug } };
}

export async function setMembershipStatus(formData: FormData) {
  const lang = langOf(formData);
  const familyId = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if ((await adminOrNull()) && uuid.test(familyId)) {
    const supabase = await createClient();
    await supabase.rpc("admin_set_membership_status", { p_family_id: familyId, p_status: status });
    revalidatePath(`/${lang}/admin`, "layout");
  }
  redirect(`/${lang}/admin/families/${familyId}?estat=1`);
}

export async function confirmEnrollment(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  const activityId = String(formData.get("activity") ?? "");
  const over = formData.get("over") === "1";
  let result = "error";
  if ((await adminOrNull()) && uuid.test(id) && uuid.test(activityId)) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_confirm_enrollment", { p_enrollment_id: id, p_over_capacity: over });
    if (!error) {
      result = "confirmada";
      await notifyPromoted(id);
    } else if (error.message.includes("full")) result = "full";
    revalidatePath(`/${lang}/admin`, "layout");
    revalidatePath(`/${lang}/activitats`, "layout");
  }
  redirect(`/${lang}/admin/activitats/${activityId}/inscrits?r=${result}`);
}

/** Avisa a la familia de que ya tiene plaza, en el idioma de su cuenta. */
async function notifyPromoted(enrollmentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("family_id, activities(title), participants(first_name, last_name), profiles(full_name, locale)")
    .eq("id", enrollmentId)
    .maybeSingle<{
      family_id: string;
      activities: { title: string } | null;
      participants: { first_name: string; last_name: string } | null;
      profiles: { full_name: string; locale: string } | null;
    }>();
  if (!data) return;
  const { data: emails } = await supabase.rpc("admin_account_emails", { p_ids: [data.family_id] });
  const to = ((emails ?? []) as { email: string }[])[0]?.email;
  if (!to) return;
  const lang: Locale = data.profiles?.locale === "es" ? "es" : "ca";
  const e = (await getDictionary(lang)).emails;
  const activity = data.activities?.title ?? "";
  const name = `${data.participants?.first_name ?? ""} ${data.participants?.last_name ?? ""}`.trim();
  await sendEmail({
    to,
    subject: format(e.promotedSubject, { activity }),
    text: [
      format(e.greeting, { name: data.profiles?.full_name.split(" ")[0] ?? "" }),
      "",
      format(e.promotedBody, { name, activity }),
      "",
      format(e.manage, { url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${lang}/compte/inscripcions` }),
      "",
      e.signature,
    ].join("\n"),
  });
}

export async function cancelEnrollmentAsAdmin(formData: FormData) {
  const lang = langOf(formData);
  const id = String(formData.get("id") ?? "");
  const activityId = String(formData.get("activity") ?? "");
  let result = "error";
  if ((await adminOrNull()) && uuid.test(id)) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_cancel_enrollment", { p_enrollment_id: id });
    if (!error) result = "baixa";
    revalidatePath(`/${lang}/admin`, "layout");
    revalidatePath(`/${lang}/activitats`, "layout");
  }
  redirect(uuid.test(activityId) ? `/${lang}/admin/activitats/${activityId}/inscrits?r=${result}` : `/${lang}/admin`);
}

export type GrantState = { status: "idle" | "error" | "success"; error?: ErrorKey; values?: Record<string, string> };

export async function grantAdmin(_prev: GrantState, formData: FormData): Promise<GrantState> {
  const lang = langOf(formData);
  const email = String(formData.get("email") ?? "").trim();
  if (!(await adminOrNull())) return { status: "error", error: "generic" };
  if (!z.email().safeParse(email).success) return { status: "error", error: "invalidEmail", values: { email } };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_grant_admin", { p_email: email });
  if (error) return { status: "error", error: error.message.includes("no_account") ? "noAccount" : "generic", values: { email } };
  revalidatePath(`/${lang}/admin`, "layout");
  return { status: "success" };
}
