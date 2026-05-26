"use client";

import { useEffect } from "react";

/**
 * Lightweight scroll parallax driver. Reads `data-parallax="X"` (a
 * speed multiplier — positive moves with scroll, negative against)
 * and writes the resulting translate into a CSS variable
 * `--parallax-y` on that element so component CSS can pick it up
 * (`transform: translate3d(0, var(--parallax-y, 0), 0)`).
 *
 * Driven by requestAnimationFrame for jank-free updates; honors
 * prefers-reduced-motion by skipping setup. Single observer per
 * page, scoped to elements actually present at mount.
 */
export function ScrollParallax() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    );
    if (targets.length === 0) return;

    let raf = 0;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      for (const el of targets) {
        const speed = parseFloat(el.dataset.parallax || "0");
        // Offset is relative to the page top; gives a consistent feel
        // without per-element bounding-box reads on every frame.
        const offset = y * speed;
        el.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
