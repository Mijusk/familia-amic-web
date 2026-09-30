import { z } from "zod";

const uuid = /^[0-9a-f-]{36}$/i;
const blank = <T extends z.ZodType>(schema: T) => z.preprocess((v) => v ?? "", schema);
const text = (max: number) => blank(z.string().trim().max(max, "tooLong"));
const optionalUrl = blank(
  z
    .string()
    .trim()
    .max(500, "tooLong")
    .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "invalidUrl")
    .transform((v) => v || null),
);

/**
 * Imagen de portada: una dirección https o una foto subida al bucket "fotos" de Supabase (en local es http).
 * La pone el selector de imágenes del panel, pero también se puede pegar a mano.
 */
export const imageUrl = blank(
  z
    .string()
    .trim()
    .max(500, "tooLong")
    .refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v) || /^http:\/\/[^\s/]+\/storage\/v1\/object\/public\/fotos\/[^\s]+$/.test(v), "invalidUrl")
    .transform((v) => v || null),
);

const optionalDate = blank(z.union([z.literal(""), z.iso.date("invalidDate")]).transform((v) => v || null));

/** "Destacar en el inicio" entre dos fechas (noticias y actividades): las dos o ninguna. */
export const featuredFields = { featured_from: optionalDate, featured_until: optionalDate };

export function checkFeatured(d: { featured_from: string | null; featured_until: string | null }, ctx: z.RefinementCtx) {
  if (d.featured_from && !d.featured_until) ctx.addIssue({ code: "custom", message: "required", path: ["featured_until"] });
  if (!d.featured_from && d.featured_until) ctx.addIssue({ code: "custom", message: "required", path: ["featured_from"] });
  if (d.featured_from && d.featured_until && d.featured_until < d.featured_from) ctx.addIssue({ code: "custom", message: "invalidDate", path: ["featured_until"] });
}

/** Enlace de una foto del inicio: una página de la web (/ca/…) o una dirección https. */
const optionalLink = blank(
  z
    .string()
    .trim()
    .max(500, "tooLong")
    .refine((v) => v === "" || /^\/[a-z0-9\-/?=&#_%.]*$/i.test(v) || /^https:\/\/[^\s]+$/.test(v), "invalidUrl")
    .transform((v) => v || null),
);

/** Foto del inicio (panel). */
export const slideSchema = z.object({
  image_url: imageUrl.refine((v) => v !== null, "required"),
  caption: text(140),
  link_url: optionalLink,
  position: blank(z.string().trim())
    .refine((v) => v === "" || /^-?\d{1,4}$/.test(v), "invalidNumber")
    .transform((v) => (v === "" ? 0 : Number(v))),
  active: blank(z.string()).transform((v) => v === "on"),
});

/** Formulario de noticias del panel. */
export const newsSchema = z.object({
  title: z.string().trim().min(2, "required").max(160, "tooLong"),
  slug: text(80),
  lang_text: z.enum(["ca", "es"], "required"),
  summary: z.string().trim().min(2, "required").max(400, "tooLong"),
  body: text(20000),
  image_url: imageUrl,
  activity_id: blank(z.string()).refine((v) => v === "" || uuid.test(v), "required").transform((v) => v || null),
  published_on: z.iso.date("invalidDate"),
  status: z.enum(["esborrany", "publicada"], "required"),
  ...featuredFields,
}).superRefine(checkFeatured);

/** Formulario de recursos (guías) del panel. */
export const resourceSchema = z.object({
  title: z.string().trim().min(2, "required").max(160, "tooLong"),
  slug: text(80),
  lang_text: z.enum(["ca", "es"], "required"),
  category: z.enum(["legals", "educacio", "salut"], "required"),
  summary: text(400),
  body: text(30000),
  external_url: optionalUrl,
  position: blank(z.string().trim())
    .refine((v) => v === "" || /^-?\d{1,4}$/.test(v), "invalidNumber")
    .transform((v) => (v === "" ? 0 : Number(v))),
  status: z.enum(["esborrany", "publicada"], "required"),
});

/** Formulario de proyectos del panel. */
export const projectSchema = z.object({
  title: z.string().trim().min(2, "required").max(120, "tooLong"),
  slug: text(80),
  lang_text: z.enum(["ca", "es"], "required"),
  subtitle: text(200),
  body: text(20000),
  image_url: imageUrl,
  position: blank(z.string().trim())
    .refine((v) => v === "" || /^-?\d{1,4}$/.test(v), "invalidNumber")
    .transform((v) => (v === "" ? 0 : Number(v))),
  status: z.enum(["esborrany", "publicada"], "required"),
});

/** Formulario de contacto público. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "required").max(120, "tooLong"),
  email: z.email("invalidEmail"),
  phone: text(30),
  message: z.string().trim().min(5, "required").max(5000, "tooLong"),
  privacy: z.literal("on", "consentRequired"),
});

export const volunteerAreas = ["activitats", "esports", "casals", "tallers", "comunicacio", "administracio", "altres"] as const;

/** Solicitud de voluntariado. Las áreas llegan como varias casillas con el mismo nombre. */
export const volunteerSchema = z.object({
  areas: z.array(z.enum(volunteerAreas)).min(1, "chooseOne"),
  availability: z.string().trim().min(2, "required").max(500, "tooLong"),
  experience: text(2000),
  motivation: text(2000),
});
