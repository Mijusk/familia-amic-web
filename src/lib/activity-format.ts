import type { Dictionary } from "@/i18n/get-dictionary";
import { format, formatDate } from "@/i18n/format";

type T = Dictionary["activities"];

type Schedulable = {
  kind: "recurrent" | "puntual";
  weekday: number | null;
  start_time: string | null;
  end_time: string | null;
  starts_on: string;
  ends_on: string | null;
};

type Priced = { kind: "recurrent" | "puntual"; price_cents: number | null; payment_method: string };

export function formatPrice(lang: string, cents: number) {
  return new Intl.NumberFormat(lang === "es" ? "es-ES" : "ca-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** "Cada dijous, de 18:15 a 19:45" o la fecha del evento. */
export function scheduleText(lang: string, t: T, a: Schedulable) {
  if (a.kind === "recurrent" && a.weekday && a.start_time && a.end_time) {
    return format(t.everyWeekday, {
      weekday: t.weekdays[a.weekday - 1].toLowerCase(),
      start: a.start_time.slice(0, 5),
      end: a.end_time.slice(0, 5),
    });
  }
  const start = formatDate(lang, a.starts_on);
  return a.ends_on && a.ends_on !== a.starts_on ? `${start} – ${formatDate(lang, a.ends_on)}` : start;
}

export function priceText(lang: string, t: T, a: Priced) {
  if (a.payment_method === "gratuit" || !a.price_cents) return t.free;
  return format(a.kind === "recurrent" ? t.pricePerMonth : t.pricePerEvent, { price: formatPrice(lang, a.price_cents) });
}

export function spotsText(t: T, free: number | null) {
  if (free == null) return t.noLimit;
  if (free === 0) return t.full;
  return free === 1 ? t.oneSpotLeft : format(t.spotsLeft, { n: free });
}
