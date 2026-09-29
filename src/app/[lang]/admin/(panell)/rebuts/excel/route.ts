import writeExcelFile from "write-excel-file/node";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { todayLocal } from "@/lib/activities";
import { logAction } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { lineText } from "@/lib/receipt-format";
import { bankConcept, parsePeriod, periodParam } from "@/lib/receipt-period";
import { encryptedIbans, listReceipts } from "@/lib/receipts";
import { createClient } from "@/lib/supabase/server";

function reveal(encrypted: string | undefined) {
  if (!encrypted) return "";
  try {
    return decrypt(encrypted);
  } catch {
    return "";
  }
}

/** Excel de los recibos de un mes: una hoja para meterlos en el banco y otra con el detalle. */
export async function GET(request: Request, { params }: RouteContext<"/[lang]/admin/rebuts/excel">) {
  const { lang } = await params;
  const notFound = new Response("Not found", { status: 404 });
  if (!isLocale(lang)) return notFound;
  // Solo admins con la verificación en dos pasos hecha; la RLS lo vuelve a comprobar al leer.
  const user = await getCurrentUser();
  if (user?.profile.account_type !== "admin") return notFound;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (claims?.claims.aal !== "aal2") return notFound;

  const period = parsePeriod(new URL(request.url).searchParams.get("mes") ?? "", todayLocal());
  const mes = periodParam(period);
  const dict = await getDictionary(lang);
  const t = dict.admin.receipts;
  const receipts = await listReceipts(period);
  const ibans = await encryptedIbans(receipts.map((r) => r.family_id));
  await logAction("receipts_export", "period", mes);

  const bold = { fontWeight: "bold" as const };
  const euro = "#,##0.00 €";
  const concept = bankConcept(period);

  const bank = [
    [t.colHolder, t.colIban, t.colAmount, t.colConcept, t.colMandate, `${t.colMandate} (data)`, t.colStatus].map((value) => ({ value, ...bold })),
    ...receipts.map((r) => [
      r.holder_name,
      reveal(ibans.get(r.family_id)),
      { value: r.total_cents / 100, format: euro },
      concept,
      r.sepa_reference,
      r.sepa_accepted_at.slice(0, 10),
      dict.receipts.status[r.status],
    ]),
  ];

  const detail = [
    [t.colHolder, t.colDetail, t.colAmount, t.colStatus].map((value) => ({ value, ...bold })),
    ...receipts.flatMap((r) =>
      r.receipt_lines.map((l) => [r.holder_name, lineText(dict.receipts, l), { value: l.amount_cents / 100, format: euro }, dict.receipts.status[r.status]]),
    ),
  ];

  const buffer = await writeExcelFile([
    { data: bank, sheet: t.title, columns: [{ width: 30 }, { width: 30 }, { width: 12 }, { width: 30 }, { width: 20 }, { width: 14 }, { width: 18 }], stickyRowsCount: 1 },
    { data: detail, sheet: t.colDetail, columns: [{ width: 30 }, { width: 50 }, { width: 12 }, { width: 18 }], stickyRowsCount: 1 },
  ]).toBuffer();

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rebuts-${mes}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
