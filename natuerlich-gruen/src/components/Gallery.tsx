/**
 * Arbeitsproben-Galerie. Die finalen Projektfotos liegen aktuell in der
 * WordPress-Mediathek. Sobald die Bild-URLs/Dateien vorliegen, einfach das
 * `items`-Array befüllen (oder an ein CMS anbinden) – Layout und Lazy-Loading
 * funktionieren dann automatisch über next/image.
 *
 * TODO (Inhaltspflege): echte Projektfotos mit beschreibenden Alt-Texten ergänzen.
 */
const items = [
  { label: "Naturnahe Gartengestaltung", tone: "from-moss-200 to-moss-400" },
  { label: "Naturstein & Trockenmauern", tone: "from-anthracite-200 to-anthracite-400" },
  { label: "Schwimmteich / Naturpool", tone: "from-moss-300 to-moss-500" },
  { label: "Staudenbeete & Pflanzungen", tone: "from-moss-100 to-moss-300" },
  { label: "Wege- & Terrassenbau", tone: "from-anthracite-100 to-anthracite-300" },
  { label: "Pflege im Naturgarten", tone: "from-moss-200 to-moss-500" },
];

export default function Gallery() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`relative flex aspect-[4/3] items-end overflow-hidden rounded-organic bg-gradient-to-br ${item.tone} p-4`}
        >
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-anthracite-800">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
