import { z } from "zod";
import { checkFeatured, featuredFields, imageUrl } from "./content-schema";

const uuid = /^[0-9a-f-]{36}$/i;

// Los campos que el formulario oculta (horario en un evento puntual, precio si es gratis…) no llegan: cuentan como vacíos.
const blank = <T extends z.ZodType>(schema: T) => z.preprocess((v) => v ?? "", schema);
const text = (max: number) => blank(z.string().trim().max(max, "tooLong"));
const optionalDate = blank(z.union([z.literal(""), z.iso.date("invalidDate")]).transform((v) => v || null));
const optionalTime = blank(z.union([z.literal(""), z.iso.time({ precision: -1, message: "invalidDate" })]).transform((v) => v || null));

/** Validación del formulario de actividades del panel. */
export const activitySchema = z
  .object({
    title: z.string().trim().min(2, "required").max(120, "tooLong"),
    slug: text(80),
    lang_text: z.enum(["ca", "es"], "required"),
    summary: z.string().trim().min(2, "required").max(300, "tooLong"),
    description: text(5000),
    image_url: imageUrl,
    category_id: blank(z.string()).refine((v) => v === "" || uuid.test(v), "required").transform((v) => v || null),
    kind: z.enum(["recurrent", "puntual"], "required"),
    weekday: blank(z.string()),
    start_time: optionalTime,
    end_time: optionalTime,
    starts_on: z.iso.date("invalidDate"),
    ends_on: optionalDate,
    location: text(200),
    capacity: blank(z.string())
      .transform((v) => v.trim())
      .refine((v) => v === "" || (/^\d{1,4}$/.test(v) && Number(v) > 0), "invalidNumber")
      .transform((v) => (v === "" ? null : Number(v))),
    price: blank(z.string())
      .transform((v) => v.trim().replace(",", "."))
      .refine((v) => v === "" || /^\d{1,5}(\.\d{1,2})?$/.test(v), "invalidNumber")
      .transform((v) => (v === "" ? null : Math.round(Number(v) * 100))),
    payment_method: z.enum(["rebut", "transferencia", "gratuit"], "required"),
    payment_notes: text(500),
    status: z.enum(["esborrany", "publicada", "cancellada", "finalitzada"], "required"),
    ...featuredFields,
  })
  .superRefine((d, ctx) => {
    if (d.kind === "recurrent") {
      if (!/^[1-7]$/.test(d.weekday)) ctx.addIssue({ code: "custom", message: "required", path: ["weekday"] });
      if (!d.start_time) ctx.addIssue({ code: "custom", message: "required", path: ["start_time"] });
      if (!d.end_time) ctx.addIssue({ code: "custom", message: "required", path: ["end_time"] });
      else if (d.start_time && d.end_time <= d.start_time) ctx.addIssue({ code: "custom", message: "invalidTime", path: ["end_time"] });
    }
    if (d.ends_on && d.ends_on < d.starts_on) ctx.addIssue({ code: "custom", message: "invalidDate", path: ["ends_on"] });
    checkFeatured(d, ctx);
  });
