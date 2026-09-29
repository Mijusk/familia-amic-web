import { describe, expect, it } from "vitest";
import { activitySchema } from "./activity-schema";

const base = {
  title: "Taller de cuina",
  lang_text: "ca",
  summary: "Cuinem plegats.",
  kind: "puntual",
  starts_on: "2026-10-10",
  payment_method: "gratuit",
  status: "publicada",
};

describe("activitySchema", () => {
  it("acepta un evento puntual sin los campos que el formulario oculta", () => {
    const r = activitySchema.safeParse(base);
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ start_time: null, capacity: null, price: null, category_id: null });
  });

  it("pide día y horario en las semanales, con final posterior al inicio", () => {
    const r = activitySchema.safeParse({ ...base, kind: "recurrent", weekday: "4", start_time: "19:00", end_time: "18:00" });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => [i.path[0], i.message])).toEqual([["end_time", "invalidTime"]]);
  });

  it("entiende el precio con coma y lo pasa a céntimos", () => {
    const r = activitySchema.safeParse({ ...base, payment_method: "transferencia", price: "12,5", capacity: "8" });
    expect(r.data).toMatchObject({ price: 1250, capacity: 8 });
  });

  it("rechaza plazas o precios que no son números", () => {
    const r = activitySchema.safeParse({ ...base, capacity: "0", price: "gratis" });
    expect(r.error?.issues.map((i) => i.path[0]).sort()).toEqual(["capacity", "price"]);
  });
});
