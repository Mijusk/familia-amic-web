import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Noticias, recursos y fotos. Las lecturas públicas pasan por la RLS: solo devuelven lo publicado. */

export type News = {
  id: string;
  slug: string;
  lang: "ca" | "es";
  title: string;
  summary: string;
  body: string;
  image_url: string | null;
  activity_id: string | null;
  published_on: string;
  status: "esborrany" | "publicada";
};

export type ResourceCategory = "legals" | "educacio" | "salut";
export const resourceCategories: ResourceCategory[] = ["legals", "educacio", "salut"];

export type Resource = {
  id: string;
  slug: string;
  lang: "ca" | "es";
  category: ResourceCategory;
  title: string;
  summary: string;
  body: string;
  external_url: string | null;
  position: number;
  status: "esborrany" | "publicada";
};

export type Photo = { id: string; activity_id: string; path: string; caption: string; position: number };

const newsColumns = "id, slug, lang, title, summary, body, image_url, activity_id, published_on, status";
const resourceColumns = "id, slug, lang, category, title, summary, body, external_url, position, status";

export async function listNews({ limit, activityId }: { limit?: number; activityId?: string } = {}) {
  if (!getSupabaseEnv()) return [];
  const supabase = await createClient();
  let query = supabase.from("news").select(newsColumns).eq("status", "publicada").order("published_on", { ascending: false });
  if (activityId) query = query.eq("activity_id", activityId);
  if (limit) query = query.limit(limit);
  const { data } = await query.returns<News[]>();
  return data ?? [];
}

export async function getNews(slug: string) {
  if (!getSupabaseEnv() || !/^[a-z0-9-]{2,80}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("news").select(newsColumns).eq("slug", slug).eq("status", "publicada").maybeSingle<News>();
  return data;
}

export async function listResources(category?: ResourceCategory) {
  if (!getSupabaseEnv()) return [];
  const supabase = await createClient();
  let query = supabase.from("resources").select(resourceColumns).eq("status", "publicada").order("category").order("position").order("title");
  if (category) query = query.eq("category", category);
  const { data } = await query.returns<Resource[]>();
  return data ?? [];
}

export async function getResource(slug: string) {
  if (!getSupabaseEnv() || !/^[a-z0-9-]{2,80}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("resources").select(resourceColumns).eq("slug", slug).eq("status", "publicada").maybeSingle<Resource>();
  return data;
}

export async function listPhotos(activityId: string) {
  if (!getSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_photos")
    .select("id, activity_id, path, caption, position")
    .eq("activity_id", activityId)
    .order("position")
    .order("created_at")
    .returns<Photo[]>();
  return data ?? [];
}

/** Dirección pública de una foto del bucket "fotos". */
export function photoUrl(path: string) {
  const env = getSupabaseEnv();
  return env ? `${env.url}/storage/v1/object/public/fotos/${path.split("/").map(encodeURIComponent).join("/")}` : "";
}

// --- Panel -----------------------------------------------------------------

export async function listAllNews() {
  const supabase = await createClient();
  const { data } = await supabase.from("news").select(newsColumns).order("published_on", { ascending: false }).returns<News[]>();
  return data ?? [];
}

export async function getNewsById(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("news").select(newsColumns).eq("id", id).maybeSingle<News>();
  return data;
}

export async function listAllResources() {
  const supabase = await createClient();
  const { data } = await supabase.from("resources").select(resourceColumns).order("category").order("position").order("title").returns<Resource[]>();
  return data ?? [];
}

export async function getResourceById(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("resources").select(resourceColumns).eq("id", id).maybeSingle<Resource>();
  return data;
}

export type ContactMessage = { id: string; name: string; email: string; phone: string; message: string; locale: string; handled_at: string | null; created_at: string };

export async function listContactMessages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, message, locale, handled_at, created_at")
    .order("created_at", { ascending: false })
    .limit(300)
    .returns<ContactMessage[]>();
  return data ?? [];
}

export type VolunteerStatus = "nova" | "contactada" | "activa" | "arxivada";
export const volunteerStatuses: VolunteerStatus[] = ["nova", "contactada", "activa", "arxivada"];

export type VolunteerApplication = {
  profile_id: string;
  areas: string[];
  availability: string;
  experience: string;
  motivation: string;
  status: VolunteerStatus;
  created_at: string;
};

const volunteerColumns = "profile_id, areas, availability, experience, motivation, status, created_at";

/** La solicitud de la cuenta de voluntario que ha entrado (o null si aún no la ha enviado). */
export async function getMyVolunteerApplication(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("volunteer_applications").select(volunteerColumns).eq("profile_id", profileId).maybeSingle<VolunteerApplication>();
  return data;
}

export async function listVolunteerApplications() {
  const supabase = await createClient();
  const { data } = await supabase.from("volunteer_applications").select(volunteerColumns).order("created_at", { ascending: false }).returns<VolunteerApplication[]>();
  return data ?? [];
}

/** Título y enlace de la actividad vinculada a una noticia (solo si es pública). */
export async function getLinkedActivity(id: string) {
  if (!getSupabaseEnv() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select("slug, title, lang")
    .eq("id", id)
    .in("status", ["publicada", "finalitzada"])
    .maybeSingle<{ slug: string; title: string; lang: string }>();
  return data;
}
