import Link from "next/link";
import { format, formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { monthEnd, todayLocal } from "@/lib/activities";
import { formatPrice } from "@/lib/activity-format";
import { generateReceipts, markPeriodPaid, setReceiptStatus } from "@/lib/actions/receipts";
import { logAction } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { amountForBank, bankConcept, groupIban, parsePeriod, periodLabel, periodParam, shiftPeriod } from "@/lib/receipt-period";
import { lineText } from "@/lib/receipt-format";
import { encryptedIbans, getBillingSettings, listReceipts, pendingFamiliesWithActivity, receiptStatuses, type Receipt } from "@/lib/receipts";
import { BillingSettingsForm } from "@/components/admin/billing-settings-form";
import { CopyButton } from "@/components/admin/copy-button";
import { ConfirmForm } from "@/components/confirm-form";
import { Alert } from "@/components/form";
import { PageHeader } from "@/components/page-header";

function reveal(encrypted: string | undefined) {
  if (!encrypted) return "";
  try {
    return decrypt(encrypted);
  } catch {
    return "";
  }
}

const badge: Record<Receipt["status"], string> = {
  pendent: "bg-warm-soft text-warm",
  cobrat: "bg-accent-soft text-accent",
  retornat: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  anullat: "bg-background text-muted",
};

export default async function Receipts({ params, searchParams }: PageProps<"/[lang]/admin/rebuts">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/rebuts`);
  const t = dict.admin.receipts;
  const sp = await searchParams;
  const period = parsePeriod(sp.mes, todayLocal());
  const mes = periodParam(period);
  const month = periodLabel(lang, period);

  const [receipts, settings, pendingFamilies] = await Promise.all([
    listReceipts(period),
    getBillingSettings(),
    pendingFamiliesWithActivity(period, monthEnd(period)),
  ]);
  const ibans = await encryptedIbans(receipts.map((r) => r.family_id));
  // Ver la lista con los IBAN completos queda registrado.
  if (receipts.length > 0) await logAction("receipts_view", "period", mes);

  const active = receipts.filter((r) => r.status !== "anullat");
  const pending = receipts.filter((r) => r.status === "pendent");
  const sum = (rs: Receipt[]) => formatPrice(lang, rs.reduce((n, r) => n + r.total_cents, 0));
  const concept = bankConcept(period);

  const message =
    sp.r === "generats"
      ? Number(sp.k) > 0
        ? format(t.generatedKept, { n: Number(sp.n), k: Number(sp.k) })
        : format(t.generated, { n: Number(sp.n) })
      : sp.r === "cobrats"
        ? format(t.paidDone, { n: Number(sp.n) })
        : sp.r === "estat"
          ? t.statusDone
          : null;

  const monthLink = (offset: number, label: string) => (
    <Link href={`/${lang}/admin/rebuts?mes=${periodParam(shiftPeriod(period, offset))}`} className="font-semibold underline underline-offset-4">
      {label}
    </Link>
  );

  return (
    <div className="space-y-10">
      <PageHeader title={t.title} lead={t.lead} />

      <nav aria-label={t.title} className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {monthLink(-1, `← ${t.prev}`)}
        <p className="font-display text-2xl font-extrabold" aria-live="polite">
          {periodLabel(lang, period, { title: true })}
        </p>
        {monthLink(1, `${t.next} →`)}
      </nav>

      {message && <Alert tone="success">{message}</Alert>}
      {sp.r === "error" && <Alert tone="error">{dict.errors.generic}</Alert>}
      {settings.membership_fee_cents == null && <Alert tone="info">{t.feeMissing}</Alert>}
      {pendingFamilies.length > 0 && (
        <div className="rounded-md border-l-4 border-warm bg-warm-soft px-4 py-3">
          <p>{t.pendingFamilies}</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {pendingFamilies.map((f) => (
              <li key={f.id}>
                <Link href={`/${lang}/admin/families/${f.id}`} className="font-semibold underline underline-offset-4">
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="space-y-3">
        <form action={generateReceipts}>
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="mes" value={mes} />
          <button type="submit" className="min-h-11 rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90">
            {receipts.length > 0 ? t.regenerate : format(t.generate, { month })}
          </button>
        </form>
        <p className="max-w-3xl text-sm text-muted">{t.generateHelp}</p>
      </section>

      {receipts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="font-semibold">{format(t.summary, { count: active.length, total: sum(active) })}</p>
            <p className="text-muted">{format(t.summaryPending, { count: pending.length, total: sum(pending) })}</p>
            <a href={`/${lang}/admin/rebuts/excel?mes=${mes}`} className="font-semibold text-accent underline underline-offset-4">
              {t.excel}
            </a>
          </div>
          <p className="rounded-md border-l-4 border-warm bg-warm-soft px-4 py-3 text-sm">{t.sensitiveNote}</p>

          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[64rem] text-left">
              <thead className="border-b border-line text-sm text-muted">
                <tr>
                  <th className="p-3 font-semibold">{t.colHolder}</th>
                  <th className="p-3 font-semibold">{t.colIban}</th>
                  <th className="p-3 font-semibold">{t.colAmount}</th>
                  <th className="p-3 font-semibold">{t.colMandate}</th>
                  <th className="p-3 font-semibold">{t.colDetail}</th>
                  <th className="p-3 font-semibold">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => {
                  const iban = reveal(ibans.get(r.family_id));
                  return (
                    <tr key={r.id} id={`rebut-${r.id}`} className="border-b border-line align-top last:border-0">
                      <td className="p-3">
                        <Link href={`/${lang}/admin/families/${r.family_id}`} className="font-semibold underline underline-offset-4">
                          {r.holder_name}
                        </Link>
                        <CopyButton value={r.holder_name} label={t.copy} done={t.copied} />
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-[0.95rem]">
                        {iban ? (
                          <>
                            {groupIban(iban)}
                            <CopyButton value={iban.replace(/\s+/g, "")} label={t.copy} done={t.copied} />
                          </>
                        ) : (
                          `···· ${r.iban_last4}`
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-semibold">{formatPrice(lang, r.total_cents)}</span>
                        <CopyButton value={amountForBank(r.total_cents)} label={t.copy} done={t.copied} />
                      </td>
                      <td className="p-3 text-[0.95rem]">
                        <span className="block font-mono">
                          {r.sepa_reference}
                          <CopyButton value={r.sepa_reference} label={t.copy} done={t.copied} />
                        </span>
                        <span className="text-muted">{format(t.mandateDate, { date: formatDate(lang, r.sepa_accepted_at.slice(0, 10)) })}</span>
                      </td>
                      <td className="p-3 text-[0.95rem]">
                        <ul>
                          {r.receipt_lines.map((l) => (
                            <li key={l.id} className="flex justify-between gap-4">
                              <span>{lineText(dict.receipts, l)}</span>
                              <span className="whitespace-nowrap">{formatPrice(lang, l.amount_cents)}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-sm font-semibold ${badge[r.status]}`}>{dict.receipts.status[r.status]}</span>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm">
                          <span className="text-muted">{t.setStatus}</span>
                          {receiptStatuses
                            .filter((s) => s !== r.status)
                            .map((s) => (
                              <form key={s} action={setReceiptStatus}>
                                <input type="hidden" name="lang" value={lang} />
                                <input type="hidden" name="mes" value={mes} />
                                <input type="hidden" name="id" value={r.id} />
                                <input type="hidden" name="status" value={s} />
                                <button type="submit" className="font-semibold underline underline-offset-4">
                                  {dict.receipts.status[s]}
                                </button>
                              </form>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">
            {t.colConcept}: <span className="font-mono">{concept}</span>
            <CopyButton value={concept} label={t.copy} done={t.copied} />
          </p>

          {pending.length > 0 && (
            <ConfirmForm
              action={markPeriodPaid}
              lang={lang}
              id=""
              label={t.markPaid}
              confirmText={format(t.markPaidConfirm, { month })}
              confirmButton={t.confirm}
              cancel={dict.common.cancel}
              hidden={{ mes }}
            />
          )}
        </section>
      )}

      <section className="space-y-4 border-t border-line pt-8">
        <h2 className="font-display text-2xl font-extrabold">{t.settingsTitle}</h2>
        <p className="max-w-3xl text-muted">{t.settingsLead}</p>
        <BillingSettingsForm
          lang={lang}
          t={t}
          errors={dict.errors}
          common={dict.common}
          fee={settings.membership_fee_cents == null ? "" : amountForBank(settings.membership_fee_cents).replace(",00", "")}
          discount={String(settings.multi_activity_discount_pct)}
        />
      </section>
    </div>
  );
}
