import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type Category = { id: string; slug: string; name_ca: string; name_es: string; sort_order: number };

export type Activity = {
  id: string;
  slug: string;
  lang: "ca" | "es";
  title: string;
  summary: string;
  description: string;
  image_url: string | null;
  category_id: string | null;
  kind: "recurrent" | "puntual";
  weekday: number | null;
  start_time: string | null;
  end_time: string | null;
  starts_on: string;
  ends_on: string | null;
  location: string;
  capacity: number | null;
  price_cents: number | null;
  payment_method: "rebut" | "transferencia" | "gratuit";
  payment_notes: string;
  enrollment_open: boolean;
  status: "esborrany" | "publicada" | "cancellada" | "finalitzada";
};

export type Spots = { occupied: number; queued: number };

export type Enrollment = {
  id: string;
  activity_id: string;
  participant_id: string;
  status: "confirmada" | "cua" | "baixa";
  is_trial: boolean;
  trial_date: string | null;
  auto_renew: boolean;
  starts_on: string;
  ends_on: string | null;
  cancelled_at: string | null;
  created_at: string;
};

const activityColumns =
  "id, slug, lang, title, summary, description, image_url, category_id, kind, weekday, start_time, end_time, starts_on, ends_on, location, capacity, price_cents, payment_method, payment_notes, enrollment_open, status";

/** Hoy en Barcelona, como 2026-09-29. */
export function todayLocal(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(now);
}

export function monthEnd(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

export async function listCategories() {
  // Sin Supabase configurado la web arranca igual, con las listas vacías.
  if (!getSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, slug, name_ca, name_es, sort_order").order("sort_order").order("name_ca").returns<Category[]>();
  return data ?? [];
}

/** Actividades publicadas que aún no han terminado, las semanales primero. */
export async function listActivities(categoryId?: string) {
  if (!getSupabaseEnv()) return [];
  const supabase = await createClient();
  const today = todayLocal();
  let query = supabase
    .from("activities")
    .select(activityColumns)
    .eq("status", "publicada")
    .or(`ends_on.is.null,ends_on.gte.${today}`)
    .order("kind", { ascending: false })
    .order("starts_on");
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query.returns<Activity[]>();
  // Un evento puntual sin fecha de fin termina el mismo día.
  return (data ?? []).filter((a) => a.kind === "recurrent" || (a.ends_on ?? a.starts_on) >= today);
}

export async function getActivity(slug: string) {
  if (!/^[a-z0-9-]{2,80}$/.test(slug) || !getSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("activities").select(activityColumns).eq("slug", slug).maybeSingle<Activity>();
  return data;
}

export async function getSpots() {
  if (!getSupabaseEnv()) return new Map<string, Spots>();
  const supabase = await createClient();
  const { data } = await supabase.rpc("activity_spots");
  const rows = (data ?? []) as { activity_id: string; occupied: number; queued: number }[];
  return new Map<string, Spots>(rows.map((s) => [s.activity_id, { occupied: s.occupied, queued: s.queued }]));
}

export function freeSpots(activity: Pick<Activity, "capacity">, spots?: Spots) {
  if (activity.capacity == null) return null;
  return Math.max(activity.capacity - (spots?.occupied ?? 0), 0);
}

/** Inscripciones de la familia con sesión (RLS filtra por familia). */
export async function listEnrollments(activityId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("enrollments")
    .select("id, activity_id, participant_id, status, is_trial, trial_date, auto_renew, starts_on, ends_on, cancelled_at, created_at")
    .order("created_at", { ascending: false });
  if (activityId) query = query.eq("activity_id", activityId);
  const { data } = await query.returns<Enrollment[]>();
  return data ?? [];
}

export async function getQueuePositions() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_queue_positions");
  const rows = (data ?? []) as { enrollment_id: string; queue_position: number }[];
  return new Map<string, number>(rows.map((q) => [q.enrollment_id, q.queue_position]));
}

/** Una inscripción cuenta como vigente si no es baja y no ha pasado su último día. */
export function isCurrent(e: Pick<Enrollment, "status" | "ends_on">, today = todayLocal()) {
  return e.status !== "baixa" && (e.ends_on == null || e.ends_on >= today);
}

/** Próximas fechas en que se hace la actividad, para elegir el día de la prueba. */
export function upcomingSessions(activity: Activity, count = 4, today = todayLocal()) {
  if (activity.kind === "puntual") return activity.starts_on >= today ? [activity.starts_on] : [];
  const dates: string[] = [];
  const start = activity.starts_on > today ? activity.starts_on : today;
  const d = new Date(`${start}T12:00:00Z`);
  for (let i = 0; i < 60 && dates.length < count; i++) {
    const iso = d.toISOString().slice(0, 10);
    const isoWeekday = ((d.getUTCDay() + 6) % 7) + 1;
    if (isoWeekday === activity.weekday && (!activity.ends_on || iso <= activity.ends_on)) dates.push(iso);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dates;
}

export type EnrollmentWithNames = Enrollment & {
  activities: Pick<Activity, "slug" | "title" | "lang" | "kind" | "weekday" | "start_time" | "end_time" | "starts_on" | "ends_on"> | null;
  participants: { first_name: string; last_name: string } | null;
};

/** Inscripciones de la familia con el nombre de la actividad y del participante. */
export async function listMyEnrollments() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select(
      "id, activity_id, participant_id, status, is_trial, trial_date, auto_renew, starts_on, ends_on, cancelled_at, created_at, " +
        "activities(slug, title, lang, kind, weekday, start_time, end_time, starts_on, ends_on), participants(first_name, last_name)",
    )
    .order("created_at", { ascending: false })
    .returns<EnrollmentWithNames[]>();
  return data ?? [];
}
