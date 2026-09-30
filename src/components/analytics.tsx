import Script from "next/script";

/**
 * Estadísticas de visitas sin cookies con Umami (https://umami.is): no guarda datos personales ni pide
 * consentimiento. Solo se carga si hay NEXT_PUBLIC_UMAMI_WEBSITE_ID. No envía la parte "?…" de las
 * direcciones, que en los enlaces de confirmación lleva códigos de un solo uso.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!id) return null;
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://cloud.umami.is/script.js";
  return <Script src={src} data-website-id={id} data-exclude-search="true" data-do-not-track="true" strategy="afterInteractive" />;
}
