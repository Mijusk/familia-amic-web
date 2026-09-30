/** Dirección pública de la web, sin barra final (NEXT_PUBLIC_SITE_URL en Vercel). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
