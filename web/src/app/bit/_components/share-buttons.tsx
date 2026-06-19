"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Facebook, Linkedin, Link2, Mail, Share2, Twitter } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";

/** Social-Sharing-Leiste – teilt die aktuelle Seite in sozialen Netzwerken. */
export function ShareButtons({ title = "BIT Bierther GmbH" }: { title?: string }) {
  const pathname = usePathname();
  const url = `${BASE}${pathname}`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const [copied, setCopied] = useState(false);

  const links = [
    { label: "Auf LinkedIn teilen", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: Linkedin },
    { label: "Auf Facebook teilen", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: Facebook },
    { label: "Auf X teilen", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, Icon: Twitter },
    { label: "Per E-Mail teilen", href: `mailto:?subject=${t}&body=${u}`, Icon: Mail },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
        <Share2 className="h-4 w-4" /> Seite teilen:
      </span>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Link kopieren"
        title={copied ? "Kopiert!" : "Link kopieren"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
      >
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}
