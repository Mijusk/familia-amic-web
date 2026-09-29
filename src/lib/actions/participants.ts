"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getCurrentUser } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { formValues, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { isValidDni, normalizeDni } from "@/lib/validation";
import { fieldErrors } from "./zod-errors";

const optionalText = (max: number) =>
  z.string().trim().max(max, "tooLong").transform((v) => v || null);

const schema = z
  .object({
    first_name: z.string().trim().min(1, "required").max(80, "tooLong"),
    last_name: z.string().trim().min(1, "required").max(120, "tooLong"),
    dni: z.string().trim(),
    birth_date: z.iso.date("invalidDate").refine((d) => d > "1900-01-01" && d <= new Date().toISOString().slice(0, 10), "invalidDate"),
    relationship: z.enum(["familiar", "alumne", "pacient", "amic"], "required"),
    disability_pct: z
      .string()
      .trim()
      .refine((v) => v === "" || (/^\d{1,3}$/.test(v) && Number(v) <= 100), "invalidNumber")
      .transform((v) => (v === "" ? null : Number(v))),
    has_dependency: z.enum(["yes", "no"], "required"),
    dependency_grade: z.string().optional(),
    allergies: optionalText(1000),
    medical_notes: optionalText(2000),
    guardian: z.literal("on", "consentRequired"),
    health_consent: z.literal("on", "consentRequired"),
  })
  .superRefine((d, ctx) => {
    if (d.has_dependency === "yes" && !["1", "2", "3"].includes(d.dependency_grade ?? "")) {
      ctx.addIssue({ code: "custom", message: "required", path: ["dependency_grade"] });
    }
  });

export async function saveParticipant(_prev: FormState, formData: FormData): Promise<FormState> {
  // Incluye el DNI para no tener que reescribirlo si hay errores (nunca se devuelve tras guardar).
  const values = formValues(formData);
  const langRaw = String(formData.get("lang") ?? "");
  const lang = isLocale(langRaw) ? langRaw : defaultLocale;
  const id = String(formData.get("id") ?? "") || null;

  const user = await getCurrentUser();
  if (!user) return { status: "error", error: "linkInvalid", values };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  // Al editar, el DNI puede dejarse vacío para conservar el guardado.
  const dni = String(formData.get("dni") ?? "").trim();
  if (dni ? !isValidDni(dni) : !id) errors.dni = dni ? "invalidDni" : "required";
  if (!parsed.success || Object.keys(errors).length) return { status: "error", fieldErrors: errors, values };

  const d = parsed.data;
  const now = new Date().toISOString();
  const row = {
    first_name: d.first_name,
    last_name: d.last_name,
    birth_date: d.birth_date,
    relationship: d.relationship,
    disability_pct: d.disability_pct,
    has_dependency: d.has_dependency === "yes",
    dependency_grade: d.has_dependency === "yes" ? Number(d.dependency_grade) : null,
    allergies: d.allergies,
    medical_notes: d.medical_notes,
    guardian_authorized_at: now,
    health_consent_at: now,
    ...(dni ? { dni_encrypted: encrypt(normalizeDni(dni)) } : {}),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("participants").update(row).eq("id", id)
    : await supabase.from("participants").insert(row as typeof row & { dni_encrypted: string });
  if (error) return { status: "error", error: "generic", values };

  revalidatePath("/[lang]/compte", "layout");
  redirect(`/${lang}/compte/familia`);
}

export async function deleteParticipant(formData: FormData) {
  const langRaw = String(formData.get("lang") ?? "");
  const lang = isLocale(langRaw) ? langRaw : defaultLocale;
  const id = String(formData.get("id") ?? "");
  const user = await getCurrentUser();
  if (user && id) {
    const supabase = await createClient();
    // RLS garantiza que solo se borra si es de esta familia. Con inscripciones no se puede borrar (se guardan para los recibos).
    const { error } = await supabase.from("participants").delete().eq("id", id);
    if (error?.code === "23503") redirect(`/${lang}/compte/familia/${id}?error=inUse`);
    revalidatePath("/[lang]/compte", "layout");
  }
  redirect(`/${lang}/compte/familia`);
}
