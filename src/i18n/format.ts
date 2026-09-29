/** Sustituye {clave} en un texto del diccionario: format("Hola, {name}", { name: "Anna" }). */
export function format(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/** Fecha ISO (2026-09-29) en formato local: 29/9/2026. */
export function formatDate(lang: string, iso: string) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "ca-ES", { dateStyle: "long" }).format(new Date(`${iso}T00:00:00`));
}
