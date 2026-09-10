import type { Metadata } from "next";
import { ContentPageEn, contentMetadataEn } from "../../../_components/content-page-en";

const SLUG = "industrial-sectors/home-and-household-appliances";

export const metadata: Metadata = contentMetadataEn(SLUG);

export default function Page() {
  return <ContentPageEn slug={SLUG} />;
}
