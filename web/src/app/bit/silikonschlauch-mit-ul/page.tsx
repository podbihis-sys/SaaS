import type { Metadata } from "next";
import { ContentPage, contentMetadata } from "../_components/content-page";

const SLUG = "silikonschlauch-mit-ul";

export const metadata: Metadata = contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG} />;
}
