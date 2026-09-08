import type { Metadata } from "next";

// Inhalte kommen aus dem CMS und erneuern sich alle 5 Minuten (ISR).
export const revalidate = 300;
import { ContentPage, contentMetadata } from "../../_components/content-page";

const SLUG = "die-bit/soziales-engagement";

export const metadata: Metadata = contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG}
      parent={{ label: "Die BIT", href: "/bit/unternehmen" }} />;
}
