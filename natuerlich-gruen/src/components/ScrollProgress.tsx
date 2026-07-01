"use client";

import { useEffect, useState } from "react";

/**
 * Dünne Scroll-Fortschrittsleiste am oberen Rand. Rein dekorativ
 * (aria-hidden) und wird bei Bewegungsreduktion ausgeblendet.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEnabled(false);
      return;
    }
    let ticking = false;
    const update = () => {
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (scrollTop / height) * 100 : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-1 bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-moss-400 to-moss-600"
        style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
      />
    </div>
  );
}
