import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "adriawebcode – Web Design Agency",
    short_name: "adriawebcode",
    description:
      "Web design agency for the DACH and Adriatic region. Websites, shops and SEO in 5 languages.",
    start_url: "/",
    display: "browser",
    background_color: "#050a1c",
    theme_color: "#050a1c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
