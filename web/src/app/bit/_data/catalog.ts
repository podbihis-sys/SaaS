// Produktkatalog – moderne Neufassung der Inhalte von bit-gmbh.de (BIT Bierther GmbH).
// Texte und Artikel sind eine zeitgemäße Aufbereitung des öffentlich kommunizierten
// Sortiments. Bilder werden als markenkonforme SVG-Illustrationen gerendert
// (kategorieabhängig), damit die Seite ohne externe Assets auskommt.

export type CategoryId =
  | "schrumpfschlauch"
  | "isolierschlauch"
  | "geflechtschlauch"
  | "wellrohr"
  | "kabelbinder"
  | "konfektion";

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
}

export interface Product {
  slug: string;
  category: CategoryId;
  name: string;
  tagline: string;
  description: string;
  /** Auswählbare Größen – Pflichtauswahl im Warenkorb. */
  sizes: string[];
  /** Bezugseinheit für die Mengenangabe. */
  unit: "Meter" | "Stück" | "Beutel (100 St.)";
  colors?: string[];
  material: string;
  temperature?: string;
  features: string[];
  applications: string[];
}

export const COMPANY = {
  legalName: "BIT Bierther GmbH",
  shortName: "BIT",
  claim: "Schrumpf- & Isolierschlauchtechnik aus einer Hand",
  foundedYear: 1996,
  street: "Dützhofer Str. 75",
  zip: "53913",
  city: "Swisttal-Heimerzheim",
  country: "Deutschland",
  phone: "+49 2254 8409-0",
  fax: "+49 2254 8409-29",
  email: "info@bit-gmbh.de",
  managingDirector: "Frank Bierther",
  register: "Amtsgericht Bonn, HRB 10435",
  hours: "Mo–Fr 8:00–17:00 Uhr",
} as const;

export const CATEGORIES: Category[] = [
  {
    id: "schrumpfschlauch",
    name: "Schrumpfschläuche",
    tagline: "Isolieren, bündeln, abdichten",
    description:
      "Dünn-, mittel- und dickwandige Schrumpfschläuche in Schrumpfverhältnissen von 2:1 bis 4:1 – mit und ohne Innenkleber. Durchmesser von 0,7 bis 150 mm aus Polyolefin, PVC, PET, PVDF, PTFE und FEP.",
  },
  {
    id: "isolierschlauch",
    name: "Isolier- & Glasseideschläuche",
    tagline: "Elektrische Isolation für jede Temperaturklasse",
    description:
      "Spaghetti- und Isolierschläuche aus PVC, Silikon, PTFE und Polyamid sowie Glasseideschläuche mit Silikon-, Acrylharz- oder PUR-Beschichtung für hohe thermische Belastungen.",
  },
  {
    id: "geflechtschlauch",
    name: "Geflecht- & Gewebeschläuche",
    tagline: "Mechanischer Schutz, der mitwächst",
    description:
      "Expandierbare Geflechtschläuche aus Polyamid, Polyester und Polypropylen für Kabelbündelung, Scheuerschutz und ein sauberes Erscheinungsbild von Leitungssträngen.",
  },
  {
    id: "wellrohr",
    name: "Wellrohre & Kabelschutz",
    tagline: "Robuster Schutz für bewegte Leitungen",
    description:
      "Geschlitzte und geschlossene Wellrohre aus Polyamid, Polypropylen und TPE – flexibel, schlagfest und temperaturbeständig für Maschinenbau und Fahrzeugtechnik.",
  },
  {
    id: "kabelbinder",
    name: "Kabelbinder & Befestigung",
    tagline: "Sicher gebündelt – innen wie außen",
    description:
      "Kabelbinder aus Polyamid 6.6, hitzestabilisiert oder UV-beständig, in zahlreichen Längen und Breiten, ergänzt um Halter, Sockel und Befestigungselemente.",
  },
  {
    id: "konfektion",
    name: "Konfektion & Zubehör",
    tagline: "Maßgeschneidert ab Losgröße 1",
    description:
      "Schlauch-Abschnitte und Konfektion nach Zeichnung, individuelle Kennzeichnung sowie Quetsch- und Aderendverbinder – auf sechs Produktionslinien gefertigt.",
  },
];

