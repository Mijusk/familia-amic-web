import { notFound } from "next/navigation";
import { format } from "@/i18n/format";
import { loadPage } from "@/i18n/page";
import { requireUser } from "@/lib/auth";
import { deleteParticipant } from "@/lib/actions/participants";
import { getParticipant, maskedDni } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ParticipantForm } from "@/components/account/participant-form";
import { ConfirmForm } from "@/components/confirm-form";
import { Alert } from "@/components/form";

export default async function EditParticipantPage({ params, searchParams }: PageProps<"/[lang]/compte/familia/[id]">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireUser(lang, `/${lang}/compte/familia/${id}`);
  const p = await getParticipant(id);
  if (!p) notFound();
  const t = dict.participants;
  const name = `${p.first_name} ${p.last_name}`;
  const { error } = await searchParams;

  return (
    <div className="space-y-8">
      <PageHeader title={t.editTitle} lead={name} />
      {error === "inUse" && <Alert tone="error">{dict.errors.participantInUse}</Alert>}
      <ParticipantForm
        lang={lang}
        t={t}
        errors={dict.errors}
        common={dict.common}
        initial={{
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          birth_date: p.birth_date,
          relationship: p.relationship,
          disability_pct: p.disability_pct?.toString() ?? "",
          has_dependency: p.has_dependency ? "yes" : "no",
          dependency_grade: p.dependency_grade?.toString() ?? "",
          allergies: p.allergies ?? "",
          medical_notes: p.medical_notes ?? "",
          dniMasked: maskedDni(p.dni_encrypted),
        }}
      />
      <ConfirmForm
        action={deleteParticipant}
        lang={lang}
        id={p.id}
        label={dict.common.delete}
        confirmText={format(t.deleteConfirm, { name })}
        confirmButton={t.deleteConfirmButton}
        cancel={dict.common.cancel}
      />
    </div>
  );
}
