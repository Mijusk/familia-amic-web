import Link from "next/link";
import { loadPage } from "@/i18n/page";
import { getSpots } from "@/lib/activities";
import { listAccounts, listAllActivities } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";

export default async function AdminHome({ params }: PageProps<"/[lang]/admin">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin`);
  const t = dict.admin.home;
  const [accounts, activities, spots] = await Promise.all([listAccounts(), listAllActivities(), getSpots()]);
  const queued = [...spots.values()].reduce((n, s) => n + s.queued, 0);

  const cards = [
    { label: t.pendingMembers, value: accounts.filter((a) => a.membership_status === "pendent").length, href: `/${lang}/admin/families?filtre=pendent`, warn: true },
    { label: t.queued, value: queued, href: `/${lang}/admin/activitats`, warn: true },
    { label: t.published, value: activities.filter((a) => a.status === "publicada").length, href: `/${lang}/admin/activitats` },
    { label: t.families, value: accounts.filter((a) => a.account_type === "familia").length, href: `/${lang}/admin/families` },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={dict.admin.nav.home} lead={t.lead} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label} className={`rounded-lg border bg-surface p-5 ${c.warn && c.value > 0 ? "border-warm" : "border-line"}`}>
            <p className="font-display text-4xl font-extrabold">{c.value}</p>
            <p className="mt-1">{c.label}</p>
            <Link href={c.href} className="mt-3 inline-block font-semibold text-accent underline underline-offset-4">
              {t.see}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
