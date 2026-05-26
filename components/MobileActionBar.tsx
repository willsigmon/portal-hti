"use client";

import { useEffect, useState } from "react";

/**
 * Mobile-only sticky action bar. Fades in once the user scrolls past
 * the hero so the page header still gets unobstructed real estate on
 * first paint. Hidden at sm+ breakpoints (the top nav carries the
 * "Get Tickets" affordance there). Honors iOS home-bar inset.
 */
export function MobileActionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      // Trigger ~70% down the first viewport so the hero CTAs aren't
      // duplicated, but show before the user gets too deep.
      setVisible(window.scrollY > window.innerHeight * 0.65);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 px-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.6,1)] ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.875rem)" }}
    >
      <div className="flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[color-mix(in_oklch,var(--color-bg)_92%,transparent)] backdrop-blur-xl p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]">
        <a
          href="#tickets"
          className="flex-1 inline-flex h-12 items-center justify-center gap-1.5 rounded-full bg-[var(--color-accent)] px-5 text-sm font-semibold tracking-tight text-[var(--color-on-accent)] active:scale-[0.97] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
        >
          Reserve Spot
        </a>
        <a
          href="#pledge"
          className="flex-1 inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--color-ink)_18%,transparent)] bg-[color-mix(in_oklch,var(--color-band)_70%,transparent)] px-4 text-sm font-semibold tracking-tight text-[var(--color-ink)] active:scale-[0.97] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
        >
          Pledge Laptop
        </a>
      </div>
    </div>
  );
}
