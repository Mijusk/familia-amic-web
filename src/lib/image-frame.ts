import type { CSSProperties } from "react";

/**
 * Encuadre de una imagen de portada: qué punto queda en el centro (x, y en %) y cuánto se amplía (zoom).
 * Se guarda en la propia dirección de la imagen, tras un "#" que el navegador no envía al pedir el fichero:
 * https://…/foto.jpg#encuadre=30,40,1.5. Así sirve igual en todas las formas (tarjeta, página, inicio) sin columnas nuevas.
 */
export type Frame = { x: number; y: number; zoom: number };

export const defaultFrame: Frame = { x: 50, y: 50, zoom: 1 };
export const maxZoom = 3;

const marker = "#encuadre=";
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round = (v: number) => Math.round(v * 10) / 10;

/** Separa la dirección del fichero y su encuadre. Un encuadre mal escrito se ignora. */
export function parseFrame(url: string): { src: string; frame: Frame } {
  const at = url.indexOf(marker);
  if (at === -1) return { src: url, frame: defaultFrame };
  const src = url.slice(0, at);
  const [x, y, zoom] = url.slice(at + marker.length).split(",").map(Number);
  if (![x, y, zoom].every(Number.isFinite)) return { src, frame: defaultFrame };
  return { src, frame: { x: clamp(x, 0, 100), y: clamp(y, 0, 100), zoom: clamp(zoom, 1, maxZoom) } };
}

/** Dirección con el encuadre; sin marca si es el de siempre (centrado y sin zoom). */
export function withFrame(src: string, frame: Frame) {
  if (!src) return "";
  const f = { x: round(clamp(frame.x, 0, 100)), y: round(clamp(frame.y, 0, 100)), zoom: round(clamp(frame.zoom, 1, maxZoom)) };
  if (f.x === 50 && f.y === 50 && f.zoom === 1) return src;
  return `${src}${marker}${f.x},${f.y},${f.zoom}`;
}

/** Estilo para un <img> con object-cover dentro de un recuadro con overflow-hidden. */
export function frameStyle(frame: Frame): CSSProperties {
  const origin = `${frame.x}% ${frame.y}%`;
  return frame.zoom > 1 ? { objectPosition: origin, transform: `scale(${frame.zoom})`, transformOrigin: origin } : { objectPosition: origin };
}

/** Atajo para pintar una imagen guardada: la dirección limpia y su estilo. */
export function framed(url: string) {
  const { src, frame } = parseFrame(url);
  return { src, style: frameStyle(frame) };
}
