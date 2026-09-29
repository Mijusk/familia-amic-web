/**
 * Formato de texto sencillo para noticias y recursos, pensado para escribirse en el panel sin saber HTML:
 *   - Una línea en blanco separa párrafos.
 *   - "## Título" es un subtítulo.
 *   - Líneas que empiezan por "- " forman una lista.
 *   - **negrita**, [texto](https://enlace) y direcciones https://… sueltas se convierten en enlaces.
 * Se convierte en bloques y trozos que React pinta escapados: nunca se inyecta HTML.
 */

export type Inline = { type: "text"; text: string } | { type: "bold"; text: string } | { type: "link"; text: string; href: string };

export type Block = { type: "heading"; content: Inline[] } | { type: "paragraph"; content: Inline[] } | { type: "list"; items: Inline[][] };

const inlinePattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(inlinePattern)) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ type: "bold", text: m[1] });
    else if (m[2] !== undefined) out.push({ type: "link", text: m[2], href: m[3] });
    else out.push({ type: "link", text: m[4], href: m[4] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}

export function parseRichText(source: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of source.replace(/\r\n?/g, "\n").split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    let paragraph: string[] = [];
    let list: string[] = [];
    const flush = () => {
      if (paragraph.length) blocks.push({ type: "paragraph", content: parseInline(paragraph.join(" ")) });
      if (list.length) blocks.push({ type: "list", items: list.map(parseInline) });
      paragraph = [];
      list = [];
    };
    for (const line of lines) {
      if (line.startsWith("## ")) {
        flush();
        blocks.push({ type: "heading", content: parseInline(line.slice(3)) });
      } else if (/^[-•]\s+/.test(line)) {
        if (paragraph.length) {
          blocks.push({ type: "paragraph", content: parseInline(paragraph.join(" ")) });
          paragraph = [];
        }
        list.push(line.replace(/^[-•]\s+/, ""));
      } else {
        if (list.length) {
          blocks.push({ type: "list", items: list.map(parseInline) });
          list = [];
        }
        paragraph.push(line);
      }
    }
    flush();
  }
  return blocks;
}
