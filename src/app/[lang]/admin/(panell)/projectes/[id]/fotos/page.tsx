import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { requireAdmin } from "@/lib/auth";
import { getProjectById, listProjectPhotos } from "@/lib/content";
import { PhotoManager } from "@/components/admin/photo-manager";
import { PageHeader } from "@/components/page-header";

export default async function ProjectPhotos({ params }: PageProps<"/[lang]/admin/projectes/[id]/fotos">) {
  const { lang, dict } = await loadPage(params);
  const { id } = await params;
  await requireAdmin(lang, `/${lang}/admin/projectes/${id}/fotos`);
  const p = await getProjectById(id);
  if (!p) notFound();
  const photos = await listProjectPhotos(p.id);

  return (
    <div className="space-y-8">
      <Link href={`/${lang}/admin/projectes/${p.id}`} className="font-semibold text-accent underline underline-offset-4">
        ← {p.title}
      </Link>
      <PageHeader title={dict.admin.projects.gallery} lead={dict.admin.projects.galleryLead} />
      <PhotoManager lang={lang} owner="project" ownerId={p.id} photos={photos} t={dict.admin.photos} common={dict.common} />
    </div>
  );
}
