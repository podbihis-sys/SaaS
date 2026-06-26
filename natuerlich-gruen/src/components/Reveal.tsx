"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dezente Einblend-Animation beim Scrollen. Respektiert
 * `prefers-reduced-motion` und blendet ohne JS / bei Bewegungsreduktion
 * sofort sichtbar ein (kein Inhalt geht verloren).
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(24px)",
        transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
