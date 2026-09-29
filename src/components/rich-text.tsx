import { parseRichText, type Inline } from "@/lib/rich-text";

function Inlines({ content }: { content: Inline[] }) {
  return content.map((part, i) => {
    if (part.type === "bold") return <strong key={i}>{part.text}</strong>;
    if (part.type === "link") {
      const external = part.href.startsWith("http");
      return (
        <a
          key={i}
          href={part.href}
          className="break-words text-accent underline underline-offset-4"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {part.text}
        </a>
      );
    }
    return <span key={i}>{part.text}</span>;
  });
}

/** Pinta el texto de una noticia o un recurso (ver el formato en lib/rich-text). */
export function RichText({ source }: { source: string }) {
  return (
    <div className="max-w-3xl space-y-4">
      {parseRichText(source).map((block, i) => {
        if (block.type === "heading")
          return (
            <h2 key={i} className="pt-2 font-display text-2xl font-extrabold">
              <Inlines content={block.content} />
            </h2>
          );
        if (block.type === "list")
          return (
            <ul key={i} className="list-disc space-y-1 pl-6">
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inlines content={item} />
                </li>
              ))}
            </ul>
          );
        return (
          <p key={i}>
            <Inlines content={block.content} />
          </p>
        );
      })}
    </div>
  );
}
