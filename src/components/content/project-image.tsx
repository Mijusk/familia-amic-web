import type { Project } from "@/lib/content";

/** Portada de un proyecto; sin imagen, un bloque de color con la inicial. */
export function ProjectImage({ project, className = "" }: { project: Pick<Project, "title" | "image_url">; className?: string }) {
  if (project.image_url) {
    // eslint-disable-next-line @next/next/no-img-element -- imagen de Storage, sin optimizador
    return <img src={project.image_url} alt="" className={`object-cover ${className}`} loading="lazy" />;
  }
  return (
    <div aria-hidden="true" className={`flex items-center justify-center bg-accent-soft ${className}`}>
      <span className="font-display text-7xl font-extrabold text-brand">{project.title.charAt(0).toUpperCase()}</span>
    </div>
  );
}
