import type { Metadata } from "next";
import { ContentPage, contentMetadata } from "../../_components/content-page";

const SLUG = "branchen/energietechnik-erneuerbare-energien";

export const metadata: Metadata = contentMetadata(SLUG);

export default function Page() {
  return <ContentPage slug={SLUG}
      parent={{ label: "Branchen", href: "/bit/branchen" }} />;
}
