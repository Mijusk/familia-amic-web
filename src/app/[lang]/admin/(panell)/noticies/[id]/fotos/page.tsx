import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { requireAdmin } from "@/lib/auth";
import { getNewsById, listNewsPhotos } from "@/lib/content";
import { PhotoManager } from "@/components/admin/photo-manager";
import { PageHeader } from "@/components/page-header";

export default async function NewsPhotos({ params }: PageProps<"/[lang]/admin/noticies/[id]/fotos">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireAdmin(lang, `/${lang}/admin/noticies/${id}/fotos`);
  const n = await getNewsById(id);
  if (!n) notFound();
  const photos = await listNewsPhotos(n.id);

  return (
    <div className="space-y-8">
      <Link href={`/${lang}/admin/noticies/${n.id}`} className="font-semibold text-accent underline underline-offset-4">
        ← {n.title}
      </Link>
      <PageHeader title={dict.admin.photos.title} lead={dict.admin.photos.newsLead} />
      <PhotoManager lang={lang} owner="news" ownerId={n.id} photos={photos} t={dict.admin.photos} common={dict.common} />
    </div>
  );
}
