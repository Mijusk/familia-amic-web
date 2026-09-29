import { describe, expect, it } from "vitest";
import { contactSchema, newsSchema, resourceSchema, volunteerSchema } from "./content-schema";

describe("content forms", () => {
  it("accepts a news item and treats hidden fields as empty", () => {
    const r = newsSchema.safeParse({ title: "Sopar solidari", lang_text: "ca", summary: "Gràcies a tothom", published_on: "2026-09-29", status: "publicada" });
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ slug: "", body: "", image_url: null, activity_id: null });
  });

  it("only allows https images and links", () => {
    const bad = newsSchema.safeParse({ title: "x x", lang_text: "ca", summary: "yy", published_on: "2026-09-29", status: "publicada", image_url: "javascript:alert(1)" });
    expect(bad.error?.issues[0].message).toBe("invalidUrl");
    const res = resourceSchema.safeParse({ title: "Targeta rosa", lang_text: "ca", category: "legals", status: "publicada", external_url: "http://x.org", position: "" });
    expect(res.error?.issues[0].message).toBe("invalidUrl");
  });

  it("orders resources by position", () => {
    const r = resourceSchema.safeParse({ title: "Targeta rosa", lang_text: "ca", category: "legals", status: "publicada", position: "3" });
    expect(r.data?.position).toBe(3);
  });

  it("needs consent to send a contact message", () => {
    const r = contactSchema.safeParse({ name: "Anna", email: "anna@example.com", message: "Hola, voldria informació" });
    expect(r.error?.issues.map((i) => i.path[0])).toEqual(["privacy"]);
  });

  it("needs at least one volunteering area", () => {
    const r = volunteerSchema.safeParse({ areas: [], availability: "Dissabtes" });
    expect(r.error?.issues[0].message).toBe("chooseOne");
    expect(volunteerSchema.safeParse({ areas: ["esports", "hack"], availability: "Dissabtes" }).success).toBe(false);
  });
});
