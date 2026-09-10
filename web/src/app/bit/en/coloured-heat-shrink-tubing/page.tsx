import type { Metadata } from "next";
import { ContentPageEn, contentMetadataEn } from "../../_components/content-page-en";

const SLUG = "coloured-heat-shrink-tubing";

export const metadata: Metadata = contentMetadataEn(SLUG);

export default function Page() {
  return <ContentPageEn slug={SLUG} />;
}
