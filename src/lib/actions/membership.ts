"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { formValues, type ErrorKey, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { isValidDni, isValidSpanishIban, normalizeDni, normalizeIban } from "@/lib/validation";
import { fieldErrors } from "./zod-errors";

const schema = z.object({
  address: z.string().trim().min(3, "required").max(200, "tooLong"),
  postal_code: z.string().trim().regex(/^\d{5}$/, "invalidPostalCode"),
  city: z.string().trim().min(2, "required").max(100, "tooLong"),
  bank_name: z.string().trim().min(2, "required").max(100, "tooLong"),
  sepa: z.literal("on", "consentRequired"),
});

export async function saveMembership(_prev: FormState, formData: FormData): Promise<FormState> {
  // Se devuelven (también DNI e IBAN) solo para rellenar el formulario si hay errores.
  const values = formValues(formData);
  const user = await getCurrentUser();
  if (!user) return { status: "error", error: "linkInvalid", values };
  if (user.profile.account_type !== "familia") return { status: "error", error: "generic", values };

  const supabase = await createClient();
  const { data: existing } = await supabase.from("memberships").select("family_id").eq("family_id", user.id).maybeSingle();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  const errors: Record<string, ErrorKey> = parsed.success ? {} : fieldErrors(parsed.error);
  // DNI e IBAN solo son obligatorios la primera vez; después, vacío = conservar el guardado.
  const dni = String(formData.get("dni") ?? "").trim();
  const iban = normalizeIban(String(formData.get("iban") ?? ""));
  if (dni ? !isValidDni(dni) : !existing) errors.dni = dni ? "invalidDni" : "required";
  if (iban ? !isValidSpanishIban(iban) : !existing) errors.iban = iban ? "invalidIban" : "required";
  if (!parsed.success || Object.keys(errors).length) return { status: "error", fieldErrors: errors, values };

  const d = parsed.data;
  const row = {
    address: d.address,
    postal_code: d.postal_code,
    city: d.city,
    bank_name: d.bank_name,
    sepa_accepted_at: new Date().toISOString(),
    ...(dni ? { dni_encrypted: encrypt(normalizeDni(dni)) } : {}),
    ...(iban ? { iban_encrypted: encrypt(iban), iban_last4: iban.slice(-4) } : {}),
  };

  const { error } = existing
    ? await supabase.from("memberships").update(row).eq("family_id", user.id)
    : await supabase
        .from("memberships")
        .insert({ ...row, family_id: user.id } as typeof row & { family_id: string; dni_encrypted: string; iban_encrypted: string; iban_last4: string });
  if (error) return { status: "error", error: "generic", values };

  revalidatePath("/[lang]/compte", "layout");
  // Tras guardar no se devuelven DNI ni IBAN al navegador.
  return { status: "success", values: formValues(formData, ["dni", "iban"]) };
}
