import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { requireUser } from "@/lib/auth";
import { ageFrom, listParticipants } from "@/lib/data";
import { PageHeader } from "@/components/page-header";

export default async function FamilyPage({ params }: PageProps<"/[lang]/compte/familia">) {
  const { lang, dict } = await loadPage(params);
  const user = await requireUser(lang, `/${lang}/compte/familia`);
  if (user.profile.account_type !== "familia") redirect(`/${lang}/compte`);
  const t = dict.participants;
  const participants = await listParticipants();

  return (
    <div className="space-y-8">
      <PageHeader title={t.title} lead={t.lead}>
        <Link
          href={`/${lang}/compte/familia/nou`}
          className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-accent-contrast hover:opacity-90"
        >
          {t.add}
        </Link>
      </PageHeader>

      {participants.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {participants.map((p) => (
            <li key={p.id} className="rounded-lg border border-line bg-surface p-5">
              <p className="font-display text-xl font-extrabold">
                {p.first_name} {p.last_name}
              </p>
              <p className="mt-1 text-muted">
                {format(t.age, { age: ageFrom(p.birth_date) })} · {t.relationships[p.relationship]}
              </p>
              <Link href={`/${lang}/compte/familia/${p.id}`} className="mt-3 inline-block font-semibold text-accent underline underline-offset-4">
                {dict.common.edit}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
