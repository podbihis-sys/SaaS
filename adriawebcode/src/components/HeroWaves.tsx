"use client";

import { useEffect, useRef } from "react";

const INK = "14, 75, 90"; // tiefsee

/**
 * The swell profile: shallow, faint lines near the surface (top), tighter,
 * darker and heavier swell toward the deep-sea band below. `f` is the
 * vertical position as a fraction of the canvas height.
 */
const LINES = [
  { f: 0.1, amp: 9, alpha: 0.1, phase: 0.0 },
  { f: 0.26, amp: 12, alpha: 0.13, phase: 1.3 },
  { f: 0.4, amp: 15, alpha: 0.16, phase: 2.6 },
  { f: 0.52, amp: 18, alpha: 0.19, phase: 3.9 },
  { f: 0.62, amp: 20, alpha: 0.22, phase: 5.2 },
  { f: 0.71, amp: 22, alpha: 0.25, phase: 0.7 },
  { f: 0.785, amp: 23, alpha: 0.28, phase: 2.0 },
  { f: 0.85, amp: 22, alpha: 0.31, phase: 3.3 },
  { f: 0.905, amp: 20, alpha: 0.34, phase: 4.6 },
  { f: 0.95, amp: 17, alpha: 0.37, phase: 5.9 },
  { f: 0.985, amp: 13, alpha: 0.4, phase: 1.1 },
];

const SEGMENT = 10; // px between sampled points on a line
const CURSOR_LIFT = 38; // how far lines bow away around the pointer
const CURSOR_RADIUS_X = 160;
const CURSOR_RADIUS_Y = 140;

/**
 * Living water surface behind the hero headline: layered travelling sine
 * swells per depth line, drawn on a 2D canvas, gently deformed around the
 * pointer. Decorative only — pauses off-screen, renders a single static
 * frame under prefers-reduced-motion.
 */
export function HeroWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    // Pointer position in canvas space; parked far away when absent.
    const cursor = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 };

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 1.5;
      if (reduced) draw(start);
    }

    function draw(now: number) {
      if (!ctx) return;
      const t = (now - start) / 1000;
      cursor.x += (cursor.targetX - cursor.x) * 0.09;
      cursor.y += (cursor.targetY - cursor.y) * 0.09;
      ctx.clearRect(0, 0, width, height);

      for (const line of LINES) {
        const baseY = line.f * height;
        // Pointer influence fades with vertical distance from the line.
        const dy = baseY - cursor.y;
        const liftRow =
          CURSOR_LIFT * Math.exp(-(dy * dy) / (2 * CURSOR_RADIUS_Y * CURSOR_RADIUS_Y));

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${INK}, ${line.alpha})`;
        for (let x = -SEGMENT; x <= width + SEGMENT; x += SEGMENT) {
          // Two travelling swells running against each other read as water.
          const swell =
            Math.sin(x * 0.0075 + t * 0.8 + line.phase) * 0.62 +
            Math.sin(x * 0.019 - t * 1.3 + line.phase * 1.7) * 0.38;
          const dx = x - cursor.x;
          const lift =
            liftRow * Math.exp(-(dx * dx) / (2 * CURSOR_RADIUS_X * CURSOR_RADIUS_X));
          const y = baseY + swell * line.amp - lift;
          if (x === -SEGMENT) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    function loop(now: number) {
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (reduced) {
      draw(start);
      return () => ro.disconnect();
    }

    // Only animate while the hero is actually on screen.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor.targetX = event.clientX - rect.left;
      cursor.targetY = event.clientY - rect.top;
    };
    const onLeave = () => {
      cursor.targetX = -9999;
      cursor.targetY = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
