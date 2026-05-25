"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // The no-flash inline script in layout.tsx has already set data-theme
    // on <html> before hydration. Read it back here so React state matches
    // the DOM, then keep them in sync on toggle.
    const current = (document.documentElement.getAttribute("data-theme") as Theme | null) ?? "dark";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ss_theme", next);
    } catch {
      // Ignore — private mode / disabled storage. The data-theme attribute
      // change still takes effect for this session.
    }
  };

  // Render nothing until we know the current theme to avoid a hydration
  // mismatch (server has no localStorage, no prefers-color-scheme).
  if (theme === null) return null;

  const isDark = theme === "dark";
  const nextLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={nextLabel}
      title={nextLabel}
      className="theme-toggle fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border text-[color:var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)]"
      style={{
        borderColor: "color-mix(in oklch, var(--color-ink) 14%, transparent)",
        background: "color-mix(in oklch, var(--color-panel-strong) 88%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 6px 20px color-mix(in oklch, black 22%, transparent)",
      }}
    >
      {isDark ? (
        // Moon — currently dark, click to go light
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        // Sun — currently light, click to go dark
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
