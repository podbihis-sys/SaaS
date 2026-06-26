/**
 * Leistungen / Galabau-Bereiche. Jede Leistung erhält eine eigene Unterseite
 * unter /leistungen/[slug] (Ausnahme: Naturpools liegen unter /pools).
 */

export type Service = {
  slug: string;
  title: string;
  short: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: { heading: string; body: string; list?: string[] }[];
  href?: string; // abweichender Pfad (z. B. Pools)
};

export const services: Service[] = [
  {
    slug: "gartenplanung",
    title: "Gartenplanung",
    short:
      "Durchdachte, ökologische Gartenplanung – vom ersten Standortverständnis bis zum fertigen Konzept.",
    metaTitle: "Gartenplanung Bad Münstereifel | naturnahe Gartenkonzepte",
    metaDescription:
      "Naturnahe, standortgerechte Gartenplanung in der Eifel. Wir planen Gärten, die mit dem Standort arbeiten – ökologisch durchdacht für Bad Münstereifel, Mechernich & Euskirchen.",
    intro:
      "Eine gute Gartenplanung beginnt nicht mit der Pflanze und auch nicht mit dem ersten Spatenstich, sondern mit dem Verstehen des Ortes. Wir planen Gärten so, dass sie mit dem Standort arbeiten – nicht gegen ihn.",
    sections: [
      {
        heading: "Planung als langfristiger Prozess",
        body: "Nachhaltige Gartengestaltung ist kein kurzfristiges Projekt. Wir planen Gärten so, dass sie sich über Jahre entwickeln dürfen – mit Freiräumen für Veränderung und einer Pflege, die von Anfang an mitgedacht wird.",
        list: [
          "Standortanalyse: Boden, Wasser, Licht und Mikroklima",
          "Konzept, das nicht alles auf einmal umsetzt",
          "Freiräume für spätere Entwicklung",
          "Pflege und Nutzung von Beginn an eingeplant",
        ],
      },
      {
        heading: "Vom Erstgespräch bis zur Umsetzung",
        body: "Wir begleiten Sie von der Erstberatung bis zur Umsetzung individueller Gartenkonzepte. Profitieren Sie von unserer ökologischen Expertise und maßgeschneiderten Lösungen für naturnahe Gärten.",
      },
    ],
  },
  {
    slug: "gartenbau",
    title: "Gartenbau",
    short:
      "Klassischer Galabau mit Kreativität und Erfahrung – solide, funktional und naturnah.",
    metaTitle: "Garten- & Landschaftsbau (Galabau) Bad Münstereifel | Eifel",
    metaDescription:
      "Garten- und Landschaftsbau in der Eifel: Wege, Terrassen, Trockenmauern, Zaun- und Sichtschutzanlagen sowie Einsaaten – solide, funktional und naturnah.",
    intro:
      "Ob Wege, Terrassen, Mauern oder Rasenflächen – wir verbinden klassisches Galabau-Handwerk mit ökologischer Verantwortung. Mit hochwertigen, langlebigen Materialien gestalten wir Außenanlagen, die sowohl funktional als auch natürlich wirken. Regional, zuverlässig und mit Liebe zum Detail.",
    sections: [
      {
        heading: "Unsere Leistungen im Galabau",
        body: "Solide Handwerksarbeit ist die Grundlage für jeden naturnahen Garten. Wir setzen auf langlebige, regionale Materialien.",
        list: [
          "Wege- und Terrassenbau",
          "Naturstein und Trockenmauern",
          "Zaun- und Sichtschutzanlagen",
          "Einsaaten",
        ],
      },
    ],
  },
  {
    slug: "natursteinmauern",
    title: "Natursteinmauern",
    short:
      "Naturstein- und Trockenmauern als langlebige, lebendige Strukturelemente im Garten.",
    metaTitle: "Natursteinmauern & Trockenmauern | naturnaher Galabau Eifel",
    metaDescription:
      "Naturstein- und Trockenmauern aus regionalem Material: langlebig, ästhetisch und wertvoller Lebensraum. Fachgerecht gebaut in Bad Münstereifel und Umgebung.",
    intro:
      "Naturstein- und Trockenmauern sind weit mehr als reine Begrenzungen. Fachgerecht gesetzt sind sie langlebige Gestaltungselemente und gleichzeitig wertvoller Lebensraum für zahlreiche Tiere und Pflanzen.",
    sections: [
      {
        heading: "Handwerk mit regionalem Stein",
        body: "Wir arbeiten bevorzugt mit hochwertigen, langlebigen Materialien aus der Region. Trockenmauern entstehen ohne Mörtel – ihre Fugen werden zum Rückzugsort für Eidechsen, Insekten und Mauerpflanzen.",
        list: [
          "Trockenmauern ohne Mörtel",
          "Hang- und Stützmauern",
          "Beeteinfassungen und Sitzmauern",
          "Regionale Natursteine",
        ],
      },
    ],
  },
  {
    slug: "gartenpflege",
    title: "Gartenpflege",
    short:
      "Umweltfreundliche Gartenpflege – beobachten, verstehen, gezielt eingreifen.",
    metaTitle: "Gartenpflege Bad Münstereifel | ökologisch & nachhaltig",
    metaDescription:
      "Ökologische Gartenpflege in der Eifel: vom biologischen Gehölzschnitt bis zur Erhaltung der Artenvielfalt. Weniger Eingriffe, mehr Stabilität – zuverlässig und lokal.",
    intro:
      "Pflege bedeutet für uns nicht, möglichst viel zu machen. Pflege bedeutet: beobachten, verstehen, gezielt eingreifen. Gerade im Naturgarten ist Zurückhaltung oft der entscheidende Faktor.",
    sections: [
      {
        heading: "Was wir unter sinnvoller Pflege verstehen",
        body: "Viele Bereiche entwickeln sich stabiler, wenn Pflanzen Zeit bekommen, Böden möglichst wenig gestört werden und natürliche Abläufe zugelassen werden. Das bedeutet nicht, den Garten sich selbst zu überlassen – sondern Eingriffe bewusster zu setzen und den richtigen Zeitpunkt dafür zu wählen.",
        list: [
          "Biologischer Gehölz- und Staudenschnitt",
          "Standortgerechte, abgestimmte Pflege statt ständiger Eingriffe",
          "Erhalt von Strukturen und Lebensräumen",
          "Langfristige Begleitung über das Gartenjahr",
        ],
      },
      {
        heading: "Pflege verändert sich über das Jahr",
        body: "Pflege ist nicht in jeder Jahreszeit gleich. Im Frühjahr geht es um Beobachtung und behutsame Entwicklung, im Sommer um den sinnvollen Einsatz von Wasser, im Herbst um den Erhalt von Rückzugsorten – und im Winter häufig darum, bewusst nicht zu viel zu tun.",
      },
    ],
  },
  {
    slug: "dachbegruenung",
    title: "Dachbegrünung",
    short:
      "Ökologische Dachbegrünung für mehr Biodiversität, Kühlung und Wasserrückhalt.",
    metaTitle: "Dachbegrünung Eifel | ökologisch & klimafreundlich",
    metaDescription:
      "Naturnahe Dachbegrünung in der Region Euskirchen: speichert Wasser, kühlt die Umgebung und schafft Lebensraum. Fachgerecht geplant und umgesetzt.",
    intro:
      "Begrünte Dächer schaffen Lebensraum, wo sonst versiegelte Flächen wären. Sie speichern Regenwasser, kühlen ihre Umgebung und leisten einen wichtigen Beitrag zur Biodiversität – gerade in Zeiten zunehmender Hitze und Starkregen.",
    sections: [
      {
        heading: "Naturnahe Dächer mit Mehrwert",
        body: "Wir planen und realisieren extensive Dachbegrünungen mit standortgerechten, trockenheitsverträglichen Pflanzen. So entstehen pflegeleichte, lebendige Flächen, die mit dem Klima arbeiten.",
        list: [
          "Wasser speichern und Starkregen abpuffern",
          "Umgebung kühlen",
          "Lebensraum für Insekten schaffen",
          "Geringer Pflegeaufwand",
        ],
      },
    ],
  },
  {
    slug: "pflanzenanlagen",
    title: "Pflanzenanlagen",
    short:
      "Standortgerechte Pflanzungen für mehr Biodiversität und blühende Vielfalt.",
    metaTitle: "Pflanzenanlagen & Pflanzungen | naturnaher Garten Eifel",
    metaDescription:
      "Naturnahe Pflanzanlagen mit heimischen, standortgerechten Arten. Lebensraum für Bienen, Schmetterlinge und Vögel – stabil, pflegeleicht und biodivers.",
    intro:
      "Wir planen und bauen naturnahe Pflanzanlagen, die heimische Arten fördern und Lebensraum für Bienen, Schmetterlinge und Vögel bieten. Unsere nachhaltigen Gartenkonzepte stärken lokale Ökosysteme und sorgen für blühende Vielfalt direkt vor Ihrer Haustür.",
    sections: [
      {
        heading: "Pflanzen vom Standort her denken",
        body: "Für uns beginnt Pflanzenauswahl nicht mit der Frage „Was gefällt?“, sondern mit „Was funktioniert hier langfristig?“. Auf Grundlage von Bodenbeschaffenheit, Wasserverfügbarkeit, Lichtverhältnissen und Mikroklima wählen wir Pflanzen, die sich natürlich entwickeln können.",
        list: [
          "Heimische und standortgerechte Arten",
          "Robuste Stauden und Gehölze",
          "Stabilere Entwicklung, geringerer Pflegeaufwand",
          "Mehr Lebensraum für Tiere",
        ],
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
