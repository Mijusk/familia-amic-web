import Link from "next/link";
import { notFound } from "next/navigation";
import { format, formatDate } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { isCurrent, todayLocal } from "@/lib/activities";
import { setMembershipStatus } from "@/lib/actions/admin";
import { getFamily, logAction } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { ageFrom } from "@/lib/data";
import { Alert } from "@/components/form";
import { PageHeader } from "@/components/page-header";

function reveal(encrypted: string) {
  try {
    return decrypt(encrypted);
  } catch {
    return "—";
  }
}

export default async function FamilyDetail({ params, searchParams }: PageProps<"/[lang]/admin/families/[id]">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireAdmin(lang, `/${lang}/admin/families/${id}`);
  const family = await getFamily(id);
  if (!family) notFound();
  // Ver DNI, IBAN y salud queda registrado.
  await logAction("family_view", "family", id);
  const { estat } = await searchParams;
  const t = dict.admin.families;
  const r = dict.admin.roster;
  const m = family.membership;
  const today = todayLocal();

  const statusButton = (status: "actiu" | "pendent" | "baixa", label: string, primary = false) => (
    <form action={setMembershipStatus}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={
          primary
            ? "min-h-11 rounded-md bg-accent px-4 font-semibold text-accent-contrast hover:opacity-90"
            : "min-h-11 rounded-md border border-line bg-surface px-4 font-semibold hover:border-accent"
        }
      >
        {label}
      </button>
    </form>
  );

  const dl = (items: [string, string | null | undefined][]) => (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="font-semibold break-words">{v}</dd>
          </div>
        ))}
    </dl>
  );

  return (
    <div className="space-y-10">
      <PageHeader title={family.profile.full_name} lead={format(t.registered, { date: formatDate(lang, family.profile.created_at.slice(0, 10)) })} />
      {estat && <Alert tone="success">{t.statusChanged}</Alert>}
      <p className="rounded-md border-l-4 border-warm bg-warm-soft px-4 py-3 text-sm">{t.sensitiveNote}</p>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">{t.contactTitle}</h2>
        {dl([
          [dict.account.myData.email, family.email],
          [dict.account.myData.phone, family.profile.phone],
        ])}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">{t.membershipTitle}</h2>
        {!m ? (
          <p className="text-muted">{t.noMembership}</p>
        ) : (
          <>
            <p>
              <span className="rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent">{dict.membership.status[m.status]}</span>
              {m.member_since && <span className="ml-3 text-muted">{format(t.memberSince, { date: formatDate(lang, m.member_since) })}</span>}
            </p>
            {dl([
              [t.dni, reveal(m.dni_encrypted)],
              [t.address, `${m.address}, ${m.postal_code} ${m.city}`],
              [t.bank, m.bank_name],
              [t.iban, reveal(m.iban_encrypted).replace(/(.{4})/g, "$1 ").trim()],
              [t.sepaRef, m.sepa_reference],
              ["SEPA", format(t.sepaDate, { date: formatDate(lang, m.sepa_accepted_at.slice(0, 10)) })],
            ])}
            <div className="flex flex-wrap gap-3">
              {m.status !== "actiu" && statusButton("actiu", t.activate, true)}
              {m.status !== "pendent" && statusButton("pendent", t.setPending)}
              {m.status !== "baixa" && statusButton("baixa", t.setBaixa)}
            </div>
          </>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">{t.participantsTitle}</h2>
        {family.participants.length === 0 ? (
          <p className="text-muted">{t.noParticipants}</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {family.participants.map((p) => (
              <li key={p.id} className="space-y-3 rounded-lg border border-line bg-surface p-5">
                <p className="font-display text-lg font-extrabold">
                  {p.first_name} {p.last_name} <span className="font-sans text-base font-normal text-muted">· {format(r.age, { age: ageFrom(p.birth_date) })}</span>
                </p>
                {dl([
                  ["DNI", reveal(p.dni_encrypted)],
                  [dict.participants.birthDate, formatDate(lang, p.birth_date)],
                  [dict.participants.relationship, dict.participants.relationships[p.relationship]],
                  [dict.participants.disabilityPct, p.disability_pct != null ? `${p.disability_pct}%` : null],
                  [dict.participants.dependencyGrade, p.has_dependency && p.dependency_grade ? String(p.dependency_grade) : null],
                  [dict.participants.allergies, p.allergies],
                  [dict.participants.medicalNotes, p.medical_notes],
                ])}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">{t.enrollmentsTitle}</h2>
        {family.enrollments.length === 0 ? (
          <p className="text-muted">{t.noEnrollments}</p>
        ) : (
          <ul className="space-y-2">
            {family.enrollments.map((e) => {
              const p = family.participants.find((x) => x.id === e.participant_id);
              const key = e.status === "baixa" ? "baixa" : e.is_trial ? "prova" : e.status === "cua" ? "cua" : isCurrent(e, today) ? "confirmada" : "acabada";
              return (
                <li key={e.id} className="flex flex-wrap gap-x-2">
                  <span className="font-semibold">{p ? `${p.first_name} ${p.last_name}` : ""}</span>
                  <span>·</span>
                  {e.activities && (
                    <Link href={`/${lang}/admin/activitats/${e.activity_id}/inscrits`} className="underline underline-offset-4">
                      {e.activities.title}
                    </Link>
                  )}
                  <span className="text-muted">· {dict.enrollments.status[key]}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
