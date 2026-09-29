import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

beforeAll(() => {
  process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
});

describe("encrypt / decrypt", () => {
  it("recupera el texto original y no lo deja en claro", async () => {
    const { encrypt, decrypt } = await import("./crypto");
    const stored = encrypt("ES9121000418450200051332");
    expect(stored.startsWith("v1.")).toBe(true);
    expect(stored).not.toContain("2100");
    expect(decrypt(stored)).toBe("ES9121000418450200051332");
  });
  it("cifra distinto cada vez", async () => {
    const { encrypt } = await import("./crypto");
    expect(encrypt("12345678Z")).not.toBe(encrypt("12345678Z"));
  });
  it("detecta datos manipulados", async () => {
    const { encrypt, decrypt } = await import("./crypto");
    const parts = encrypt("12345678Z").split(".");
    parts[3] = Buffer.from("otro").toString("base64url");
    expect(() => decrypt(parts.join("."))).toThrow();
  });
});
