import type { Metadata } from "next";
import { ContentPageEn, contentMetadataEn } from "../../../_components/content-page-en";

const SLUG = "about-bit/our-commitment-to-charity";

export const metadata: Metadata = contentMetadataEn(SLUG);

export default function Page() {
  return <ContentPageEn slug={SLUG} />;
}
