import "server-only";
import { decrypt } from "@/lib/crypto";
import { createClient } from "@/lib/supabase/server";

export type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  relationship: "familiar" | "alumne" | "pacient" | "amic";
  disability_pct: number | null;
  has_dependency: boolean;
  dependency_grade: number | null;
  allergies: string | null;
  medical_notes: string | null;
  image_consent: boolean;
  dni_encrypted: string;
};

export type Membership = {
  address: string;
  postal_code: string;
  city: string;
  bank_name: string;
  iban_last4: string;
  dni_encrypted: string;
  sepa_reference: string;
  status: "pendent" | "actiu" | "baixa";
  member_since: string | null;
};

const participantColumns =
  "id, first_name, last_name, birth_date, relationship, disability_pct, has_dependency, dependency_grade, allergies, medical_notes, image_consent, dni_encrypted";

/** Participantes de la familia con sesión (RLS filtra por familia). */
export async function listParticipants() {
  const supabase = await createClient();
  const { data } = await supabase.from("participants").select(participantColumns).order("created_at").returns<Participant[]>();
  return data ?? [];
}

export async function getParticipant(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("participants").select(participantColumns).eq("id", id).maybeSingle<Participant>();
  return data;
}

export async function getMembership(familyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("address, postal_code, city, bank_name, iban_last4, dni_encrypted, sepa_reference, status, member_since")
    .eq("family_id", familyId)
    .maybeSingle<Membership>();
  return data;
}

/** Muestra solo el final de un DNI guardado: •••••678Z. */
export function maskedDni(encrypted: string) {
  try {
    return `•••••${decrypt(encrypted).slice(-4)}`;
  } catch {
    return "•••••";
  }
}

export function ageFrom(birthDate: string, today = new Date()) {
  const b = new Date(`${birthDate}T00:00:00`);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}
