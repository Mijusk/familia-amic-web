"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { format, formatDate } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { getActivity } from "@/lib/activities";
import { getCurrentUser } from "@/lib/auth";
import { listParticipants } from "@/lib/data";
import { associationEmail, sendEmail } from "@/lib/email";
import type { ErrorKey } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

export type EnrollResultCode =
  | "confirmada"
  | "cua"
  | "prova"
  | "ja_inscrit"
  | "cal_ser_soci"
  | "prova_usada"
  | "prova_completa";

export type EnrollState = {
  status: "idle" | "error" | "success";
  error?: ErrorKey | "noneSelected";
  results?: { name: string; result: EnrollResultCode; date?: string }[];
  emailed?: boolean;
};

function langFrom(formData: FormData): Locale {
  const raw = String(formData.get("lang") ?? "");
  return isLocale(raw) ? raw : defaultLocale;
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function enroll(_prev: EnrollState, formData: FormData): Promise<EnrollState> {
  const lang = langFrom(formData);
  const user = await getCurrentUser();
  if (!user) return { status: "error", error: "linkInvalid" };

  const activity = await getActivity(String(formData.get("activity") ?? ""));
  if (!activity) return { status: "error", error: "activityClosed" };

  const participantIds = formData.getAll("participant").map(String);
  if (participantIds.length === 0) return { status: "error", error: "noneSelected" };
  const trialDate = String(formData.get("trial_date") ?? "") || null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("enroll", {
    p_activity_id: activity.id,
    p_participant_ids: participantIds,
    p_auto_renew: formData.get("renew") === "monthly",
    p_trial_date: trialDate,
  });

  if (error) {
    if (error.message.includes("closed")) return { status: "error", error: "activityClosed" };
    if (error.message.includes("bad_trial_date")) return { status: "error", error: "invalidDate" };
    console.error("[enroll]", error.message);
    return { status: "error", error: "generic" };
  }

  const participants = await listParticipants();
  const nameOf = (id: string) => {
    const p = participants.find((x) => x.id === id);
    return p ? `${p.first_name} ${p.last_name}` : "";
  };
  const rows = (data ?? []) as { participant_id: string; result: EnrollResultCode; enrollment_id: string | null }[];
  const results = rows.map((r) => ({
    name: nameOf(r.participant_id),
    result: r.result,
    date: r.result === "prova" && trialDate ? trialDate : undefined,
  }));

  // Correo de resumen solo si algo ha cambiado (plaza, cola o prueba).
  let emailed = false;
  if (results.some((r) => ["confirmada", "cua", "prova"].includes(r.result))) {
    const dict = await getDictionary(lang);
    const t = dict.activities;
    const e = dict.emails;
    const lines = results.map((r) => `- ${r.name}: ${format(t.results[r.result], { date: r.date ? formatDate(lang, r.date) : "" })}`);
    const paid = results.some((r) => r.result === "confirmada") && activity.payment_method === "transferencia" && activity.payment_notes;
    const text = [
      format(e.greeting, { name: user.profile.full_name.split(" ")[0] }),
      "",
      format(e.enrollIntro, { activity: activity.title }),
      ...lines,
      ...(results.some((r) => r.result === "cua") ? ["", e.queueNote] : []),
      ...(paid ? ["", format(e.paymentNote, { notes: activity.payment_notes })] : []),
      "",
      format(e.manage, { url: `${siteUrl()}/${lang}/compte/inscripcions` }),
      "",
      e.signature,
    ].join("\n");
    emailed = await sendEmail({ to: user.email, subject: format(e.enrollSubject, { activity: activity.title }), text });
  }

  revalidatePath(`/${lang}/activitats`, "layout");
  revalidatePath(`/${lang}/compte`, "layout");
  return { status: "success", results, emailed };
}

export async function unenroll(formData: FormData) {
  const lang = langFrom(formData);
  const id = String(formData.get("id") ?? "");
  const user = await getCurrentUser();
  if (!user || !/^[0-9a-f-]{36}$/i.test(id)) redirect(`/${lang}/compte/inscripcions`);

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("enrollments")
    .select("status, is_trial, participant_id, activities(title), participants(first_name, last_name)")
    .eq("id", id)
    .maybeSingle<{
      status: "confirmada" | "cua";
      is_trial: boolean;
      activities: { title: string } | null;
      participants: { first_name: string; last_name: string } | null;
    }>();
  const { error } = await supabase.rpc("unenroll", { p_enrollment_id: id });

  if (!error && before) {
    // El aviso a la asociación va en catalán, el idioma de trabajo de la entidad.
    const dict = await getDictionary("ca");
    const name = `${before.participants?.first_name ?? ""} ${before.participants?.last_name ?? ""}`.trim();
    const activity = before.activities?.title ?? "";
    const status = dict.enrollments.status[before.is_trial ? "prova" : before.status];
    await sendEmail({
      to: associationEmail,
      subject: format(dict.emails.unenrollSubject, { name, activity }),
      text: [
        format(dict.emails.unenrollBody, {
          family: `${user.profile.full_name} (${user.email}, ${user.profile.phone})`,
          name,
          activity,
          date: formatDate("ca", new Date().toISOString().slice(0, 10)),
          status,
        }),
        "",
        dict.emails.signature,
      ].join("\n"),
    });
  }

  revalidatePath(`/${lang}/compte`, "layout");
  revalidatePath(`/${lang}/activitats`, "layout");
  redirect(`/${lang}/compte/inscripcions${error ? "" : "?baixa=1"}`);
}
