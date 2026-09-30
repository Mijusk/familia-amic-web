import type { Dictionary } from "@/i18n/get-dictionary";
import { deletePhoto, type PhotoOwner } from "@/lib/actions/content";
import { photoUrl, type Photo } from "@/lib/content";
import { ConfirmForm } from "@/components/confirm-form";
import { PhotoUploader } from "./photo-uploader";

type Props = { lang: string; owner: PhotoOwner; ownerId: string; photos: Photo[]; t: Dictionary["admin"]["photos"]; common: Dictionary["common"] };

/** Galería de fotos de una actividad o un proyecto en el panel: subir y eliminar. */
export function PhotoManager({ lang, owner, ownerId, photos, t, common }: Props) {
  return (
    <>
      <PhotoUploader lang={lang} owner={owner} ownerId={ownerId} t={t} />
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
                hidden={{ owner, owner_id: ownerId }}
                label={common.delete}
                confirmText={t.deleteConfirm}
                confirmButton={common.delete}
                cancel={common.cancel}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
