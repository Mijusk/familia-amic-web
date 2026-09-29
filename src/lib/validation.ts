/** Validaciones de documentos españoles. Sin dependencias para poder usarse en cliente y servidor. */

const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

export function normalizeDni(value: string) {
  return value.toUpperCase().replace(/[\s-]/g, "");
}

/** DNI (12345678Z) o NIE (X1234567L) con letra de control correcta. */
export function isValidDni(value: string) {
  const dni = normalizeDni(value);
  const match = /^([XYZ]|\d)(\d{7})([A-Z])$/.exec(dni);
  if (!match) return false;
  const first = { X: "0", Y: "1", Z: "2" }[match[1]] ?? match[1];
  const number = Number(first + match[2]);
  return DNI_LETTERS[number % 23] === match[3];
}

export function normalizeIban(value: string) {
  return value.toUpperCase().replace(/[\s-]/g, "");
}

/** IBAN español (ES + 22 dígitos) con dígitos de control válidos (ISO 13616, módulo 97). */
export function isValidSpanishIban(value: string) {
  const iban = normalizeIban(value);
  if (!/^ES\d{22}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (const digit of numeric) remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}

/** ES12 **** **** **** **** 1234: lo único que se muestra del IBAN una vez guardado. */
export function maskIban(last4: string) {
  return `ES•• •••• •••• •••• •••• ${last4}`;
}

export function normalizePhone(value: string) {
  return value.replace(/[\s.-]/g, "");
}

export function isValidPhone(value: string) {
  return /^\+?\d{9,15}$/.test(normalizePhone(value));
}
