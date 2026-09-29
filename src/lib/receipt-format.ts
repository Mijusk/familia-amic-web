import type { Dictionary } from "@/i18n/get-dictionary";
import { format } from "@/i18n/format";

type Line = { kind: "quota" | "activitat" | "descompte"; activity_title: string | null; participant_name: string | null; discount_pct: number | null };

/** Texto de una línea del recibo en el idioma de quien lo mira. */
export function lineText(t: Dictionary["receipts"], line: Line) {
  const vars = { activity: line.activity_title ?? "", name: line.participant_name ?? "", pct: line.discount_pct ?? 0 };
  return format(t.lines[line.kind], vars);
}
