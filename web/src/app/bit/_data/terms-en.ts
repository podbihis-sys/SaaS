/**
 * Englische Fassungen der deutschen Katalogbegriffe (Merkmale, Werkstoffe,
 * Kurzzeilen, Zahlenformat) für Produktkarten, Größenauswahl und
 * Produktseiten der EN-Ausgabe. Unbekannte Begriffe bleiben unverändert.
 */

const FEATURE_EN: Record<string, string> = {
  "1000V": "1000 V",
  Abriebfest: "Abrasion-resistant",
  Antiadhäsiv: "Anti-adhesive",
  Aufschießschläuche: "Push-on sleeves",
  Bedruckbar: "Printable",
  Dehnbar: "Expandable",
  Dickwandig: "Thick-wall",
  Dreidornzange: "Three-pin expander pliers",
  Dualschrumpfschlauch: "Dual-wall heat-shrink tubing",
  Dünnwandig: "Thin-wall",
  Edelstahlkabelbinder: "Stainless steel cable ties",
  Elastisch: "Elastic",
  Feuerbeständig: "Fire-resistant",
  Flachgewalzt: "Flattened",
  Flammhemmend: "Flame-retardant",
  Flexibel: "Flexible",
  "Für nachträgliche Montage": "For retrofit installation",
  Gewebe: "Fabric",
  Griffschläuche: "Grip sleeves",
  Halbleitend: "Semi-conductive",
  Halogenfrei: "Halogen-free",
  Heißluftgebläse: "Heat gun",
  "Heißschneidegerät zum thermischen Schneiden von Geflechtschläuchen":
    "Hot knife for thermal cutting of braided sleeves",
  Hitzebeständig: "Heat-resistant",
  "Hoch abriebsfest": "Highly abrasion-resistant",
  "Hohe Biegelastwechselfähigkeit": "High flex-cycle resistance",
  "Hohe Schnittfestigkeit": "High cut resistance",
  "Hohe Temperaturbeständigkeit": "High temperature resistance",
  "Hohe chemische Beständigkeit": "High chemical resistance",
  "Hohe elektrische Isolierung": "High electrical insulation",
  "Hoher mechan. Schutz": "High mechanical protection",
  "Hohes Schrumpfverhältnis": "High shrink ratio",
  "Kabelbinder-Spannwerkzeug": "Cable tie tensioning tool",
  Kabeldriller: "Cable twister",
  Kabeleinziehhilfe: "Cable pulling aid",
  Kaltschrumpfschlauch: "Cold-shrink tubing",
  Kleberbeschichtet: "Adhesive-lined",
  Klebesockel: "Adhesive mounting base",
  Klettbinder: "Hook-and-loop ties",
  Kriechstromfest: "Tracking-resistant",
  Kugelbinder: "Ball-lock ties",
  Kältebeständig: "Cold-resistant",
  "Leichte Ausführung": "Lightweight version",
  Lötverbinder: "Solder connectors",
  Markierschrumpfschlauch: "Marking heat-shrink tubing",
  "Mit Befestigungsöse": "With mounting eyelet",
  "Mit Beschriftungsfeld": "With marking field",
  "Mit Metallzunge": "With metal tongue",
  "Mit Spreizanker": "With expansion anchor",
  Mittelwandig: "Medium-wall",
  Phosphorfrei: "Phosphorus-free",
  Quetschverbinder: "Crimp connectors",
  Schlagfest: "Impact-resistant",
  Schraubsockel: "Screw mounting base",
  "Schrumpf-Aufteilkappe": "Shrinkable breakout boot",
  "Schrumpf-Endkappe": "Shrinkable end cap",
  Schrumpfmanschette: "Shrink sleeve",
  "Schrumpfmuffen-Set": "Shrink splice kit",
  Schrumpfofen: "Shrink oven",
  "Schrumpfschlauch-Drucker": "Heat-shrink tubing printer",
  "Schwer entflammbar": "Flame-retardant",
  "Sehr flexibel": "Very flexible",
  "Sehr hohes Schrumpfverhältnis": "Very high shrink ratio",
  "Sehr widerstandsfähig": "Very durable",
  Selbstverlöschend: "Self-extinguishing",
  Spiralschlauch: "Spiral wrap",
  Säurebeständig: "Acid-resistant",
  "T-Verteiler für Wellrohr": "T-distributor for corrugated conduit",
  "Technische Schläuche": "Technical tubing",
  Temperaturbeständig: "Temperature-resistant",
  "UL-zugelassen": "UL-approved",
  "UV-beständig": "UV-resistant",
  "Ultra-dünnwandig": "Ultra-thin-wall",
  Unbrennbar: "Non-flammable",
  "Universell einsetzbar": "Universally applicable",
  Wiederlösbar: "Releasable",
  "Y-Verteiler für Wellrohr": "Y-distributor for corrugated conduit",
};

