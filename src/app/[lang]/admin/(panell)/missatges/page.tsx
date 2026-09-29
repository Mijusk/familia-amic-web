import { format } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { setContactHandled } from "@/lib/actions/content";
import { requireAdmin } from "@/lib/auth";
import { listContactMessages } from "@/lib/content";
import { PageHeader } from "@/components/page-header";

export default async function AdminMessages({ params }: PageProps<"/[lang]/admin/missatges">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/missatges`);
  const t = dict.admin.messages;
  const messages = await listContactMessages();
  const when = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "ca-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" });

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead} />
      {messages.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="grid gap-4">
          {messages.map((m) => (
            <li key={m.id} className={`rounded-lg border bg-surface p-5 ${m.handled_at ? "border-line" : "border-warm"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-muted">
                    <a href={`mailto:${m.email}`} className="underline underline-offset-4">
                      {m.email}
                    </a>
                    {m.phone && (
                      <>
                        {" · "}
                        <a href={`tel:${m.phone.replace(/\s/g, "")}`}>{m.phone}</a>
                      </>
                    )}
                    {" · "}
                    {when.format(new Date(m.created_at))}
                  </p>
                </div>
                <p className={`rounded-full px-3 py-1 text-sm font-semibold ${m.handled_at ? "bg-accent-soft text-accent" : "bg-warm-soft text-warm"}`}>
                  {m.handled_at ? format(t.handledOn, { date: when.format(new Date(m.handled_at)) }) : t.pending}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-line">{m.message}</p>
              <form action={setContactHandled} className="mt-3">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="handled" value={m.handled_at ? "0" : "1"} />
                <button type="submit" className="font-semibold text-accent underline underline-offset-4">
                  {m.handled_at ? t.markPending : t.markHandled}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
