"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

/**
 * Surface card with a soft radial highlight that follows the pointer and a
 * hover lift. Used for the services bento and the pricing tiers.
 */
export function GlowCard({
  children,
  className = "",
  glow = "rgba(60,197,201,0.14)",
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const bg = useMotionTemplate`radial-gradient(16rem 16rem at ${x}px ${y}px, ${glow}, transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        x.set(-200);
        y.set(-200);
      }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`group relative overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] ${className}`}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: bg }} />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
