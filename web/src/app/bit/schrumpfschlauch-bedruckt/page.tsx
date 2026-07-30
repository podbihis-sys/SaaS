import type { Metadata } from "next";
import { ContentPage, contentMetadata } from "../_components/content-page";

const SLUG = "schrumpfschlauch-bedruckt";

export const metadata: Metadata = contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG} />;
}
