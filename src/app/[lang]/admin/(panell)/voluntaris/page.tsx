import { formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { setVolunteerStatus } from "@/lib/actions/content";
import { listAccounts } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { listVolunteerApplications, volunteerStatuses } from "@/lib/content";
import { PageHeader } from "@/components/page-header";

export default async function AdminVolunteers({ params }: PageProps<"/[lang]/admin/voluntaris">) {
  const { lang, dict } = await loadPage(params);
  await requireAdmin(lang, `/${lang}/admin/voluntaris`);
  const t = dict.admin.volunteers;
  const v = dict.volunteer;
  const [applications, accounts] = await Promise.all([listVolunteerApplications(), listAccounts()]);
  const byId = new Map(accounts.map((a) => [a.id, a]));
  // Cuentas de voluntario que aún no han enviado la solicitud.
  const withoutForm = accounts.filter((a) => a.account_type === "voluntari" && !applications.some((x) => x.profile_id === a.id));

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead} />
      {applications.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="grid gap-4">
          {applications.map((a) => {
            const person = byId.get(a.profile_id);
            return (
              <li key={a.profile_id} id={`v-${a.profile_id}`} className={`rounded-lg border bg-surface p-5 ${a.status === "nova" ? "border-warm" : "border-line"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{person?.full_name ?? "—"}</p>
                    {person && (
                      <p className="text-sm text-muted">
                        <a href={`mailto:${person.email}`} className="underline underline-offset-4">
                          {person.email}
                        </a>
                        {" · "}
                        <a href={`tel:${person.phone.replace(/\s/g, "")}`}>{person.phone}</a>
                        {" · "}
                        {formatDate(lang, a.created_at.slice(0, 10))}
                      </p>
                    )}
                  </div>
                  <form action={setVolunteerStatus} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={a.profile_id} />
                    <label htmlFor={`status-${a.profile_id}`} className="sr-only">
                      {t.status}
                    </label>
                    <select id={`status-${a.profile_id}`} name="status" defaultValue={a.status} className="min-h-11 rounded-md border border-line bg-surface px-3">
                      {volunteerStatuses.map((s) => (
                        <option key={s} value={s}>
                          {t.statuses[s]}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="min-h-11 rounded-md border border-accent px-4 font-semibold text-accent hover:bg-accent-soft">
                      {dict.common.save}
                    </button>
                  </form>
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-muted">{v.areas}</dt>
                    <dd>{a.areas.map((x) => v.areaNames[x as keyof typeof v.areaNames] ?? x).join(", ")}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">{v.availability}</dt>
                    <dd className="whitespace-pre-line">{a.availability}</dd>
                  </div>
                  {a.experience && (
                    <div>
                      <dt className="text-sm text-muted">{v.experience}</dt>
                      <dd className="whitespace-pre-line">{a.experience}</dd>
                    </div>
                  )}
                  {a.motivation && (
                    <div>
                      <dt className="text-sm text-muted">{v.motivation}</dt>
                      <dd className="whitespace-pre-line">{a.motivation}</dd>
                    </div>
                  )}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
      {withoutForm.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-extrabold">{t.withoutForm}</h2>
          <p className="mt-1 text-muted">{t.withoutFormLead}</p>
          <ul className="mt-3 space-y-1">
            {withoutForm.map((a) => (
              <li key={a.id}>
                {a.full_name} ·{" "}
                <a href={`mailto:${a.email}`} className="underline underline-offset-4">
                  {a.email}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
