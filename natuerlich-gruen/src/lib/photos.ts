/**
 * Zentrale Zuordnung der echten Projektfotos (von natuerlichgruen.net
 * übernommen, lokal unter /public/img/photos gehostet) zu den Seiten/Sektionen.
 * Die Dateinamen entsprechen den Originalen aus der WordPress-Mediathek.
 */

const P = "/img/photos";

export const photos = {
  // Startseite
  heroHome: `${P}/Startseite_Foto-1.jpg`,
  competence: [
    { src: `${P}/Startseite_Foto-2.jpg`, alt: "Naturnah gestalteter Garten mit heimischen Pflanzen" },
    { src: `${P}/Startseite_Foto-3.jpg`, alt: "Ökologische Gartenpflege im Naturgarten" },
    { src: `${P}/Startseite_Foto-5.jpg`, alt: "Persönliche Beratung im Garten" },
  ],
  // Galabau-Leistungen (Startseite) – passend zu den vier Stichpunkten
  galabau: {
    "Wege- und Terrassenbau": `${P}/Startseite-Foto-4_Wege-und-Terrassenbau.jpg`,
    "Naturstein und Trockenmauern": `${P}/Startseite-Foto-4_Naturstein-und-Trockenmauern.jpg`,
    "Zaun- und Sichtschutzanlagen": `${P}/Startseite-Foto-4_Zaun-und-Sichtschutzanlagen.jpg`,
    Einsaaten: `${P}/Startseite-Foto-4_-Einsaaten-anstelle-von-Rasenflaechen.jpg`,
  } as Record<string, string>,
  pool: `${P}/Schwimmteich_Foto-1.jpg`,

  // Galerie / Arbeitsproben (Projekt-Garten 1–3)
  gallery: [
    { src: `${P}/Projekt-Garten-1-1.jpg`, alt: "Projektgarten – naturnahe Gestaltung" },
    { src: `${P}/Projekt-Garten-1-2.jpg`, alt: "Projektgarten – Pflanzungen und Wege" },
    { src: `${P}/Projekt-Garten-2-1.jpeg`, alt: "Projektgarten – Außenanlage" },
    { src: `${P}/Projekt-Garten-2-2.jpeg`, alt: "Projektgarten – Terrasse und Beete" },
    { src: `${P}/Projekt-Garten-3-1.jpg`, alt: "Projektgarten – Naturgarten" },
    { src: `${P}/Projekt-Garten-3-2.jpg`, alt: "Projektgarten – Gartenanlage" },
    { src: `${P}/Projekt-Garten-1-3.jpg`, alt: "Projektgarten – Detailansicht" },
    { src: `${P}/Projekt-Garten-3-3.jpg`, alt: "Projektgarten – bepflanzter Bereich" },
  ],

  // Pools / Schwimmteiche
  poolsPage: [
    { src: `${P}/Schwimmteich_Foto-1.jpg`, alt: "Schwimmteich in Bad Münstereifel" },
    { src: `${P}/Schwimmteich_Foto-2.jpg`, alt: "Naturpool mit Pflanzenzonen" },
  ],

  // Bioland
  bioland: [
    { src: `${P}/Bioland_Foto-2.jpg`, alt: "Bioland-zertifizierter Naturgarten" },
    { src: `${P}/Bioland_Foto-3.jpg`, alt: "Ökologische Pflanzung im Bioland-Garten" },
    { src: `${P}/Bioland_Foto-1.jpg`, alt: "Naturnaher Garten mit heimischen Arten" },
  ],

  // Über uns
  ueberuns: `${P}/Ueberuns_Foto-1.jpg`,
  ueberuns2: `${P}/Ueber-uns_Foto-2.jpg`,

  // Kontakt
  kontakt: `${P}/Kontakt_Foto-1.jpg`,
} as const;

/** Hero-Foto je Leistungs-Unterseite. */
export const serviceImage: Record<string, string> = {
  gartenplanung: `${P}/Gartenplanung_Foto-1.jpg`,
  gartenbau: `${P}/Gartenbau_Foto-1.jpg`,
  natursteinmauern: `${P}/Natusteinmauern_Foto-1.jpg`,
  gartenpflege: `${P}/Gartenpflege_Foto-1.jpg`,
  dachbegruenung: `${P}/Dachbegruenung_Foto-1.jpg`,
  pflanzenanlagen: `${P}/Bepflanzung_Foto-1.jpg`,
};

/** Beitragsbild je Blog-Slug. */
export const blogImage: Record<string, string> = {
  "pflege-im-naturgarten": `${P}/Gartenpflege_Foto-3.jpg`,
  "pflanzenauswahl-im-naturgarten": `${P}/Bepflanzung_Foto-1.jpg`,
  "typische-fruehjahrsarbeiten-im-naturgarten": `${P}/Startseite-Foto-4_-Einsaaten-anstelle-von-Rasenflaechen.jpg`,
  "naturnaher-garten-was-jetzt-sinnvoll-ist": `${P}/Bioland_Foto-2.jpg`,
  "nachhaltige-gartengestaltung-region-euskirchen": `${P}/Startseite_Foto-3.jpg`,
};
