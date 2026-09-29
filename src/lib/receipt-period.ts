/** Meses de los recibos: "2026-10" en la URL, "2026-10-01" en la base de datos. */

export function parsePeriod(value: string | string[] | undefined, today: string) {
  const raw = typeof value === "string" ? value : "";
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(raw);
  if (m && Number(m[1]) >= 2020 && Number(m[1]) <= 2100) return `${m[1]}-${m[2]}-01`;
  return `${today.slice(0, 7)}-01`;
}

/** "2026-10-01" → "2026-10" */
export function periodParam(period: string) {
  return period.slice(0, 7);
}

export function shiftPeriod(period: string, months: number) {
  const [y, m] = period.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}-01`;
}

/** "octubre del 2026" / "octubre de 2026"; con mayúscula inicial para títulos. */
export function periodLabel(lang: string, period: string, { title = false } = {}) {
  const label = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "ca-ES", { month: "long", year: "numeric" }).format(
    new Date(`${period}T12:00:00`),
  );
  return title ? label.charAt(0).toUpperCase() + label.slice(1) : label;
}

const caMonths = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"];

/** Concepto que se escribe en el banco: en catalán, igual para todas las familias y sin depender del navegador. */
export function bankConcept(period: string) {
  const [y, m] = period.split("-").map(Number);
  return `Família Amic - ${caMonths[m - 1]} ${y}`;
}

/** Importe escrito como lo pide un formulario del banco: 147,00 */
export function amountForBank(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** IBAN en grupos de cuatro para leerlo y copiarlo sin errores. */
export function groupIban(iban: string) {
  return iban.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}
