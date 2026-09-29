import Link from "next/link";
import { loadPage } from "@/i18n/page";
import { listAccounts, type Account } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";

const filters = ["all", "pendent", "actiu", "baixa", "none", "admin"] as const;
type Filter = (typeof filters)[number];

function matches(a: Account, f: Filter) {
  if (f === "all") return true;
  if (f === "admin") return a.account_type === "admin";
  if (f === "none") return a.account_type === "familia" && !a.membership_status;
  return a.membership_status === f;
}

export default async function Families({ params, searchParams }: PageProps<"/[lang]/admin/families">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/families`);
  const t = dict.admin.families;
  const { filtre } = await searchParams;
  const current: Filter = filters.includes(filtre as Filter) ? (filtre as Filter) : "all";
  const accounts = (await listAccounts()).filter((a) => matches(a, current));

  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 font-semibold ${active ? "border-accent bg-accent text-accent-contrast" : "border-line bg-surface hover:border-accent"}`;
  const badge = (s: Account["membership_status"]) =>
    s === "actiu" ? "bg-accent-soft text-accent" : s === "pendent" ? "bg-warm-soft text-warm" : "bg-background text-muted";

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} />
      <nav aria-label={t.title}>
        <ul className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <li key={f}>
              <Link href={`/${lang}/admin/families${f === "all" ? "" : `?filtre=${f}`}`} className={chip(current === f)} aria-current={current === f ? "page" : undefined}>
                {t.filters[f]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {accounts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[40rem] text-left">
            <thead className="border-b border-line text-sm text-muted">
              <tr>
                <th className="p-3 font-semibold">{t.colName}</th>
                <th className="p-3 font-semibold">{t.colContact}</th>
                <th className="p-3 font-semibold">{t.colMembership}</th>
                <th className="p-3 font-semibold">{t.colParticipants}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <Link href={`/${lang}/admin/families/${a.id}`} className="font-semibold underline underline-offset-4">
                      {a.full_name}
                    </Link>
                    {a.account_type !== "familia" && <span className="ml-2 text-sm text-muted">({t.filters.admin})</span>}
                  </td>
                  <td className="p-3 text-[0.95rem]">
                    <span className="block break-all">{a.email}</span>
                    <span className="text-muted">{a.phone}</span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${badge(a.membership_status)}`}>
                      {a.membership_status ? dict.membership.status[a.membership_status] : t.membershipNone}
                    </span>
                  </td>
                  <td className="p-3">{a.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
