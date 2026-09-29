import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("quita acentos y espacios", () => {
    expect(slugify("Pàdel adaptat · dijous")).toBe("padel-adaptat-dijous");
    expect(slugify("Cel·lebració d'estiu!")).toBe("cellebracio-d-estiu");
    expect(slugify("  --Música  ")).toBe("musica");
  });
});
