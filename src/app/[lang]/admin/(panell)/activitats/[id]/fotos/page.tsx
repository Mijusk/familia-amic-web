import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPage } from "@/i18n/page";
import { deletePhoto } from "@/lib/actions/content";
import { getActivityById } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { listPhotos, photoUrl } from "@/lib/content";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { ConfirmForm } from "@/components/confirm-form";
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
      <PhotoUploader lang={lang} activityId={a.id} t={t} />
      {photos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <li key={p.id} className="space-y-2 rounded-lg border border-line bg-surface p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- fotos de Storage, sin optimizador de imágenes */}
              <img src={photoUrl(p.path)} alt={p.caption} className="aspect-[4/3] w-full rounded-md object-cover" loading="lazy" />
              {p.caption && <p className="text-sm">{p.caption}</p>}
              <ConfirmForm
                action={deletePhoto}
                lang={lang}
                id={p.id}
                hidden={{ activity: a.id }}
                label={dict.common.delete}
                confirmText={t.deleteConfirm}
                confirmButton={dict.common.delete}
                cancel={dict.common.cancel}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
