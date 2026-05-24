"use client";

import { useEffect, useState } from "react";

export function AmbientSpotlight() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--window-mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--window-mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 select-none transition-opacity duration-1000 opacity-64"
      style={{
        background: `radial-gradient(600px circle at var(--window-mouse-x, 50vw) var(--window-mouse-y, 50vh), color-mix(in oklch, var(--color-accent) 4.5%, transparent), transparent 100%)`,
      }}
    />
  );
}
