import { notFound } from "next/navigation";

/** Cualquier ruta que no exista muestra la página 404 dentro del diseño de la web. */
export default function CatchAll() {
  notFound();
}
