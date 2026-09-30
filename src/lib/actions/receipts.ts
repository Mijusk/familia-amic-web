"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getCurrentUser } from "@/lib/auth";
import { formValues, type FormState } from "@/lib/forms";
import { parsePeriod, periodParam } from "@/lib/receipt-period";
import { receiptStatuses, type ReceiptStatus } from "@/lib/receipts";
import { createClient } from "@/lib/supabase/server";
import { todayLocal } from "@/lib/activities";
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

function periodOf(formData: FormData) {
  return parsePeriod(String(formData.get("mes") ?? ""), todayLocal());
}

export async function generateReceipts(formData: FormData) {
  const lang = langOf(formData);
  const period = periodOf(formData);
  let query = "r=error";
  if (await isAdmin()) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_generate_receipts", { p_period: period });
    const row = ((data ?? []) as { created: number; skipped: number }[])[0];
    if (!error && row) query = `r=generats&n=${row.created}&k=${row.skipped}`;
    else console.error("[generateReceipts]", error?.message);
    revalidatePath(`/${lang}/admin`, "layout");
  }
  redirect(`/${lang}/admin/rebuts?mes=${periodParam(period)}&${query}`);
}

export async function setReceiptStatus(formData: FormData) {
  const lang = langOf(formData);
  const period = periodOf(formData);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ReceiptStatus;
  let result = "error";
  if ((await isAdmin()) && /^[0-9a-f-]{36}$/i.test(id) && receiptStatuses.includes(status)) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_set_receipt_status", { p_receipt_id: id, p_status: status });
    if (!error) result = "estat";
    else console.error("[setReceiptStatus]", error.message);
    revalidatePath(`/${lang}/admin`, "layout");
  }
  redirect(`/${lang}/admin/rebuts?mes=${periodParam(period)}&r=${result}#rebut-${id}`);
}

export async function markPeriodPaid(formData: FormData) {
  const lang = langOf(formData);
  const period = periodOf(formData);
  let query = "r=error";
  if (await isAdmin()) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_mark_period_paid", { p_period: period });
    if (!error) query = `r=cobrats&n=${Number(data ?? 0)}`;
    revalidatePath(`/${lang}/admin`, "layout");
  }
  redirect(`/${lang}/admin/rebuts?mes=${periodParam(period)}&${query}`);
}

// Importe con signo: "-15" es un descuento de 15 €, "8,50" un cargo de 8,50 €.
const signedEuros = z
  .string()
  .trim()
  .transform((v) => v.replace(",", ".").replace(/\s|€/g, ""))
  .pipe(z.string().regex(/^[-+]?\d{1,4}(\.\d{1,2})?$/, "invalidPrice"))
  .transform((v) => Math.round(Number(v) * 100))
  .refine((v) => v !== 0, "invalidPrice");

const adjustmentSchema = z.object({
  family_id: z.string().regex(/^[0-9a-f-]{36}$/i, "required"),
  concept: z.string().trim().min(2, "required").max(120, "tooLong"),
  amount: z.preprocess((v) => v ?? "", signedEuros),
});

/** Si el mes ya tiene recibos, se recalculan para que el ajuste entre (los cobrados no se tocan). */
async function refreshPeriod(supabase: Awaited<ReturnType<typeof createClient>>, period: string) {
  const { count } = await supabase.from("receipts").select("id", { count: "exact", head: true }).eq("period", period);
  if (count) await supabase.rpc("admin_generate_receipts", { p_period: period });
}

export async function addReceiptAdjustment(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const lang = langOf(formData);
  const period = periodOf(formData);
  if (!(await isAdmin())) return { status: "error", error: "generic", values };
  const parsed = adjustmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_add_receipt_adjustment", {
    p_family_id: parsed.data.family_id,
    p_period: period,
    p_concept: parsed.data.concept,
    p_amount_cents: parsed.data.amount,
  });
  if (error) {
    if (error.message.includes("receipt_closed")) return { status: "error", error: "receiptClosed", values };
    console.error("[addReceiptAdjustment]", error.message);
    return { status: "error", error: "generic", values };
  }
  await refreshPeriod(supabase, period);
  revalidatePath(`/${lang}/admin`, "layout");
  return { status: "success" };
}

export async function deleteReceiptAdjustment(formData: FormData) {
  const lang = langOf(formData);
  const period = periodOf(formData);
  const id = String(formData.get("id") ?? "");
  let result = "error";
  if ((await isAdmin()) && /^[0-9a-f-]{36}$/i.test(id)) {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_delete_receipt_adjustment", { p_id: id });
    if (!error) {
      result = "ajust-esborrat";
      await refreshPeriod(supabase, period);
    } else result = error.message.includes("receipt_closed") ? "tancat" : "error";
    revalidatePath(`/${lang}/admin`, "layout");
  }
  redirect(`/${lang}/admin/rebuts?mes=${periodParam(period)}&r=${result}#ajustos`);
}

const euros = z
  .string()
  .trim()
  .transform((v) => v.replace(",", "."))
  .pipe(z.union([z.literal(""), z.string().regex(/^\d{1,4}(\.\d{1,2})?$/, "invalidPrice")]))
  .transform((v) => (v === "" ? null : Math.round(Number(v) * 100)));

const settingsSchema = z.object({
  membership_fee: z.preprocess((v) => v ?? "", euros),
  discount_pct: z.preprocess(
    (v) => v ?? "",
    z
      .string()
      .trim()
      .transform((v) => (v === "" ? "0" : v))
      .pipe(z.string().regex(/^\d{1,3}$/, "invalidPercent"))
      .transform(Number)
      .pipe(z.number().max(100, "invalidPercent")),
  ),
});

export async function saveBillingSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const lang = langOf(formData);
  if (!(await isAdmin())) return { status: "error", error: "generic", values };
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: FormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] = issue.message === "invalidPercent" ? "invalidPercent" : "invalidPrice";
    }
    return { status: "error", fieldErrors, values };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_billing_settings", {
    p_membership_fee_cents: parsed.data.membership_fee,
    p_discount_pct: parsed.data.discount_pct,
  });
  if (error) {
    console.error("[saveBillingSettings]", error.message);
    return { status: "error", error: "generic", values };
  }
  revalidatePath(`/${lang}`, "layout");
  return { status: "success", values };
}
