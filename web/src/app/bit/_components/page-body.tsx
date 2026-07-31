/**
 * Rendert den Fließtext der übernommenen Originalseiten (siehe _data/pages.ts).
 *
 * Zeilenformat:
 *   "## "  Abschnittsüberschrift      "### " Unterüberschrift
 *   "- "   Aufzählungspunkt           "| a | b"  Tabellenzeile (erste = Kopf)
 *   "!img /pfad|Alt"                  sonst: Absatz
 */
export function PageBody({ body }: { body: string }) {
  const lines = body.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const trimmed = (lines[i] ?? "").trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Tabelle: zusammenhängende "|"-Zeilen einsammeln
    if (trimmed.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? "").trim().startsWith("|")) {
        rows.push(
          (lines[i] ?? "")
            .trim()
            .replace(/^\|\s?/, "")
            .split("|")
            .map((c) => c.trim()),
        );
        i++;
      }
      const [head, ...rest] = rows;
      blocks.push(
        <div key={key++} className="my-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[32rem] text-sm">
            {head && (
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  {head.map((c, n) => (
                    <th key={n} scope="col" className="px-4 py-3 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100">
              {rest.map((r, n) => (
                <tr key={n} className="align-top">
                  {r.map((c, m) => (
                    <td key={m} className="px-4 py-2.5 text-slate-700">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Aufzählung
    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trim().startsWith("- ")) {
        items.push((lines[i] ?? "").trim().slice(2).trim());
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-4 space-y-2">
          {items.map((t, n) => (
            <li key={n} className="flex gap-3 leading-relaxed text-slate-700">
              <span
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8]"
                aria-hidden="true"
              />
              <span>{t}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (trimmed.startsWith("!img ")) {
      const [src, alt] = trimmed.slice(5).split("|");
      if (src) {
        blocks.push(
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key++}
            src={src}
            alt={alt?.trim() || ""}
            loading="lazy"
            decoding="async"
            className="my-6 h-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white"
          />,
        );
      }
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-8 text-lg font-semibold text-slate-900">
          {trimmed.slice(4)}
        </h3>,
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="mt-10 text-2xl font-bold tracking-tight text-slate-900">
          {trimmed.slice(3)}
        </h2>,
      );
      i++;
      continue;
    }

    blocks.push(
      <p key={key++} className="mt-4 leading-relaxed text-slate-700">
        {trimmed}
      </p>,
    );
    i++;
  }

  return <div className="max-w-3xl">{blocks}</div>;
}
