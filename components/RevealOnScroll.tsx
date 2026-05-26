"use client";

import { useEffect } from "react";

/**
 * Cross-browser scroll-reveal driver. Watches every element with a
 * `.reveal`, `.reveal-up`, `.reveal-fade`, `.reveal-scale`, or
 * `.reveal-stagger` class and toggles `data-reveal="in"` when it
 * enters the viewport. CSS keys the actual animation off that
 * attribute (see globals.css). Safari 18-, Firefox, and any browser
 * without `animation-timeline: view()` support get the same
 * Apple-style settle as Chromium.
 *
 * Children of `.reveal-stagger` cascade in via CSS nth-child delays.
 */
export function RevealOnScroll() {
  useEffect(() => {
    // Skip entirely for users who asked for less motion.
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document
        .querySelectorAll<HTMLElement>(
          ".reveal, .reveal-up, .reveal-fade, .reveal-scale, .reveal-stagger"
        )
        .forEach((el) => {
          el.setAttribute("data-reveal", "in");
        });
      return;
    }

    const SELECTOR =
      ".reveal, .reveal-up, .reveal-fade, .reveal-scale, .reveal-stagger";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.setAttribute("data-reveal", "in");
            observer.unobserve(el);
          }
        }
      },
      {
        // Trigger when 8% of the element has crossed into the viewport —
        // Apple-tight, content reads as settled before the user notices.
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      }
    );

    const observeAll = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        // Anything already in viewport on mount gets revealed immediately
        // (no flash) so above-the-fold content doesn't sit hidden.
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < vh * 0.92) {
          el.setAttribute("data-reveal", "in");
          return;
        }
        observer.observe(el);
      });
    };

    observeAll();

    // Re-scan when new reveal nodes get mounted (route transitions, etc.)
    const mutation = new MutationObserver(() => observeAll());
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
