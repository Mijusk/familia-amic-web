import { describe, expect, it } from "vitest";
import { frameStyle, parseFrame, withFrame } from "./image-frame";

const url = "https://x.supabase.co/storage/v1/object/public/fotos/imatges/a.jpg";

describe("encuadre de imágenes", () => {
  it("sin marca, centrado y sin zoom", () => {
    expect(parseFrame(url)).toEqual({ src: url, frame: { x: 50, y: 50, zoom: 1 } });
    expect(withFrame(url, { x: 50, y: 50, zoom: 1 })).toBe(url);
  });

  it("guarda y lee el encuadre en la dirección", () => {
    const framed = withFrame(url, { x: 30.04, y: 72, zoom: 1.55 });
    expect(framed).toBe(`${url}#encuadre=30,72,1.6`);
    expect(parseFrame(framed)).toEqual({ src: url, frame: { x: 30, y: 72, zoom: 1.6 } });
  });

  it("limita los valores y descarta marcas rotas", () => {
    expect(parseFrame(`${url}#encuadre=-5,140,9`).frame).toEqual({ x: 0, y: 100, zoom: 3 });
    expect(parseFrame(`${url}#encuadre=hola`)).toEqual({ src: url, frame: { x: 50, y: 50, zoom: 1 } });
    expect(withFrame("", { x: 10, y: 10, zoom: 2 })).toBe("");
  });

  it("estilo con zoom desde el punto elegido", () => {
    expect(frameStyle({ x: 20, y: 80, zoom: 1 })).toEqual({ objectPosition: "20% 80%" });
    expect(frameStyle({ x: 20, y: 80, zoom: 2 })).toEqual({ objectPosition: "20% 80%", transform: "scale(2)", transformOrigin: "20% 80%" });
  });
});
