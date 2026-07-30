/**
 * Menüstruktur – übernommen von bit-gmbh.de (Hauptnavigation inkl. Untermenüs).
 * Die Zielpfade zeigen auf die entsprechenden Seiten unter /bit.
 */

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const NAV: NavItem[] = [
  { label: "Home", href: "/bit" },
  {
    label: "Produkte",
    href: "/bit/produkte",
    children: [
      { label: "Schrumpfschlauch", href: "/bit/schrumpfschlauch" },
      { label: "Isolierschlauch", href: "/bit/isolierschlauch" },
      { label: "Silikonschlauch", href: "/bit/silikonschlauch-mit-ul" },
      { label: "Glasseidenschlauch", href: "/bit/glasseidenschlauch" },
      { label: "Geflechtschlauch", href: "/bit/geflechtschlauch" },
      { label: "Wellrohr", href: "/bit/wellrohr" },
      { label: "Kabelbinder", href: "/bit/kabelbinder" },
      { label: "Verarbeitungsgeräte", href: "/bit/verarbeitungsgeraete" },
      { label: "Weitere Produkte", href: "/bit/weitere-produkte" },
    ],
  },
  {
    label: "News",
    href: "/bit/news",
    children: [
      { label: "Schrumpfschlauch Abmessungen", href: "/bit/schrumpfschlauch-abmessungen" },
      { label: "Schrumpfschlauch bedruckt", href: "/bit/schrumpfschlauch-bedruckt" },
      {
        label: "Schrumpfschlauch-Abschnitte / geschnitten",
        href: "/bit/schrumpfschlauch-abschnitte-geschnitten",
      },
      {
        label: "Schrumpfschlauch aus PTFE, FEP und PVDF",
        href: "/bit/schrumpfschlauch-aus-ptfe-fep-kynar",
      },
      {
        label: "Schrumpf- und Isolierschlauch mit UL-Zulassung",
        href: "/bit/schrumpfschlauch-isolierschlauch-mit-ul-224-zulassung",
      },
      { label: "Schrumpfschlauch farbig", href: "/bit/schrumpfschlauch-farbig" },
      { label: "Downloads", href: "/bit/service/downloads" },
    ],
  },
  {
    label: "Branchen",
    href: "/bit/branchen",
    children: [
      {
        label: "Energietechnik / Erneuerbare Energien",
        href: "/bit/branchen/energietechnik-erneuerbare-energien",
      },
      { label: "Automotive", href: "/bit/branchen/automotive" },
      { label: "Hausgeräte", href: "/bit/branchen/hausgeraete" },
      { label: "Medizintechnik", href: "/bit/branchen/medizintechnik" },
      { label: "Maschinen- und Anlagenbau", href: "/bit/branchen/maschinen-und-anlagenbau" },
      {
        label: "Licht- und Beleuchtungstechnik",
        href: "/bit/branchen/licht-und-beleuchtungstechnik",
      },
      { label: "Sicherheitstechnik", href: "/bit/branchen/sicherheitstechnik" },
    ],
  },
  {
    label: "Die BIT",
    href: "/bit/unternehmen",
    children: [
      { label: "Karriere", href: "/bit/karriere" },
      { label: "Firmengeschichte", href: "/bit/die-bit" },
      { label: "Soziales Engagement", href: "/bit/die-bit/soziales-engagement" },
      { label: "Nachhaltigkeit", href: "/bit/nachhaltigkeit" },
      { label: "Qualität & Zertifikate", href: "/bit/qualitaet" },
      { label: "Service", href: "/bit/service" },
      { label: "Glossar", href: "/bit/service/glossar" },
      { label: "Dat sin mir!", href: "/bit/die-bit/dat-sin-mir" },
      { label: "Accueil (FR)", href: "/bit/die-bit/accueil" },
      { label: "Chi siamo (IT)", href: "/bit/die-bit/chi-siamo" },
      { label: "Inicio (ES)", href: "/bit/die-bit/inicio" },
    ],
  },
  { label: "Kontakt", href: "/bit/kontakt" },
];
