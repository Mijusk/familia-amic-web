import "server-only";
import type { Activity, Enrollment } from "@/lib/activities";
import type { Membership, Participant } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

/** Consultas del panel. Todas pasan por RLS: solo devuelven datos a un admin con la verificación en dos pasos hecha. */

export type Account = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  account_type: "familia" | "voluntari" | "admin";
  created_at: string;
  membership_status: "pendent" | "actiu" | "baixa" | null;
  participants: number;
};

export async function listAccounts() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_list_accounts");
  return (data ?? []) as Account[];
}

export async function listAllActivities() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select(
      "id, slug, lang, title, summary, description, image_url, category_id, kind, weekday, start_time, end_time, starts_on, ends_on, location, capacity, price_cents, payment_method, payment_notes, enrollment_open, status",
    )
    .order("status")
    .order("starts_on", { ascending: false })
    .returns<Activity[]>();
  return data ?? [];
}

export async function getActivityById(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select(
      "id, slug, lang, title, summary, description, image_url, category_id, kind, weekday, start_time, end_time, starts_on, ends_on, location, capacity, price_cents, payment_method, payment_notes, enrollment_open, status",
    )
    .eq("id", id)
    .maybeSingle<Activity>();
  return data;
}

export type RosterEntry = Enrollment & {
  participants: Pick<
    Participant,
    "first_name" | "last_name" | "birth_date" | "disability_pct" | "has_dependency" | "dependency_grade" | "allergies" | "medical_notes"
  > | null;
  profiles: { full_name: string; phone: string } | null;
  family_id: string;
  email?: string;
};

/** Inscritos de una actividad, con datos de salud del participante y contacto de la familia. */
export async function getRoster(activityId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select(
      "id, activity_id, participant_id, family_id, status, is_trial, trial_date, auto_renew, starts_on, ends_on, cancelled_at, created_at, " +
        "participants(first_name, last_name, birth_date, disability_pct, has_dependency, dependency_grade, allergies, medical_notes), " +
        "profiles(full_name, phone)",
    )
    .eq("activity_id", activityId)
    .order("created_at")
    .returns<RosterEntry[]>();
  const rows = data ?? [];
  const emails = await accountEmails([...new Set(rows.map((r) => r.family_id))]);
  return rows.map((r) => ({ ...r, email: emails.get(r.family_id) }));
}

export async function accountEmails(ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_account_emails", { p_ids: ids });
  return new Map(((data ?? []) as { id: string; email: string }[]).map((r) => [r.id, r.email]));
}

export async function getFamily(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const [{ data: profile }, { data: membership }, { data: participants }, { data: enrollments }, emails] = await Promise.all([
    supabase.from("profiles").select("id, account_type, full_name, phone, locale, created_at").eq("id", id).maybeSingle<{
      id: string;
      account_type: "familia" | "voluntari" | "admin";
      full_name: string;
      phone: string;
      locale: string;
      created_at: string;
    }>(),
    supabase
      .from("memberships")
      .select("address, postal_code, city, bank_name, iban_last4, iban_encrypted, dni_encrypted, sepa_reference, sepa_accepted_at, status, member_since")
      .eq("family_id", id)
      .maybeSingle<Membership & { iban_encrypted: string; sepa_accepted_at: string }>(),
    supabase
      .from("participants")
      .select("id, first_name, last_name, birth_date, relationship, disability_pct, has_dependency, dependency_grade, allergies, medical_notes, dni_encrypted")
      .eq("family_id", id)
      .order("created_at")
      .returns<Participant[]>(),
    supabase
      .from("enrollments")
      .select("id, activity_id, participant_id, status, is_trial, trial_date, auto_renew, starts_on, ends_on, cancelled_at, created_at, activities(title, slug)")
      .eq("family_id", id)
      .order("created_at", { ascending: false })
      .returns<(Enrollment & { activities: { title: string; slug: string } | null })[]>(),
    accountEmails([id]),
  ]);
  if (!profile) return null;
  return { profile, email: emails.get(id) ?? "", membership, participants: participants ?? [], enrollments: enrollments ?? [] };
}

export type LogEntry = {
  id: number;
  admin_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  profiles: { full_name: string } | null;
};

export async function listLog() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_log")
    .select("id, admin_id, action, target_type, target_id, details, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<LogEntry[]>();
  return data ?? [];
}

export async function logAction(action: string, targetType: string, targetId: string, details: Record<string, unknown> = {}) {
  const supabase = await createClient();
  await supabase.rpc("log_admin_action", { p_action: action, p_target_type: targetType, p_target_id: targetId, p_details: details });
}