const SHRINK_SIZES = [
  "1,6 mm", "2,4 mm", "3,2 mm", "4,8 mm", "6,4 mm", "9,5 mm",
  "12,7 mm", "19,1 mm", "25,4 mm", "38,1 mm", "50,8 mm",
];
const SHRINK_COLORS = ["Schwarz", "Transparent", "Rot", "Blau", "Gelb", "Grün", "Weiß", "Gelb-Grün"];

export const PRODUCTS: Product[] = [
  {
    slug: "schrumpfschlauch-duennwandig-2-1",
    category: "schrumpfschlauch",
    name: "Dünnwandiger Schrumpfschlauch 2:1",
    tagline: "Der Allrounder für Isolation & Kennzeichnung",
    description:
      "Strahlenvernetzter Polyolefin-Schrumpfschlauch mit Schrumpfverhältnis 2:1. Die ideale Wahl, wenn der Schlauchdurchmesser nur wenig größer als das Zielobjekt ist – zuverlässig isolierend, flammwidrig und farblich codierbar.",
    sizes: SHRINK_SIZES,
    colors: SHRINK_COLORS,
    unit: "Meter",
    material: "Polyolefin, strahlenvernetzt",
    temperature: "-55 °C bis +125 °C",
    features: ["Schrumpfverhältnis 2:1", "Flammwidrig nach UL 224", "RoHS- & REACH-konform", "8 Standardfarben"],
    applications: ["Aderisolation", "Farbcodierung", "Zugentlastung", "Bündelung dünner Litzen"],
  },
  {
    slug: "schrumpfschlauch-mittelwandig-3-1-kleber",
    category: "schrumpfschlauch",
    name: "Mittelwandiger Schrumpfschlauch 3:1 mit Innenkleber",
    tagline: "Feuchtigkeitsdichte Verbindung per Knopfdruck",
    description:
      "Mittelwandiger Schrumpfschlauch mit thermoplastischem Schmelzkleber. Beim Schrumpfen verschließt der Kleber Hohlräume und schafft eine medien- und feuchtigkeitsdichte Umhüllung – perfekt für den Außeneinsatz.",
    sizes: ["3,0 mm", "4,8 mm", "6,4 mm", "9,0 mm", "12,0 mm", "19,0 mm", "24,0 mm", "39,0 mm", "52,0 mm"],
    colors: ["Schwarz", "Transparent"],
    unit: "Meter",
    material: "Polyolefin mit Schmelzkleber",
    temperature: "-40 °C bis +125 °C",
    features: ["Schrumpfverhältnis 3:1", "Mit Innenkleber", "IP-dichte Versiegelung", "Hohe Abriebfestigkeit"],
    applications: ["Kabelreparatur", "Steckerabdichtung", "Outdoor-Verbindungen", "KFZ-Bordnetze"],
  },
  {
    slug: "schrumpfschlauch-dickwandig-4-1-kleber",
    category: "schrumpfschlauch",
    name: "Dickwandiger Schrumpfschlauch 4:1 mit Kleber",
    tagline: "Maximaler mechanischer & dichtender Schutz",
    description:
      "Dickwandiger Schwerlast-Schrumpfschlauch mit Schrumpfverhältnis 4:1 und Innenkleber. Überbrückt große Durchmesserunterschiede und schützt selbst stark beanspruchte Verbindungen dauerhaft.",
    sizes: ["8 mm", "12 mm", "16 mm", "25 mm", "40 mm", "55 mm", "75 mm", "95 mm", "115 mm"],
    colors: ["Schwarz"],
    unit: "Meter",
    material: "Polyolefin, dickwandig, mit Kleber",
    temperature: "-40 °C bis +110 °C",
    features: ["Schrumpfverhältnis 4:1", "Sehr hohe Wandstärke", "UV-beständig", "Korrosionsschutz"],
    applications: ["Energiekabel", "Sammelschienen", "Erdkabel-Übergänge", "Bahn- & Energietechnik"],
  },
  {
    slug: "schrumpfschlauch-ptfe",
    category: "schrumpfschlauch",
    name: "PTFE-Schrumpfschlauch",
    tagline: "Höchste Temperatur- & Chemikalienbeständigkeit",
    description:
      "Hochleistungs-Schrumpfschlauch aus PTFE für extreme thermische und chemische Anforderungen. Nahezu universell medienbeständig und mit exzellenten dielektrischen Eigenschaften.",
    sizes: ["1,2 mm", "1,6 mm", "2,4 mm", "3,2 mm", "4,8 mm", "6,4 mm", "9,5 mm", "12,7 mm"],
    colors: ["Transparent"],
    unit: "Meter",
    material: "PTFE",
    temperature: "-90 °C bis +260 °C",
    features: ["Schrumpfverhältnis 2:1", "Medienbeständig", "Antihaftend", "Hervorragende Dielektrik"],
    applications: ["Medizintechnik", "Sensorik", "Labor- & Analysetechnik", "Hochtemperaturkabel"],
  },
  {
    slug: "schrumpfschlauch-pvc",
    category: "schrumpfschlauch",
    name: "PVC-Schrumpfschlauch",
    tagline: "Wirtschaftlich isolieren & dekorieren",
    description:
      "Kostengünstiger PVC-Schrumpfschlauch mit glänzender Oberfläche. Vielseitig für Isolation, Bündelung und das Ummanteln von Akkupacks und Griffen einsetzbar.",
    sizes: ["6 mm", "10 mm", "16 mm", "20 mm", "30 mm", "40 mm", "60 mm", "80 mm", "100 mm"],
    colors: ["Schwarz", "Transparent", "Rot", "Blau", "Gelb"],
    unit: "Meter",
    material: "PVC",
    temperature: "-20 °C bis +105 °C",
    features: ["Schrumpfverhältnis 2:1", "Glänzende Oberfläche", "Gute Isolation", "Preiswert"],
    applications: ["Akkupacks", "Griffe & Werkzeuge", "Sammelschienen", "Dekorative Ummantelung"],
  },
  {
    slug: "schrumpfschlauch-pvdf-kynar",
    category: "schrumpfschlauch",
    name: "PVDF-Schrumpfschlauch (Kynar®)",
    tagline: "Dünnwandig, transparent, hochbeständig",
    description:
      "Sehr dünnwandiger, transparenter Schrumpfschlauch aus PVDF. Mechanisch äußerst robust und chemikalienbeständig – ideal als Scheuerschutz und Kennzeichnung mit klarer Durchsicht.",
    sizes: ["1,2 mm", "2,4 mm", "4,8 mm", "6,4 mm", "9,5 mm", "12,7 mm"],
    colors: ["Transparent"],
    unit: "Meter",
    material: "PVDF (Kynar®)",
    temperature: "-55 °C bis +175 °C",
    features: ["Schrumpfverhältnis 2:1", "Extrem dünnwandig", "Hohe Abriebfestigkeit", "Transparent"],
    applications: ["Lötstellenschutz", "Sensorik", "Kennzeichnung", "Luft- & Raumfahrt"],
  },
  {
    slug: "isolierschlauch-pvc",
    category: "isolierschlauch",
    name: "PVC-Isolierschlauch (Spaghetti)",
    tagline: "Klassische Aderisolation",
    description:
      "Weichmacherhaltiger PVC-Isolierschlauch, auch als Spaghettischlauch bekannt. Flexibel, gut bedruckbar und in vielen Farben für die elektrische Isolation und Kennzeichnung verfügbar.",
    sizes: ["0,5 mm", "1,0 mm", "1,5 mm", "2,0 mm", "3,0 mm", "4,0 mm", "5,0 mm", "6,0 mm", "8,0 mm", "10,0 mm"],
    colors: ["Schwarz", "Weiß", "Rot", "Blau", "Gelb", "Grün", "Gelb-Grün", "Transparent"],
    unit: "Meter",
    material: "PVC, weichmacherhaltig",
    temperature: "-15 °C bis +85 °C",
    features: ["Hochflexibel", "Gut bedruckbar", "VDE-konform", "10 Farben"],
    applications: ["Aderisolation", "Schaltschrankbau", "Trafowicklungen", "Kennzeichnung"],
  },
  {
    slug: "isolierschlauch-silikon",
    category: "isolierschlauch",
    name: "Silikon-Isolierschlauch",
    tagline: "Hochtemperaturbeständig & dauerelastisch",
    description:
      "Isolierschlauch aus hochwertigem Silikonkautschuk. Bleibt auch bei dauerhaft hohen Temperaturen flexibel und behält seine hervorragenden elektrischen Isolationseigenschaften.",
    sizes: ["0,5 mm", "1,0 mm", "1,5 mm", "2,0 mm", "3,0 mm", "4,0 mm", "6,0 mm", "8,0 mm", "10,0 mm", "12,0 mm"],
    colors: ["Transparent", "Weiß", "Rot", "Braun"],
    unit: "Meter",
    material: "Silikonkautschuk",
    temperature: "-60 °C bis +180 °C",
    features: ["Dauerelastisch", "Sehr hohe Durchschlagfestigkeit", "Witterungsbeständig", "Physiologisch unbedenklich"],
    applications: ["Beleuchtungstechnik", "Hausgeräte", "Heizelemente", "Medizintechnik"],
  },
  {
    slug: "glasseideschlauch-silikon",
    category: "isolierschlauch",
    name: "Glasseideschlauch, silikonbeschichtet",
    tagline: "Thermischer Schutz bis +180 °C",
    description:
      "Glasfasergeflecht mit Silikonbeschichtung. Vereint mechanische Robustheit der Glasseide mit der Temperatur- und Spannungsfestigkeit des Silikons – bewährt in der Wickel- und Beleuchtungstechnik.",
    sizes: ["1,0 mm", "1,5 mm", "2,0 mm", "2,5 mm", "3,0 mm", "4,0 mm", "5,0 mm", "6,0 mm", "8,0 mm", "10,0 mm"],
    colors: ["Schwarz", "Weiß", "Natur"],
    unit: "Meter",
    material: "Glasseide mit Silikonbeschichtung",
    temperature: "-60 °C bis +180 °C",
    features: ["Klasse F / H", "Hohe Durchschlagfestigkeit", "Mechanisch robust", "Flammwidrig"],
    applications: ["Motorenbau", "Transformatoren", "Beleuchtung", "Heizgeräte"],
  },
  {
    slug: "glasseideschlauch-acrylharz",
    category: "isolierschlauch",
    name: "Glasseideschlauch, acrylharzbeschichtet",
    tagline: "Wirtschaftliche Isolation der Klasse B",
    description:
      "Glasseideschlauch mit Acrylharzbeschichtung für die elektrische Isolation in der Wärmeklasse B. Gute mechanische Eigenschaften zu einem attraktiven Preis.",
    sizes: ["1,0 mm", "1,5 mm", "2,0 mm", "2,5 mm", "3,0 mm", "4,0 mm", "5,0 mm", "6,0 mm", "8,0 mm"],
    colors: ["Natur", "Schwarz"],
    unit: "Meter",
    material: "Glasseide mit Acrylharzbeschichtung",
    temperature: "-30 °C bis +155 °C",
    features: ["Wärmeklasse B/F", "Gut bestückbar", "Formstabil", "Preiswert"],
    applications: ["Spulen & Wicklungen", "Trafobau", "Elektromotoren", "Schaltanlagen"],
  },
  {
    slug: "isolierschlauch-ptfe",
    category: "isolierschlauch",
    name: "PTFE-Isolierschlauch",
    tagline: "Chemisch inert & hitzefest",
    description:
      "Extrudierter PTFE-Schlauch mit hervorragender Temperatur-, Chemikalien- und Spannungsbeständigkeit sowie geringer Reibung – die Premium-Lösung für anspruchsvolle Isolationsaufgaben.",
    sizes: ["0,5 mm", "1,0 mm", "1,5 mm", "2,0 mm", "3,0 mm", "4,0 mm", "5,0 mm", "6,0 mm"],
    colors: ["Transparent", "Natur"],
    unit: "Meter",
    material: "PTFE",
    temperature: "-90 °C bis +260 °C",
    features: ["Universell medienbeständig", "Antihaftend", "Hohe Dielektrik", "Geringe Reibung"],
    applications: ["Analysetechnik", "Medizintechnik", "Sensorleitungen", "Hochtemperaturbereiche"],
  },
  {
    slug: "geflechtschlauch-polyamid-expandierbar",
    category: "geflechtschlauch",
    name: "Geflechtschlauch Polyamid, expandierbar (BIS-GE-PA)",
    tagline: "Abriebfester Kabelschutz, der mitwächst",
    description:
      "Hochflexibler, expandierbarer Geflechtschlauch aus Polyamid-Monofilamenten. Bietet ausgezeichneten mechanischen Schutz, lässt sich dank Längsdehnung leicht montieren und bündelt Leitungen sauber.",
    sizes: ["3 mm", "6 mm", "9 mm", "12 mm", "16 mm", "20 mm", "25 mm", "30 mm", "40 mm", "50 mm"],
    colors: ["Schwarz", "Schwarz-Grau"],
    unit: "Meter",
    material: "Polyamid (Monofilament)",
    temperature: "-50 °C bis +150 °C",
    features: ["Längs dehnbar", "Sehr abriebfest", "Leichte Montage", "Schalldämpfend"],
    applications: ["Kabelbündelung", "Scheuerschutz", "Maschinenbau", "Motorraum"],
  },
  {
    slug: "geflechtschlauch-pet",
    category: "geflechtschlauch",
    name: "Geflechtschlauch PET, expandierbar",
    tagline: "Leicht, flammwidrig, sauber",
    description:
      "Expandierbarer PET-Geflechtschlauch mit glatter Oberfläche. Leicht, flammwidrig und optisch hochwertig – ideal für sichtbare Leitungsstränge in Geräten und Fahrzeugen.",
    sizes: ["2 mm", "4 mm", "6 mm", "8 mm", "10 mm", "15 mm", "20 mm", "25 mm", "30 mm", "40 mm"],
    colors: ["Schwarz", "Grau", "Schwarz-Weiß"],
    unit: "Meter",
    material: "PET (Polyester)",
    temperature: "-50 °C bis +150 °C",
    features: ["Flammwidrig", "Leichtgewicht", "Schneidbar mit Heißmesser", "Hohe Deckung"],
    applications: ["Audio-/HiFi-Kabel", "Heimelektronik", "Fahrzeuginnenraum", "Geräteverkabelung"],
  },
  {
    slug: "wellrohr-polyamid-geschlitzt",
    category: "wellrohr",
    name: "Wellrohr Polyamid, geschlitzt",
    tagline: "Nachträglich montierbarer Kabelschutz",
    description:
      "Geschlitztes Wellrohr aus Polyamid für die nachträgliche Montage über vorhandene Leitungen. Schlagfest, flexibel und beständig gegen Öle und Kraftstoffe.",
    sizes: ["NW 7,5", "NW 10", "NW 13", "NW 17", "NW 23", "NW 29", "NW 36", "NW 48"],
    colors: ["Schwarz"],
    unit: "Meter",
    material: "Polyamid (PA6)",
    temperature: "-40 °C bis +150 °C",
    features: ["Längsgeschlitzt", "Schlagfest", "Öl- & kraftstoffbeständig", "Flammwidrig UL94 V2"],
    applications: ["Maschinenbau", "Fahrzeugtechnik", "Roboterzuführungen", "Anlagenbau"],
  },
  {
    slug: "wellrohr-polypropylen",
    category: "wellrohr",
    name: "Wellrohr Polypropylen, geschlossen",
    tagline: "Leichter, wirtschaftlicher Leitungsschutz",
    description:
      "Geschlossenes PP-Wellrohr für den wirtschaftlichen Schutz von Kabelsträngen. Geringes Gewicht, gute Flexibilität und halogenfreie Materialbasis.",
    sizes: ["NW 7,5", "NW 10", "NW 13", "NW 17", "NW 23", "NW 29", "NW 36"],
    colors: ["Schwarz"],
    unit: "Meter",
    material: "Polypropylen",
    temperature: "-40 °C bis +120 °C",
    features: ["Halogenfrei", "Leichtgewicht", "Flexibel", "Wirtschaftlich"],
    applications: ["Hausgeräte", "Fördertechnik", "Innenraumverkabelung", "Allgemeiner Maschinenbau"],
  },
  {
    slug: "kabelbinder-standard-pa66",
    category: "kabelbinder",
    name: "Kabelbinder Standard, Polyamid 6.6",
    tagline: "Das bewährte Bündelungselement",
    description:
      "Kabelbinder aus hochwertigem Polyamid 6.6 mit feiner Verzahnung und hoher Haltekraft. In zahlreichen Längen und Breiten für nahezu jeden Bündeldurchmesser.",
    sizes: ["2,5 × 100 mm", "2,5 × 160 mm", "3,6 × 140 mm", "3,6 × 200 mm", "4,8 × 200 mm", "4,8 × 300 mm", "7,6 × 370 mm", "9,0 × 450 mm"],
    colors: ["Natur", "Schwarz"],
    unit: "Beutel (100 St.)",
    material: "Polyamid 6.6",
    temperature: "-40 °C bis +85 °C",
    features: ["Hohe Haltekraft", "Feine Verzahnung", "Selbstsichernd", "8 Größen"],
    applications: ["Kabelbündelung", "Montage", "Befestigung", "Schaltschrankbau"],
  },
  {
    slug: "kabelbinder-uv-schwarz",
    category: "kabelbinder",
    name: "Kabelbinder UV-beständig, Schwarz",
    tagline: "Für den dauerhaften Außeneinsatz",
    description:
      "Schwarze, UV-stabilisierte Kabelbinder aus Polyamid 6.6 für den langlebigen Einsatz im Freien und in der Sonne. Witterungs- und alterungsbeständig.",
    sizes: ["3,6 × 200 mm", "4,8 × 200 mm", "4,8 × 300 mm", "7,6 × 370 mm", "9,0 × 450 mm", "9,0 × 760 mm"],
    colors: ["Schwarz (UV)"],
    unit: "Beutel (100 St.)",
    material: "Polyamid 6.6, UV-stabilisiert",
    temperature: "-40 °C bis +85 °C",
    features: ["UV-beständig", "Witterungsstabil", "Hohe Haltekraft", "Outdoor-tauglich"],
    applications: ["Photovoltaik", "Außenanlagen", "Gartenbau", "Fassaden- & Dachtechnik"],
  },
  {
    slug: "schlauch-abschnitte-konfektion",
    category: "konfektion",
    name: "Schlauch-Abschnitte & Konfektion",
    tagline: "Zugeschnitten nach Ihrer Zeichnung",
    description:
      "Wir konfektionieren Schrumpf-, Isolier- und Geflechtschläuche auf Ihre Wunschlänge – ab Losgröße 1. Wählen Sie den gewünschten Abschnitt; Material und Toleranzen klären wir in der Anfrage.",
    sizes: ["Abschnitt 20 mm", "Abschnitt 30 mm", "Abschnitt 50 mm", "Abschnitt 80 mm", "Abschnitt 100 mm", "Sonderlänge nach Zeichnung"],
    unit: "Stück",
    material: "Nach Wahl (Polyolefin, PVC, PTFE, Glasseide …)",
    features: ["Ab Losgröße 1", "Enge Längentoleranzen", "Sechs Produktionslinien", "Schnelle Musterfertigung"],
    applications: ["Serienfertigung", "Lötstellenschutz", "Kit-Sätze", "Vormontage"],
  },
  {
    slug: "kennzeichnung-bedruckung",
    category: "konfektion",
    name: "Individuelle Kennzeichnung & Bedruckung",
    tagline: "Schläuche mit Ihrer Beschriftung",
    description:
      "Bedruckung von Schläuchen mit Texten, Logos, Nummerierungen oder Normhinweisen. Dauerhaft, abriebfest und nach Ihren Vorgaben – ideal für Rückverfolgbarkeit und Branding.",
    sizes: ["Einzeilig", "Mehrzeilig", "Fortlaufende Nummerierung", "Mit Logo"],
    unit: "Meter",
    material: "Auf Trägerschlauch nach Wahl",
    features: ["Abriebfester Druck", "Logos & Normhinweise", "Fortlaufende Nummerierung", "Hohe Lesbarkeit"],
    applications: ["Rückverfolgbarkeit", "Branding", "Schaltschrankkennzeichnung", "Normkonformität"],
  },
  {
    slug: "quetschverbinder",
    category: "konfektion",
    name: "Quetsch- & Aderendverbinder",
    tagline: "Sichere Verbindung & sauberer Abschluss",
    description:
      "Quetschverbinder und Aderendhülsen in gängigen Querschnitten – optional isoliert. Ergänzen die Schrumpf- und Isoliertechnik zur kompletten Verbindungslösung aus einer Hand.",
    sizes: ["0,5 mm²", "0,75 mm²", "1,0 mm²", "1,5 mm²", "2,5 mm²", "4,0 mm²", "6,0 mm²", "10,0 mm²"],
    colors: ["Isoliert (farbcodiert)", "Unisoliert"],
    unit: "Beutel (100 St.)",
    material: "Kupfer, verzinnt",
    features: ["Farbcodiert nach DIN", "Optional isoliert", "Gasdicht verpressbar", "Gängige Querschnitte"],
    applications: ["Schaltschrankbau", "Installationstechnik", "Fahrzeugbau", "Wartung & Reparatur"],
  },
];

export const INDUSTRIES = [
  "Automotive",
  "Elektronik",
  "Maschinenbau",
  "Elektrotechnik",
  "Medizintechnik",
  "Bahn- & Energietechnik",
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getCategory(id: CategoryId): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function productsByCategory(id: CategoryId): Product[] {
  return PRODUCTS.filter((p) => p.category === id);
}
