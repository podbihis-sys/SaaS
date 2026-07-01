"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "up" | "down" | "left" | "right" | "scale" | "fade";

const initialTransform: Record<Variant, string> = {
  up: "translateY(28px)",
  down: "translateY(-28px)",
  left: "translateX(32px)",
  right: "translateX(-32px)",
  scale: "scale(0.94)",
  fade: "none",
};

/**
 * Dezente Einblend-Animation beim Scrollen (Opacity + Transform, GPU-freundlich).
 * Respektiert `prefers-reduced-motion` und blendet ohne JS / bei
 * Bewegungsreduktion sofort sichtbar ein (kein Inhalt geht verloren).
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
  as?: React.ElementType;
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
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : initialTransform[variant],
        transition:
          "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
