import { describe, expect, it } from "vitest";
import { parseInline, parseRichText } from "./rich-text";

describe("rich text", () => {
  it("splits paragraphs, headings and lists", () => {
    const blocks = parseRichText("Primer paràgraf\nque continua.\n\n## Requisits\n- Tenir el certificat\n- Viure a Catalunya\nI una frase final.");
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "heading", "list", "paragraph"]);
    expect(blocks[0]).toEqual({ type: "paragraph", content: [{ type: "text", text: "Primer paràgraf que continua." }] });
    expect(blocks[2]).toMatchObject({ type: "list", items: [[{ text: "Tenir el certificat" }], [{ text: "Viure a Catalunya" }]] });
  });

  it("finds bold text and links", () => {
    expect(parseInline("Mira **això** a [la web](https://gencat.cat/x) o https://example.org/a.")).toEqual([
      { type: "text", text: "Mira " },
      { type: "bold", text: "això" },
      { type: "text", text: " a " },
      { type: "link", text: "la web", href: "https://gencat.cat/x" },
      { type: "text", text: " o " },
      { type: "link", text: "https://example.org/a", href: "https://example.org/a" },
      { type: "text", text: "." },
    ]);
  });

  it("never turns other schemes into links", () => {
    expect(parseInline("[x](javascript:alert(1))")).toEqual([{ type: "text", text: "[x](javascript:alert(1))" }]);
  });
});
