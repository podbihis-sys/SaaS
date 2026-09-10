import type { Metadata } from "next";
import { ContentPageEn, contentMetadataEn } from "../../_components/content-page-en";

const SLUG = "shrink-tubing-transparent-clear";

export const metadata: Metadata = contentMetadataEn(SLUG);

export default function Page() {
  return <ContentPageEn slug={SLUG} />;
}
