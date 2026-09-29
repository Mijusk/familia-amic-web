import type { z } from "zod";
import type { ErrorKey } from "@/lib/forms";

/** Recoge los errores de zod como { campo: clave-de-error }; los mensajes de los esquemas son claves del diccionario. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, ErrorKey> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    out[field] ??= issue.message as ErrorKey;
  }
  return out;
}
