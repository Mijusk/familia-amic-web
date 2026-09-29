import "server-only";
import { notFound } from "next/navigation";
import { isLocale } from "./config";
import { getDictionary } from "./get-dictionary";

/** Idioma de la ruta + diccionario; 404 si el idioma no existe. */
export async function loadPage(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return { lang, dict: await getDictionary(lang) };
}
