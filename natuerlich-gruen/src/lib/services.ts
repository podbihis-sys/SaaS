/**
 * Leistungen / Galabau-Bereiche. Jede Leistung erhält eine eigene Unterseite
 * unter /leistungen/[slug] (Ausnahme: Naturpools liegen unter /pools).
 *
 * Inhalte 1:1 von den Leistungsseiten auf natuerlichgruen.net übernommen.
 */

export type Service = {
  slug: string;
  title: string;
  subtitle: string;
  short: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: { heading: string; body?: string; list?: string[] }[];
};

export const services: Service[] = [
  {
    slug: "gartenplanung",
    title: "Naturnahe Gartenplanung in Bad Münstereifel",
    subtitle: "Ökologisch, individuell & lebendig",
    short:
      "Durchdachte, ökologische Gartenplanung – vom Erstgespräch bis zum fertigen Konzept.",
    metaTitle: "Gartenplanung Bad Münstereifel | naturnahe Gartenkonzepte",
    metaDescription:
      "Naturnahe, individuelle Gartenplanung in der Eifel. Bioland-zertifiziert – ökologisch, regional abgestimmt und auf Ihre Bedürfnisse zugeschnitten. Bad Münstereifel & Umgebung.",
    intro:
      "Naturnahe Gärten fördern Artenvielfalt, sind pflegeleicht und schaffen echte Lebensräume. Als Bioland-zertifizierter Gartenbaubetrieb gestalten wir in Bad Münstereifel und Umgebung Gärten mit Konzept – ökologisch, regional abgestimmt und auf Ihre Bedürfnisse zugeschnitten.",
    sections: [
      {
        heading: "Unsere Leistungen in der Gartenplanung",
        list: [
          "Individuelle Gartenkonzepte",
          "Heimische & insektenfreundliche Pflanzenauswahl",
          "Integration ökologischer Strukturen",
          "Nachhaltige Materialien & Bauweisen",
          "Persönliche Beratung & Vor-Ort-Analyse",
        ],
      },
      {
        heading: "Ablauf – in 3 Schritten zu Ihrem Naturgarten",
        list: [
          "Erstgespräch und Ortsbegehung",
          "Konzept und Pflanzplanung",
          "Umsetzung mit Partnern oder Eigenleistung",
        ],
      },
    ],
  },
  {
    slug: "gartenbau",
    title: "Naturnaher Garten- und Landschaftsbau in Bad Münstereifel",
    subtitle: "Ökologisch, funktional und dauerhaft schön.",
    short:
      "Klassischer Galabau, verbunden mit naturnaher Gestaltung – wir bauen grün, im doppelten Sinne.",
    metaTitle: "Garten- & Landschaftsbau (Galabau) Bad Münstereifel | Eifel",
    metaDescription:
      "Naturnaher Garten- und Landschaftsbau in der Eifel: Pflaster- & Terrassenbau, Naturstein- & Trockenmauern, Zaunbau, Rasenanlagen, Treppen & Hangbefestigungen – ökologisch und dauerhaft.",
    intro:
      "Nachhaltigkeit beginnt im eigenen Garten: Wir verbinden klassischen Garten- und Landschaftsbau mit naturnaher Gestaltung. Ob private Gärten, Höfe oder Außenanlagen – wir bauen grün. Und zwar im doppelten Sinne.",
    sections: [
      {
        heading: "Was ist naturnaher Garten- und Landschaftsbau?",
        body: "Naturnaher Gartenbau bedeutet nicht Verzicht – sondern bewusstes Gestalten mit der Natur.",
        list: [
          "Heimische Pflanzen statt Exoten",
          "Wasserdurchlässige Beläge statt versiegelter Flächen",
          "Lebensräume statt steriler Ordnung",
        ],
      },
      {
        heading: "Unsere Leistungen im Garten- und Landschaftsbau",
        list: [
          "Pflasterarbeiten & Terrassenbau",
          "Naturstein- & Trockenmauern",
          "Zaunbau & Sichtschutzanlagen",
          "Rasenanlagen & Erdarbeiten",
          "Treppen & Hangbefestigungen",
        ],
      },
    ],
  },
  {
    slug: "natursteinmauern",
    title: "Natursteinmauern aus Bad Münstereifel",
    subtitle: "Ökologisch, stabil und stilvoll gebaut",
    short:
      "Langlebige Naturstein- und Trockenmauern – Struktur, Halt und Lebensraum, ganz ohne Beton.",
    metaTitle: "Natursteinmauern & Trockenmauern Bad Münstereifel | Eifel",
    metaDescription:
      "Natursteinmauern aus Bad Münstereifel: Trockenmauern, Stützmauern, Schichtmauern & Gabionen. Traditionelle Handwerkskunst, ökologische Bauweise – langlebig und insektenfreundlich.",
    intro:
      "Natursteinmauern sind langlebig, stabil und fügen sich harmonisch in jede Gartenlandschaft ein. Als Bioland-zertifizierter Garten- und Landschaftsbaubetrieb in Bad Münstereifel verbinden wir traditionelle Handwerkskunst mit ökologischer Bauweise. Ob Stützmauer, Hangbefestigung oder Sichtschutz: Unsere Natursteinmauern schaffen Struktur, Halt und Lebensräume – ganz ohne Beton, ganz natürlich.",
    sections: [
      {
        heading: "Unsere Mauertypen",
        list: [
          "Trockenmauer (ökologisch & insektenfreundlich)",
          "Naturstein-Stützmauer (mit Mörtel oder als Schwergewichtsmauer)",
          "Schichtmauer aus regionalem Bruchstein",
          "Gabionenmauer mit Natursteinfüllung",
        ],
      },
      {
        heading: "Warum natürlich grün?",
        list: [
          "Einsatz von regionalen und ökologisch unbedenklichen Materialien",
          "Mauern mit Mehrwert: Lebensräume für Tiere & Pflanzen",
          "Planung, Bau & Pflege aus einer Hand",
          "Jahrzehntelange Haltbarkeit ohne Betonfundament (bei Trockenmauern)",
          "Fachgerechte Umsetzung nach landschaftsbaulichen Richtlinien",
        ],
      },
    ],
  },
  {
    slug: "gartenpflege",
    title: "Gartenpflege in Bad Münstereifel",
    subtitle: "Nachhaltig, zuverlässig & naturnah",
    short:
      "Pflege mit Verständnis für Boden, Klima und Pflanze – erhalten, fördern, entwickeln.",
    metaTitle: "Gartenpflege Bad Münstereifel | ökologisch & nachhaltig",
    metaDescription:
      "Nachhaltige, naturnahe Gartenpflege in der Eifel: Rückschnitt, Rasenpflege, Unkrautregulierung & Pflegeberatung – ohne chemisch-synthetische Mittel. Pflegeabo möglich.",
    intro:
      "Ein gepflegter Garten braucht mehr als einen Schnitt – er braucht Verständnis für Boden, Klima und Pflanze. Ob Dauerpflege, Saisonstart oder gezielte Pflegemaßnahmen: Wir erhalten, fördern und entwickeln Ihren Garten mit Blick auf Biodiversität, Standort und Ihre individuellen Wünsche.",
    sections: [
      {
        heading: "Unser Pflegeverständnis",
        list: [
          "Kein Einsatz von chemisch-synthetischen Pflanzenschutzmitteln",
          "Förderung von Bestäubern durch gezielte Pflegemaßnahmen",
          "Standortgerechte Maßnahmen statt standardisierter Rasenkosmetik",
          "Langfristige Entwicklung statt kurzfristigem Aufräumen",
        ],
      },
      {
        heading: "Unsere Pflegeleistungen",
        list: [
          "Regelmäßige Gartenpflege (Pflegeabo möglich)",
          "Rückschnitt von Stauden & Gehölzen",
          "Unkrautregulierung & Mulcharbeiten",
          "Rasenpflege & Nachsaat",
          "Laubarbeiten & Flächenreinigung",
          "Pflegeberatung & Gartenentwicklung",
        ],
      },
    ],
  },
  {
    slug: "dachbegruenung",
    title: "Dachbegrünung in Bad Münstereifel",
    subtitle: "Ökologisch, klimawirksam und langlebig",
    short:
      "Extensive und intensive Gründächer – wasserspeichernd, biodivers und immobilienaufwertend.",
    metaTitle: "Dachbegrünung Bad Münstereifel | ökologisch & klimawirksam",
    metaDescription:
      "Dachbegrünung in der Eifel: extensive & intensive Gründächer nach FLL-Standard, dazu Fassadenbegrünung. Klima- und Wasserschutz, förderfähig – Bioland-zertifiziert.",
    intro:
      "Grüne Dächer sind mehr als ein Trend – sie sind ein aktiver Beitrag zum Klima- und Wasserschutz. Als ökologisch ausgerichteter Garten- und Landschaftsbauer mit Bioland-Zertifizierung planen, bauen und pflegen wir extensive und intensive Dachbegrünungen in Bad Münstereifel und Umgebung. Ob Carport, Garagendach oder Wohnhaus: Wir schaffen lebendige, wasserspeichernde Flächen, die Biodiversität fördern und Ihre Immobilie aufwerten – dauerhaft, funktional und pflegeleicht.",
    sections: [
      {
        heading: "Unsere Leistungen im Bereich Dachbegrünung",
        list: [
          "Beratung & Vorplanung: statische Voraussetzungen, Dachaufbau und Standortfaktoren",
          "Aufbau & Umsetzung fachgerecht nach aktuellem FLL-Standard",
          "Extensive Begrünung mit Sedum, Gräsern und Kräutern",
          "Intensive Begrünung mit Stauden, Gehölzen und Rasenflächen",
          "Pflege & Entwicklungspflege",
        ],
      },
      {
        heading: "Vorteile der Dachbegrünung auf einen Blick",
        list: [
          "Verbesserung des Mikroklimas",
          "Wasserrückhaltung & Entlastung der Kanalisation",
          "Schutz der Dachabdichtung & längere Lebensdauer",
          "Lebensraum für Insekten & Vögel",
          "Förderfähig über kommunale Klimaprogramme",
        ],
      },
      {
        heading: "Fassadenbegrünung – ökologisch und ästhetisch",
        body: "Vertikal grün gedacht: Begrünte Fassaden senken die Oberflächentemperatur, binden Feinstaub und verwandeln kahle Wände in blühende Lebensräume. Wir bieten Beratung, Bau und Pflege von Rankhilfen, Pflanzsystemen und Fassadenmodulen – für Wohnhäuser, Gewerbeobjekte oder Carports. Tipp: Verfolgen Sie stets die aktuellen Fördermöglichkeiten in Ihren Kommunen – das kann sich lohnen, sprechen Sie uns an.",
      },
    ],
  },
  {
    slug: "pflanzenanlagen",
    title: "Pflanzanlagen in Bad Münstereifel",
    subtitle: "Ökologisch sinnvoll, standortgerecht und nachhaltig",
    short:
      "Pflanzen sind das Herz eines lebendigen Gartens – wir planen, pflanzen und pflegen sie.",
    metaTitle: "Pflanzanlagen & Pflanzungen Bad Münstereifel | Naturgarten",
    metaDescription:
      "Bioland-zertifizierte Pflanzanlagen in der Eifel: heimische, pestizidfreie Pflanzen, torffreie Substrate, Staudenbeete, Blühflächen & Hangbegrünung – Lebensräume für Mensch und Tier.",
    intro:
      "Pflanzen sind das Herz eines lebendigen Gartens. Als Bioland-zertifizierter Garten- und Landschaftsbau-Betrieb in Bad Münstereifel planen, pflanzen und pflegen wir Pflanzanlagen, die ökologisch sinnvoll, standortgerecht und nachhaltig sind. Ob kompletter Gartenneubau oder gezielte Bepflanzung einzelner Bereiche – wir gestalten Lebensräume für Menschen, Tiere und Pflanzen.",
    sections: [
      {
        heading: "Warum Pflanzanlagen mit Bioland-Siegel?",
        list: [
          "Verwendung heimischer & pestizidfreier Pflanzen",
          "Torffreie Substrate & ökologische Düngung",
          "Förderung von Insekten- & Vogelvielfalt",
          "Dauerhaft gesunde Pflanzflächen durch naturnahe Pflege",
          "Beratung und Umsetzung durch ein zertifiziertes Bioland-Unternehmen",
        ],
      },
      {
        heading: "Unsere Leistungen im Bereich Pflanzanlagen",
        list: [
          "Individuelle Pflanzplanung – abgestimmt auf Boden, Licht, Klima und Nutzung",
          "Staudenbeete & Wildstaudenflächen – pflegearm und insektenfreundlich",
          "Heimische Gehölze & Sträucher – Hecken und Sichtschutz mit Mehrwert",
          "Blühflächen & Wiesenansaaten – artenreich als Beetalternative",
          "Pflanzung von Bodendeckern & Hangbegrünung – Erosionssicherung & Unkrautunterdrückung",
          "Pflege und Nachsorge – Entwicklungspflege, Schnitt, Nachpflanzung",
        ],
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/** Kurzlabel (Navigation/Karten/Breadcrumb) je Leistung. */
export const serviceNav: Record<string, string> = {
  gartenplanung: "Gartenplanung",
  gartenbau: "Gartenbau",
  natursteinmauern: "Natursteinmauern",
  gartenpflege: "Gartenpflege",
  dachbegruenung: "Dachbegrünung",
  pflanzenanlagen: "Pflanzenanlagen",
};
