"use client";

import { useEffect, useState } from "react";

export function ClocksWidget() {
  const [times, setTimes] = useState({
    rdu: "00:00:00",
    nyc: "00:00:00",
    hnl: "00:00:00",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateClocks = () => {
      const date = new Date();

      const rduFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York", // Raleigh is Eastern
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const nycFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const hnlFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Pacific/Honolulu",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      setTimes({
        rdu: rduFormatter.format(date),
        nyc: nycFormatter.format(date),
        hnl: hnlFormatter.format(date),
      });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-6 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">
        <div>RDU • 00:00:00</div>
        <div className="hidden sm:block">NYC • 00:00:00</div>
        <div className="hidden md:block">HNL • 00:00:00</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)] transition-opacity duration-300">
      <div className="flex items-center gap-1.5">
        <span className="h-1 w-1 rounded-full bg-[var(--color-accent)] animate-pulse" />
        <span>RDU {times.rdu}</span>
      </div>
      <div className="hidden items-center gap-1.5 sm:flex">
        <span className="h-1 w-1 rounded-full bg-[var(--color-muted)] opacity-55" />
        <span>NYC {times.nyc}</span>
      </div>
      <div className="hidden items-center gap-1.5 md:flex">
        <span className="h-1 w-1 rounded-full bg-[var(--color-muted)] opacity-55" />
        <span>HNL {times.hnl}</span>
      </div>
    </div>
  );
}
