import type { NavItem } from "./navigation";

/**
 * Englische Menüstruktur (/bit/en) – gleicher Aufbau wie das deutsche Menü,
 * Bezeichnungen und Reihenfolge folgen dem englischen Original
 * (bit-gmbh.de/en): Products, Industrial Sectors, Service, About BIT, Contact.
 */
export const NAV_EN: NavItem[] = [
  { label: "Home", href: "/bit/en" },
  {
    label: "Products",
    href: "/bit/en/products",
    children: [
      { label: "Heat-shrink tubing", href: "/bit/en/products/schrumpfschlauch" },
      { label: "Insulating tubing", href: "/bit/en/products/isolierschlauch" },
      { label: "Fiberglass sleeving", href: "/bit/en/products/glasseidenschlauch" },
      { label: "Expandable braided sleeves", href: "/bit/en/products/geflechtschlauch" },
      { label: "Corrugated conduit tubing", href: "/bit/en/products/wellrohr" },
      { label: "Cable ties", href: "/bit/en/products/kabelbinder" },
      { label: "Tools", href: "/bit/en/products/verarbeitungsgeraete" },
      { label: "Other shrink products", href: "/bit/en/products/weitere-schrumpfprodukte" },
      { label: "Miscellaneous products", href: "/bit/en/products/weitere-produkte" },
      { label: "Shrink tubing transparent / clear", href: "/bit/en/shrink-tubing-transparent-clear" },
      { label: "Heat shrink tubing printed", href: "/bit/en/heat-shrink-tubing-printed" },
      { label: "Coloured heat shrink tubing", href: "/bit/en/coloured-heat-shrink-tubing" },
    ],
  },
  {
    label: "Industrial Sectors",
    href: "/bit/en/industrial-sectors",
    children: [
      {
        label: "Power Engineering and Energy Management",
        href: "/bit/en/industrial-sectors/power-engineering-and-energy-management",
      },
      { label: "Automotive", href: "/bit/en/industrial-sectors/automotive" },
      {
        label: "Home and Household Appliances",
        href: "/bit/en/industrial-sectors/home-and-household-appliances",
      },
      {
        label: "Medical Technology and Engineering",
        href: "/bit/en/industrial-sectors/medical-technology-and-engineering",
      },
      {
        label: "Mechanical and Plant Engineering",
        href: "/bit/en/industrial-sectors/mechanical-and-plant-engineering",
      },
      {
        label: "Lighting and Illumination",
        href: "/bit/en/industrial-sectors/lighting-and-illumination",
      },
      {
        label: "Safety Equipment and Engineering",
        href: "/bit/en/industrial-sectors/safety-equipment-and-engineering",
      },
    ],
  },
  {
    label: "Service",
    href: "/bit/en/service",
    children: [
      { label: "Downloads", href: "/bit/en/service/downloads" },
      { label: "Shrink tubing transparent / clear", href: "/bit/en/shrink-tubing-transparent-clear" },
      { label: "Heat shrink tubing printed", href: "/bit/en/heat-shrink-tubing-printed" },
      { label: "Coloured heat shrink tubing", href: "/bit/en/coloured-heat-shrink-tubing" },
    ],
  },
  {
    label: "About BIT",
    href: "/bit/en/about-bit",
    children: [
      { label: "Company History", href: "/bit/en/about-bit" },
      {
        label: "Our commitment to charity",
        href: "/bit/en/about-bit/our-commitment-to-charity",
      },
      { label: "Accueil (FR)", href: "/bit/en/about-bit/accueil" },
      { label: "Chi siamo (IT)", href: "/bit/en/about-bit/chi-siamo" },
      { label: "Inicio (ES)", href: "/bit/en/about-bit/inicio" },
    ],
  },
  { label: "Contact", href: "/bit/en/contact" },
];
