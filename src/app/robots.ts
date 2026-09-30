import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Las páginas privadas ya piden no indexarse; aquí además se le dice a los buscadores que no entren.
const privatePaths = ["admin", "compte", "auth", "entrar", "registre", "recuperar", "nova-contrasenya"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: privatePaths.map((p) => `/*/${p}`) },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
