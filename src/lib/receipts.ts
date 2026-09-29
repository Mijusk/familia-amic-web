import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type ReceiptStatus = "pendent" | "cobrat" | "retornat" | "anullat";
export const receiptStatuses: ReceiptStatus[] = ["pendent", "cobrat", "retornat", "anullat"];

export type ReceiptLine = {
  id: number;
  position: number;
  kind: "quota" | "activitat" | "descompte";
  activity_title: string | null;
  participant_name: string | null;
  discount_pct: number | null;
  amount_cents: number;
};

export type Receipt = {
  id: string;
  family_id: string;
  period: string;
  total_cents: number;
  status: ReceiptStatus;
  holder_name: string;
  sepa_reference: string;
  sepa_accepted_at: string;
  iban_last4: string;
  receipt_lines: ReceiptLine[];
};

export type BillingSettings = { membership_fee_cents: number | null; multi_activity_discount_pct: number };

const receiptColumns =
  "id, family_id, period, total_cents, status, holder_name, sepa_reference, sepa_accepted_at, iban_last4, " +
  "receipt_lines(id, position, kind, activity_title, participant_name, discount_pct, amount_cents)";

function sortLines(r: Receipt) {
  return { ...r, receipt_lines: [...r.receipt_lines].sort((a, b) => a.position - b.position) };
}

export async function getBillingSettings(): Promise<BillingSettings> {
  const fallback = { membership_fee_cents: null, multi_activity_discount_pct: 0 };
  if (!getSupabaseEnv()) return fallback;
  const supabase = await createClient();
  const { data } = await supabase
    .from("billing_settings")
    .select("membership_fee_cents, multi_activity_discount_pct")
    .maybeSingle<BillingSettings>();
  return data ?? fallback;
}

/** Recibos de un mes (panel). La RLS solo los devuelve a un admin con la verificación en dos pasos. */
export async function listReceipts(period: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receipts")
    .select(receiptColumns)
    .eq("period", period)
    .order("holder_name")
    .returns<Receipt[]>();
  return (data ?? []).map(sortLines);
}

/** Recibos de la familia con sesión (su cuenta). */
export async function listMyReceipts(familyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("receipts")
    .select(receiptColumns)
    .eq("family_id", familyId)
    .neq("status", "anullat")
    .order("period", { ascending: false })
    .returns<Receipt[]>();
  return (data ?? []).map(sortLines);
}

/** IBAN cifrado de las familias de la lista, para descifrarlo solo en el servidor del panel. */
export async function encryptedIbans(familyIds: string[]) {
  if (familyIds.length === 0) return new Map<string, string>();
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("family_id, iban_encrypted")
    .in("family_id", familyIds)
    .returns<{ family_id: string; iban_encrypted: string }[]>();
  return new Map((data ?? []).map((m) => [m.family_id, m.iban_encrypted]));
}

/**
 * Familias con la ficha aún pendiente y alguna actividad de pago ese mes:
 * no entran en los recibos hasta que un admin las activa.
 */
export async function pendingFamiliesWithActivity(period: string, periodEnd: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("family_id, starts_on, ends_on, is_trial, confirmed_at, activities!inner(payment_method, price_cents), profiles!inner(full_name, memberships!inner(status))")
    .not("confirmed_at", "is", null)
    .eq("is_trial", false)
    .eq("activities.payment_method", "rebut")
    .eq("profiles.memberships.status", "pendent")
    .lte("starts_on", periodEnd)
    .or(`ends_on.is.null,ends_on.gte.${period}`)
    .returns<{ family_id: string; profiles: { full_name: string } }[]>();
  const names = new Map<string, string>();
  for (const e of data ?? []) names.set(e.family_id, e.profiles.full_name);
  return [...names].map(([id, name]) => ({ id, name }));
}
