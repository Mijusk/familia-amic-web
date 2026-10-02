"use client";

import { useRef } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { defaultFrame, frameStyle, maxZoom, type Frame } from "@/lib/image-frame";

/** Formas en que se ve una portada en la web. La primera de la lista es la que se arrastra. */
export const shapes = {
  card: "aspect-[16/10]",
  page: "aspect-[4/3]",
  wide: "aspect-[16/9]",
} as const;
export type Shape = keyof typeof shapes;

type Props = { src: string; frame: Frame; onChange: (f: Frame) => void; use: Shape[]; t: Dictionary["admin"]["image"] };

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/**
 * Encuadre de una foto: se arrastra la imagen dentro del recuadro (o con las flechas del teclado) para elegir qué se ve,
 * y la barra amplía. Al lado, cómo queda en las otras formas en que sale la foto.
 */
export function FrameEditor({ src, frame, onChange, use, t }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number; frame: Frame } | null>(null);
  const [main, ...others] = use;

  // Cuánto se mueve el encuadre por cada píxel arrastrado: lo que sobra de la foto fuera del recuadro.
  const spill = () => {
    const b = box.current?.getBoundingClientRect(), i = img.current;
    if (!b || !i?.naturalWidth) return { x: b?.width ?? 1, y: b?.height ?? 1 };
    const cover = Math.max(b.width / i.naturalWidth, b.height / i.naturalHeight) * frame.zoom;
    return { x: Math.max(i.naturalWidth * cover - b.width, b.width * 0.5), y: Math.max(i.naturalHeight * cover - b.height, b.height * 0.5) };
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    onChange({ ...frame, x: clamp(frame.x + m[0]), y: clamp(frame.y + m[1]) });
  };

  const view = (shape: Shape, ref?: boolean) => (
    // eslint-disable-next-line @next/next/no-img-element -- vista previa de Storage o de una dirección externa
    <img ref={ref ? img : undefined} src={src} alt="" draggable={false} className="pointer-events-none size-full select-none object-cover" style={frameStyle(frame)} data-shape={shape} />
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <div>
          <div
            ref={box}
            role="application"
            tabIndex={0}
            aria-label={`${t.frame}. ${t.frameKeys}`}
            data-testid="frame-box"
            onKeyDown={onKey}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, frame };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              const s = spill();
              onChange({ ...d.frame, x: clamp(d.frame.x - ((e.clientX - d.x) / s.x) * 100), y: clamp(d.frame.y - ((e.clientY - d.y) / s.y) * 100) });
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            className={`relative cursor-grab touch-none overflow-hidden rounded-lg bg-mint-soft ring-2 ring-accent active:cursor-grabbing ${shapes[main]}`}
          >
            {view(main, true)}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-60">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="border border-white/40" />
              ))}
            </span>
            <span aria-hidden="true" className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white">
              {t.shapes[main]}
            </span>
          </div>
        </div>
        {others.length > 0 && (
          <div className="grid content-start gap-3">
            {others.map((s) => (
              <figure key={s}>
                <div className={`overflow-hidden rounded-md bg-mint-soft ring-1 ring-line ${shapes[s]}`}>{view(s)}</div>
                <figcaption className="mt-1 text-xs text-muted">{t.shapes[s]}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-muted">{t.frameHint}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex flex-1 items-center gap-3 text-sm font-semibold">
          {t.zoom}
          <input
            type="range"
            min={1}
            max={maxZoom}
            step={0.05}
            value={frame.zoom}
            onChange={(e) => onChange({ ...frame, zoom: Number(e.target.value) })}
            className="min-h-11 w-full max-w-64 accent-[var(--accent)]"
          />
        </label>
        <button type="button" onClick={() => onChange(defaultFrame)} className="min-h-11 font-semibold text-accent underline underline-offset-4">
          {t.center}
        </button>
      </div>
    </div>
  );
}
