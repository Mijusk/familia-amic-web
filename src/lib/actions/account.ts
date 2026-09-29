"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { formValues, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { isValidPhone, normalizePhone } from "@/lib/validation";
import { fieldErrors } from "./zod-errors";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "required").max(120, "tooLong"),
  phone: z.string().trim().refine(isValidPhone, "invalidPhone"),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const user = await getCurrentUser();
  if (!user) return { status: "error", error: "linkInvalid", values };
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: normalizePhone(parsed.data.phone) })
    .eq("id", user.id);
  if (error) return { status: "error", error: "generic", values };
  revalidatePath("/[lang]/compte", "layout");
  return { status: "success", values };
}
