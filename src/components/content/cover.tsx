/** Imagen de portada de una tarjeta. Sin imagen, un fondo suave con el color de la asociación. */
export function Cover({ src, tone = "mint", className = "aspect-[16/10]" }: { src: string | null; tone?: "mint" | "sky" | "warm"; className?: string }) {
  if (src) {
    return (
      <div className={`overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- imágenes de Storage o externas, sin optimizador */}
        <img src={src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
    );
  }
  const bg = { mint: "bg-mint-soft", sky: "bg-sky-soft", warm: "bg-warm-soft" }[tone];
  return (
    <div aria-hidden="true" className={`relative overflow-hidden ${bg} ${className}`}>
      <span className="absolute -left-6 -top-8 size-28 rounded-full bg-brand/20" />
      <span className="absolute -bottom-10 right-4 size-36 rounded-full bg-brand/15" />
      <span className="absolute right-1/3 top-1/3 size-10 rounded-full bg-white/70" />
    </div>
  );
}
