export const locales = ["ca", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ca";

/** Cookie donde recordamos el idioma elegido con el selector. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
