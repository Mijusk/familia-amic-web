import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { getActivityById } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { listPhotos } from "@/lib/content";
import { PhotoManager } from "@/components/admin/photo-manager";
import { PageHeader } from "@/components/page-header";

export default async function ActivityPhotos({ params }: PageProps<"/[lang]/admin/activitats/[id]/fotos">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireAdmin(lang, `/${lang}/admin/activitats/${id}/fotos`);
  const a = await getActivityById(id);
  if (!a) notFound();
  const photos = await listPhotos(a.id);
  const t = dict.admin.photos;

  return (
    <div className="space-y-8">
      <Link href={`/${lang}/admin/activitats/${a.id}`} className="font-semibold text-accent underline underline-offset-4">
        ← {a.title}
      </Link>
      <PageHeader title={t.title} lead={t.lead} />
      <PhotoManager lang={lang} owner="activity" ownerId={a.id} photos={photos} t={t} common={dict.common} />
    </div>
  );
}
