import type { Dictionary } from "@/i18n/get-dictionary";

export type ErrorKey = keyof Dictionary["errors"];

/** Estado que devuelven las Server Actions de formularios a useActionState. */
export type FormState = {
  status: "idle" | "error" | "success";
  error?: ErrorKey;
  fieldErrors?: Partial<Record<string, ErrorKey>>;
  /** Lo que escribió la persona, para no vaciar el formulario si hay errores. */
  values?: Record<string, string>;
  /** Dato extra para el mensaje de éxito (p. ej. el email al que se envió el enlace). */
  detail?: string;
};

export const initialFormState: FormState = { status: "idle" };

/** Valores de texto del formulario, sin contraseñas ni ficheros. */
export function formValues(formData: FormData, omit: string[] = []) {
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string" && !omit.includes(key) && !key.startsWith("$")) values[key] = value;
  });
  return values;
}
