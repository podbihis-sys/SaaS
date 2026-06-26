import type { Block } from "@/lib/blog";

/** Rendert die strukturierten Blog-Blöcke als semantisches HTML. */
export default function BlogContent({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-natur">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i}>{block.text}</h2>;
          case "h3":
            return <h3 key={i}>{block.text}</h3>;
          case "ul":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          default:
            return <p key={i}>{block.text}</p>;
        }
      })}
    </div>
  );
}
