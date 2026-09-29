import { describe, expect, it } from "vitest";
import { isValidDni, isValidPhone, isValidSpanishIban, normalizeIban } from "./validation";

describe("isValidDni", () => {
  it("acepta DNI y NIE con letra correcta", () => {
    expect(isValidDni("12345678Z")).toBe(true);
    expect(isValidDni("12345678-z")).toBe(true);
    expect(isValidDni("X1234567L")).toBe(true);
    expect(isValidDni("Y1234567X")).toBe(true);
  });
  it("rechaza letra incorrecta o formato malo", () => {
    expect(isValidDni("12345678A")).toBe(false);
    expect(isValidDni("1234567Z")).toBe(false);
    expect(isValidDni("")).toBe(false);
  });
});

describe("isValidSpanishIban", () => {
  it("acepta un IBAN español válido con o sin espacios", () => {
    expect(isValidSpanishIban("ES9121000418450200051332")).toBe(true);
    expect(isValidSpanishIban("es91 2100 0418 4502 0005 1332")).toBe(true);
    expect(normalizeIban("es91 2100 0418 4502 0005 1332")).toBe("ES9121000418450200051332");
  });
  it("rechaza dígitos de control incorrectos u otros países", () => {
    expect(isValidSpanishIban("ES9121000418450200051333")).toBe(false);
    expect(isValidSpanishIban("DE89370400440532013000")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("acepta móviles con o sin prefijo", () => {
    expect(isValidPhone("623 101 549")).toBe(true);
    expect(isValidPhone("+34 623101549")).toBe(true);
    expect(isValidPhone("12345")).toBe(false);
  });
});