const APPROVAL_PARTS: [RegExp, string][] = [
  [/außer transparent/g, "except transparent"],
  [/nur schwarz/g, "black only"],
  [/auf Nachfrage möglich/g, "available on request"],
  [/Brennbarkeit nach/g, "flammability to"],
  [/\bTyp\b/g, "type"],
];

export function featureEn(feature: string): string {
  const hit = FEATURE_EN[feature];
  if (hit) return hit;
  if (feature.startsWith("Zulassung:")) {
    let rest = feature.slice("Zulassung:".length);
    for (const [re, to] of APPROVAL_PARTS) rest = rest.replace(re, to);
    return `Approval:${rest}`;
  }
  return feature;
}

const MATERIAL_EN: Record<string, string> = {
  Carbonfaser: "Carbon fibre",
  "Edelstahl AISI 304 und AISI 316": "Stainless steel AISI 304 and AISI 316",
  Glasfilament: "Glass filament",
  "Glasgewebe mit Acrylic-PU-Harz-Beschichtung": "Fiberglass fabric with acrylic PU resin coating",
  "Glasgewebe mit Polyurethan-Beschichtung": "Fiberglass fabric with polyurethane coating",
  "Glasgewebe mit Silikon Beschichtung": "Fiberglass fabric with silicone coating",
  "Glasseide mit Silikon-Imprägnierung": "Fiberglass with silicone impregnation",
  "Hart-PVC": "Rigid PVC",
  "Polyamid 6.6 HS": "Polyamide 6.6 HS",
  Polyamidgewebe: "Polyamide fabric",
  Polychloroprengummi: "Polychloroprene rubber",
  "Polyester- und Polyolefinfasern": "Polyester and polyolefin fibres",
  "VMQ (Silikon)": "VMQ (silicone)",
  "Verzinntes Kupfer": "Tinned copper",
  "Weich-PVC": "Flexible PVC",
  Silikon: "Silicone",
};

export function materialEn(material: string): string {
  return MATERIAL_EN[material] ?? material;
}

const TAGLINE_WORDS: [RegExp, string][] = [
  [/Durchlauf-Schrumpfgerät/g, "Continuous shrink unit"],
  [/Schrumpfschläuche/g, "heat-shrink tubing"],
  [/Schrumpfschlauch/g, "heat-shrink tubing"],
  [/Isolierschlauch/g, "insulating tubing"],
  [/Glasseidenschlauch/g, "fiberglass sleeve"],
  [/Geflechtschlauch/g, "braided sleeve"],
  [/Wellrohr/g, "corrugated conduit"],
  [/Kabelbinder/g, "cable ties"],
  [/Gummitüllen/g, "Rubber grommets"],
  [/Lötverbinder/g, "Solder connectors"],
  [/Quetschverbinder/g, "Crimp connectors"],
];

/** Kurzzeile „CODE · Werkstoff" → Werkstoff (und deutsche Produktwörter) übersetzen. */
export function taglineEn(tagline: string): string {
  const parts = tagline.split(" · ");
  // Ohne Trenner ist die Kurzzeile oft selbst eine Werkstoffangabe.
  if (parts.length < 2) {
    let whole = materialEn(tagline);
    for (const [re, to] of TAGLINE_WORDS) whole = whole.replace(re, to);
    return whole;
  }
  const last = materialEn(parts[parts.length - 1] ?? "");
  let head = parts.slice(0, -1).join(" · ");
  for (const [re, to] of TAGLINE_WORDS) head = head.replace(re, to);
  return `${head} · ${last}`;
}

/** „-55 °C bis +125 °C" → „-55 °C to +125 °C". */
export function temperatureEn(temperature: string): string {
  return temperature.replace(/\bbis\b/g, "to");
}

/** Dezimalkomma → Punkt, „Stk." → „pcs" (Größen, VPE-Angaben). */
export function numEn(text: string): string {
  return text.replace(/(\d),(\d)/g, "$1.$2").replace(/Stk\./g, "pcs");
}
