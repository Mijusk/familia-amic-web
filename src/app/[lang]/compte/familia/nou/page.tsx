import { redirect } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ParticipantForm } from "@/components/account/participant-form";

export default async function NewParticipantPage({ params }: PageProps<"/[lang]/compte/familia/nou">) {
  const { lang, dict } = await loadPage(params);
  const user = await requireUser(lang, `/${lang}/compte/familia/nou`);
  if (user.profile.account_type !== "familia") redirect(`/${lang}/compte`);

  return (
    <div className="space-y-8">
      <PageHeader title={dict.participants.newTitle} />
      <ParticipantForm lang={lang} t={dict.participants} errors={dict.errors} common={dict.common} />
    </div>
  );
}
