import { describe, expect, it } from "vitest";
import { amountForBank, bankConcept, groupIban, parsePeriod, periodParam, shiftPeriod } from "./receipt-period";

describe("receipt periods", () => {
  it("reads the month from the URL or falls back to the current one", () => {
    expect(parsePeriod("2026-10", "2026-09-29")).toBe("2026-10-01");
    expect(parsePeriod("2026-13", "2026-09-29")).toBe("2026-09-01");
    expect(parsePeriod("x", "2026-09-29")).toBe("2026-09-01");
    expect(parsePeriod(undefined, "2026-09-29")).toBe("2026-09-01");
    expect(periodParam("2026-10-01")).toBe("2026-10");
  });

  it("moves across years", () => {
    expect(shiftPeriod("2026-12-01", 1)).toBe("2027-01-01");
    expect(shiftPeriod("2026-01-01", -1)).toBe("2025-12-01");
    expect(shiftPeriod("2026-05-01", 0)).toBe("2026-05-01");
  });

  it("formats what goes into the bank", () => {
    expect(amountForBank(14700)).toBe("147,00");
    expect(amountForBank(5)).toBe("0,05");
    expect(groupIban("ES9121000418450200051332")).toBe("ES91 2100 0418 4502 0005 1332");
    expect(bankConcept("2026-10-01")).toBe("Família Amic - octubre 2026");
    expect(bankConcept("2027-03-01")).toBe("Família Amic - març 2027");
  });
});
