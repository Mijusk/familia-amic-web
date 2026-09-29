import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const { isCurrent, monthEnd, todayLocal, upcomingSessions } = await import("./activities");

const base = {
  kind: "recurrent" as const,
  weekday: 4,
  starts_on: "2026-09-01",
  ends_on: null,
} as Parameters<typeof upcomingSessions>[0];

describe("fechas de actividades", () => {
  it("calcula el último día del mes", () => {
    expect(monthEnd("2026-02-10")).toBe("2026-02-28");
    expect(monthEnd("2028-02-01")).toBe("2028-02-29");
    expect(monthEnd("2026-12-31")).toBe("2026-12-31");
  });

  it("usa la hora de Barcelona para el día de hoy", () => {
    expect(todayLocal(new Date("2026-09-29T22:30:00Z"))).toBe("2026-09-30");
  });

  it("propone los próximos jueves para la prueba", () => {
    expect(upcomingSessions(base, 3, "2026-09-29")).toEqual(["2026-10-01", "2026-10-08", "2026-10-15"]);
    expect(upcomingSessions({ ...base, ends_on: "2026-10-05" }, 3, "2026-09-29")).toEqual(["2026-10-01"]);
  });

  it("un evento puntual solo tiene su fecha, si no ha pasado", () => {
    const event = { ...base, kind: "puntual" as const, weekday: null, starts_on: "2026-10-19" };
    expect(upcomingSessions(event, 4, "2026-09-29")).toEqual(["2026-10-19"]);
    expect(upcomingSessions(event, 4, "2026-10-20")).toEqual([]);
  });

  it("una inscripción terminada o de baja ya no es vigente", () => {
    expect(isCurrent({ status: "confirmada", ends_on: null }, "2026-09-29")).toBe(true);
    expect(isCurrent({ status: "confirmada", ends_on: "2026-09-30" }, "2026-09-29")).toBe(true);
    expect(isCurrent({ status: "confirmada", ends_on: "2026-09-28" }, "2026-09-29")).toBe(false);
    expect(isCurrent({ status: "baixa", ends_on: "2026-09-30" }, "2026-09-29")).toBe(false);
  });
});
