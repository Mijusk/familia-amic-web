import { redirect } from "next/navigation";
import { format } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { formatPrice } from "@/lib/activity-format";
import { requireUser } from "@/lib/auth";
import { lineText } from "@/lib/receipt-format";
import { periodLabel } from "@/lib/receipt-period";
import { listMyReceipts, type Receipt } from "@/lib/receipts";
import { PageHeader } from "@/components/page-header";

const badge: Record<Receipt["status"], string> = {
  pendent: "bg-warm-soft text-warm",
  cobrat: "bg-accent-soft text-accent",
  retornat: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  anullat: "bg-background text-muted",
};

export default async function MyReceipts({ params }: PageProps<"/[lang]/compte/rebuts">) {
  const { lang, dict } = await loadPage(params);
  const user = await requireUser(lang, `/${lang}/compte/rebuts`);
  if (user.profile.account_type !== "familia") redirect(`/${lang}/compte`);
  const t = dict.receipts;
  const receipts = await listMyReceipts(user.id);

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead} />
      {receipts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="max-w-2xl space-y-4">
          {receipts.map((r) => (
            <li key={r.id} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <h2 className="font-display text-xl font-extrabold">{periodLabel(lang, r.period, { title: true })}</h2>
                <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${badge[r.status]}`}>{t.status[r.status]}</span>
              </div>
              <ul className="mt-3 space-y-1">
                {r.receipt_lines.map((l) => (
                  <li key={l.id} className="flex justify-between gap-4">
                    <span>{lineText(t, l)}</span>
                    <span className="whitespace-nowrap">{formatPrice(lang, l.amount_cents)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex justify-between gap-4 border-t border-line pt-3 font-semibold">
                <span>{t.total}</span>
                <span>{formatPrice(lang, r.total_cents)}</span>
              </p>
              <p className="mt-1 text-sm text-muted">{format(t.account, { last4: r.iban_last4 })}</p>
              {r.status === "retornat" && <p className="mt-3 rounded-md border-l-4 border-warm bg-warm-soft px-3 py-2 text-sm">{t.returnedHelp}</p>}
            </li>
          ))}
        </ul>
      )}
      <p className="text-muted">{t.questions}</p>
    </div>
  );
}
