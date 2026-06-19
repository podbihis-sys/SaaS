// AUTO-GENERIERT aus bit-gmbh.de (Tabelle „VPE (Stück)" – Kabelbinder etc.).
// Pro Größe (Länge × Breite) die Stückzahl pro Gebinde. Bestellung nur in ganzen Gebinden.
// Nicht von Hand editieren – Scraper erneut ausführen.

export interface PackVariant {
  /** Anzeigelabel, z. B. "200 × 3,6 mm". */
  label: string;
  /** Länge in mm. */
  laenge: number;
  /** Breite in mm. */
  breite?: number;
  /** Stück pro (ganzem) Gebinde. */
  stueckPerPack: number;
  /** Original-VPE-Text, z. B. "100". */
  vpe: string;
  /** Hersteller-Typbezeichnung. */
  typ?: string;
}

/** Slug → Gebinde-Varianten (Stückware wie Kabelbinder). */
export const PACKS: Record<string, PackVariant[]> = {
  "edelstahlkabelbinder-gtme-kabelbinder-aus-edelstahl": [
    { label: "100 × 4,6 mm", laenge: 100.0, breite: 4.6, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-100STC" },
    { label: "100 × 8 mm", laenge: 100.0, breite: 8.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-100LHDC" },
    { label: "150 × 4,6 mm", laenge: 150.0, breite: 4.6, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-150STC" },
    { label: "150 × 8 mm", laenge: 150.0, breite: 8.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-150LHDC" },
    { label: "200 × 4,6 mm", laenge: 200.0, breite: 4.6, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-200STC" },
    { label: "200 × 8 mm", laenge: 200.0, breite: 8.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-200LHDC" },
    { label: "200 × 13 mm", laenge: 200.0, breite: 13.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-200EHDC" },
    { label: "260 × 13 mm", laenge: 260.0, breite: 13.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-260EHDC" },
    { label: "360 × 4,6 mm", laenge: 360.0, breite: 4.6, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-360STC" },
    { label: "360 × 8 mm", laenge: 360.0, breite: 8.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-360LHDC" },
    { label: "360 × 13 mm", laenge: 360.0, breite: 13.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-360EHDC" },
    { label: "520 × 4,6 mm", laenge: 520.0, breite: 4.6, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-520STC" },
    { label: "520 × 8 mm", laenge: 520.0, breite: 8.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-520LHDC" },
    { label: "520 × 13 mm", laenge: 520.0, breite: 13.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-520EHDC" },
    { label: "680 × 4,6 mm", laenge: 680.0, breite: 4.6, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-680STC" },
    { label: "680 × 8 mm", laenge: 680.0, breite: 8.0, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-680LHDC" },
    { label: "680 × 13 mm", laenge: 680.0, breite: 13.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "GTME-680EHD" },
    { label: "840 × 4,6 mm", laenge: 840.0, breite: 4.6, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-840STC" },
    { label: "840 × 8 mm", laenge: 840.0, breite: 8.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "GTME-840LHD" },
    { label: "840 × 13 mm", laenge: 840.0, breite: 13.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "GTME-840EHD" },
    { label: "1000 × 4,6 mm", laenge: 1000.0, breite: 4.6, stueckPerPack: 50, vpe: "50/100 Stk.", typ: "GTME-1000STC" },
    { label: "1000 × 8 mm", laenge: 1000.0, breite: 8.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "GTME-1000LHD" },
    { label: "1000 × 13 mm", laenge: 1000.0, breite: 13.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "GTME-1000EHD" },
  ],
  "gt": [
    { label: "82 × 2,5 mm", laenge: 82.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-80MC" },
    { label: "94 × 2,5 mm", laenge: 94.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-90MC" },
    { label: "100 × 2,5 mm", laenge: 100.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-100MC" },
    { label: "121 × 4,8 mm", laenge: 121.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-120STC" },
    { label: "122 × 2,5 mm", laenge: 122.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-120MC" },
    { label: "143 × 3,6 mm", laenge: 143.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-140IC" },
    { label: "150 × 3,6 mm", laenge: 150.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-150IC" },
    { label: "151 × 7,6 mm", laenge: 151.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-150LHDC" },
    { label: "160 × 2,5 mm", laenge: 160.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-160MC" },
    { label: "160 × 4,8 mm", laenge: 160.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-160STC" },
    { label: "179 × 4,8 mm", laenge: 179.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-180STC" },
    { label: "192 × 4,8 mm", laenge: 192.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-190STC" },
    { label: "201 × 7,6 mm", laenge: 201.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-200LHDC" },
    { label: "202 × 2,5 mm", laenge: 202.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-200MC" },
    { label: "202 × 3,6 mm", laenge: 202.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-200IC" },
    { label: "202 × 4,8 mm", laenge: 202.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-200STC" },
    { label: "250 × 2,8 mm", laenge: 250.0, breite: 2.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-250MC" },
    { label: "250 × 7,6 mm", laenge: 250.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-250LHDC" },
    { label: "251 × 3,6 mm", laenge: 251.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-250IC" },
    { label: "251 × 4,8 mm", laenge: 251.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-250STC" },
    { label: "280 × 4,8 mm", laenge: 280.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-280STC" },
    { label: "300 × 2,8 mm", laenge: 300.0, breite: 2.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-300MC" },
    { label: "300 × 4,8 mm", laenge: 300.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-300STC" },
    { label: "302 × 7,6 mm", laenge: 302.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-300LHDC" },
    { label: "303 × 3,6 mm", laenge: 303.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-300IC" },
    { label: "338 × 7,6 mm", laenge: 338.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-340LHDC" },
    { label: "366 × 7,6 mm", laenge: 366.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-370LHDC" },
    { label: "370 × 4,8 mm", laenge: 370.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-370STC" },
    { label: "371 × 3,6 mm", laenge: 371.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-370IC" },
    { label: "391 × 4,8 mm", laenge: 391.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-390STC" },
    { label: "430 × 4,8 mm", laenge: 430.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-430STC" },
    { label: "430 × 12,7 mm", laenge: 430.0, breite: 12.7, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-430EHDC" },
    { label: "433 × 9 mm", laenge: 433.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-430HDC" },
    { label: "452 × 7,6 mm", laenge: 452.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-450LHDC" },
    { label: "482 × 12,7 mm", laenge: 482.0, breite: 12.7, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-480EHDC" },
    { label: "527 × 9 mm", laenge: 527.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-530HDC" },
    { label: "530 × 4,8 mm", laenge: 530.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-530STC" },
    { label: "535 × 7,6 mm", laenge: 535.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-530LHDC" },
    { label: "580 × 12,7 mm", laenge: 580.0, breite: 12.7, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-580EHDC" },
    { label: "586 × 9 mm", laenge: 586.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-590HDC" },
    { label: "615 × 7,6 mm", laenge: 615.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-610LHDC" },
    { label: "632 × 9 mm", laenge: 632.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-610HDC" },
    { label: "708 × 9 mm", laenge: 708.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-710HDC" },
    { label: "715 × 7,6 mm", laenge: 715.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-710LHDC" },
    { label: "728 × 12,7 mm", laenge: 728.0, breite: 12.7, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-730EHDC" },
    { label: "750 × 7,5 mm", laenge: 750.0, breite: 7.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-750HDC" },
    { label: "768 × 9 mm", laenge: 768.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-770HDC" },
    { label: "812 × 9 mm", laenge: 812.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-810HDC" },
    { label: "877 × 12,7 mm", laenge: 877.0, breite: 12.7, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-880EHDC" },
    { label: "908 × 9 mm", laenge: 908.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-910HDC" },
    { label: "940 × 9 mm", laenge: 940.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-940HDC" },
    { label: "1018 × 9 mm", laenge: 1018.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-1020HDC" },
    { label: "1025 × 12,7 mm", laenge: 1025.0, breite: 12.7, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-1030EHDC" },
    { label: "1065 × 9 mm", laenge: 1065.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-1070HDC" },
  ],
  "gt-ht-hitzebestaendige-kabelbinder": [
    { label: "140 × 3,6 mm", laenge: 140.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-HT140IBC" },
    { label: "150 × 3,6 mm", laenge: 150.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-HT150IBC" },
    { label: "200 × 3,6 mm", laenge: 200.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-HT200IBC" },
    { label: "250 × 3,6 mm", laenge: 250.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-HT250IBC" },
    { label: "300 × 3,6 mm", laenge: 300.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT-HT300IBC" },
  ],
  "kabelbinder-gt-mz-mit-metallzunge": [
    { label: "98 × 2,5 mm", laenge: 98.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 98 M" },
    { label: "140 × 3,5 mm", laenge: 140.0, breite: 3.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 140 I" },
    { label: "186 × 4,5 mm", laenge: 186.0, breite: 4.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 186 ST" },
    { label: "200 × 2,5 mm", laenge: 200.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 200 M" },
    { label: "200 × 3,5 mm", laenge: 200.0, breite: 3.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 200 I" },
    { label: "220 × 7,5 mm", laenge: 220.0, breite: 7.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 220 HD" },
    { label: "280 × 3,5 mm", laenge: 280.0, breite: 3.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 280 I" },
    { label: "290 × 4,5 mm", laenge: 290.0, breite: 4.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 290 ST" },
    { label: "360 × 4,5 mm", laenge: 360.0, breite: 4.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 360 ST" },
    { label: "360 × 7,5 mm", laenge: 360.0, breite: 7.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT MZ 360 HD" },
  ],
  "kabelbinder-gt-pp": [
    { label: "100 × 2,5 mm", laenge: 100.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT PP - 100" },
    { label: "140 × 3,6 mm", laenge: 140.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT PP - 140" },
    { label: "200 × 4,8 mm", laenge: 200.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT PP - 200" },
    { label: "300 × 4,8 mm", laenge: 300.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT PP - 300" },
    { label: "370 × 4,8 mm", laenge: 370.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT PP - 370" },
  ],
  "kabelbinder-gt-soft": [
    { label: "180 × 7 mm", laenge: 180.0, breite: 7.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "180 x 7" },
    { label: "260 × 7 mm", laenge: 260.0, breite: 7.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "260 x 7" },
    { label: "260 × 11 mm", laenge: 260.0, breite: 11.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "260 x 11" },
    { label: "340 × 11 mm", laenge: 340.0, breite: 11.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "340 x 11" },
    { label: "580 × 28 mm", laenge: 580.0, breite: 28.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "580 x 28" },
    { label: "880 × 28 mm", laenge: 880.0, breite: 28.0, stueckPerPack: 50, vpe: "50 Stk.", typ: "880 x 28" },
  ],
  "kabelbinder-gtm": [
    { label: "151 × 3,6 mm", laenge: 151.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GTM-150IC" },
    { label: "202 × 4,8 mm", laenge: 202.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GTM-200STC" },
    { label: "203 × 7,6 mm", laenge: 203.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GTM-200LHDC" },
    { label: "305 × 7,6 mm", laenge: 305.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GTM-300LHDC" },
    { label: "319 × 4,8 mm", laenge: 319.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GTM-300STC" },
    { label: "380 × 7,6 mm", laenge: 380.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GTM-380LHDC" },
  ],
  "kabelbinder-gtsb": [
    { label: "365 × 7 mm", laenge: 365.0, breite: 7.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GTSB-360" },
    { label: "422 × 7 mm", laenge: 422.0, breite: 7.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GTSB-420" },
  ],
  "kabelbinder-uv-bestaendig": [
    { label: "100 × 2,5 mm", laenge: 100.0, breite: 2.5, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT UV - 100 MBC" },
    { label: "143 × 3,6 mm", laenge: 143.0, breite: 3.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT UV - 140 IBC" },
    { label: "202 × 4,8 mm", laenge: 202.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT UV - 200 STBC" },
    { label: "300 × 4,8 mm", laenge: 300.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT UV - 300 STBC" },
    { label: "366 × 7,6 mm", laenge: 366.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT UV - 370 LHDBC" },
    { label: "370 × 4,8 mm", laenge: 370.0, breite: 4.8, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT UV - 370 STBC" },
    { label: "527 × 9 mm", laenge: 527.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT UV - 530 HDBC" },
    { label: "535 × 7,6 mm", laenge: 535.0, breite: 7.6, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT UV - 530 LHDBC" },
    { label: "708 × 9 mm", laenge: 708.0, breite: 9.0, stueckPerPack: 100, vpe: "100 Stk.", typ: "GT UV - 710 HDBC" },
  ],
};

export function getPacks(slug: string): PackVariant[] | undefined {
  return PACKS[slug];
}
