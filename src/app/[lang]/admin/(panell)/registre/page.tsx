import { loadPage } from "@/i18n/page";
import { listLog } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";

export default async function Log({ params }: PageProps<"/[lang]/admin/registre">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/registre`);
  const t = dict.admin.log;
  const entries = await listLog();
  const when = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "ca-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" });
  const actions = t.actions as Record<string, string>;

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead} />
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[40rem] text-left text-[0.95rem]">
            <thead className="border-b border-line text-sm text-muted">
              <tr>
                <th className="p-3 font-semibold">{t.colWhen}</th>
                <th className="p-3 font-semibold">{t.colWho}</th>
                <th className="p-3 font-semibold">{t.colAction}</th>
                <th className="p-3 font-semibold">{t.colDetails}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap p-3">{when.format(new Date(e.created_at))}</td>
                  <td className="p-3">{e.profiles?.full_name ?? "—"}</td>
                  <td className="p-3">{actions[e.action] ?? e.action}</td>
                  <td className="p-3 font-mono text-sm text-muted">
                    {Object.entries(e.details)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
