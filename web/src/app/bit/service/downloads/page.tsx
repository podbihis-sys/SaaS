import type { Metadata } from "next";
import { ContentPage, contentMetadata } from "../../_components/content-page";

const SLUG = "service/downloads";

export const metadata: Metadata = contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG}
      parent={{ label: "Service", href: "/bit/service" }} />;
}
