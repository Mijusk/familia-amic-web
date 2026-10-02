import type { Project } from "@/lib/content";
import { framed } from "@/lib/image-frame";

/** Portada de un proyecto; sin imagen, un bloque de color con la inicial. */
export function ProjectImage({ project, className = "" }: { project: Pick<Project, "title" | "image_url">; className?: string }) {
  if (project.image_url) {
    const image = framed(project.image_url);
    return (
      <div className={`overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen de Storage, sin optimizador */}
        <img src={image.src} alt="" className="size-full object-cover" style={image.style} loading="lazy" />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className={`flex items-center justify-center bg-accent-soft ${className}`}>
      <span className="font-display text-7xl font-extrabold text-brand">{project.title.charAt(0).toUpperCase()}</span>
    </div>
  );
}
