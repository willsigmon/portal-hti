"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  color: string;
  size: number;
}

export function Starfield({ opacity = 0.72 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    // Theme-aware palette. Light mode uses warm dusty ink dots so they
    // read as motes drifting through daylight; dark mode keeps the
    // bright white / copper space-particle palette. Re-checked on
    // every frame so a runtime theme toggle re-tints without remount.
    const getTheme = () =>
      document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";
    let theme: "light" | "dark" = getTheme();
    const themeObserver = new MutationObserver(() => {
      const next = getTheme();
      if (next !== theme) {
        theme = next;
        initStars();
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    // Mobile-aware star budget. Phones (≤768px or coarse pointer) drop to
    // ~3,500 stars at DPR-1; tablets ~9,000; desktop keeps the dense 24k
    // field. Keeps frame budget under 16ms on iPhone 12-class hardware.
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    const w0 = typeof window !== "undefined" ? window.innerWidth : 1440;
    const STAR_COUNT =
      isCoarsePointer || w0 <= 768
        ? 3500
        : w0 <= 1100
          ? 9000
          : 24000;
    const SPEED = 0.42; // Continuous z-axis drift

    const resizeCanvas = () => {
      // Cap DPR at 1.5 on touch devices — full DPR doubles GPU/CPU cost
      // on mobile retina screens for negligible visible gain on a
      // particle field.
      const rawDpr = window.devicePixelRatio || 1;
      const dpr = isCoarsePointer ? Math.min(rawDpr, 1.5) : rawDpr;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initStars();
    };

    const initStars = () => {
      stars = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      const maxDepth = w;

      // Theme-aware palette. Dark = bright space dust; Light = warm
      // dusty ink / clay / copper so the particles read as motes
      // drifting through daylight against warm paper.
      const palette =
        theme === "light"
          ? {
              base: "#3a3022", // Warm dark ink
              accents: ["#8a4a26", "#a8702c", "#5a4a3a"], // Clay / copper / mocha
            }
          : {
              base: "#ffffff", // Bright white space particles
              accents: ["#d97d54", "#cba158", "#efece6"], // Clay terracotta / brushed copper / chalky white
            };

      for (let i = 0; i < STAR_COUNT; i++) {
        let color = palette.base;
        const rand = Math.random();

        if (rand > 0.965) {
          color = palette.accents[0];
        } else if (rand > 0.94) {
          color = palette.accents[1];
        } else if (rand > 0.91) {
          color = palette.accents[2];
        }

        stars.push({
          x: (Math.random() - 0.5) * w * 2,
          y: (Math.random() - 0.5) * h * 2,
          z: Math.random() * maxDepth,
          prevZ: 0,
          color: color,
          size: 0.5 + Math.random() * 1.5,
        });
        stars[i].prevZ = stars[i].z;
      }
    };

    let lastTime = 0;
    const drawStarfield = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;
      lastTime = timestamp;

      // Restrict delta updates to ensure standard speed irrespective of refresh rate
      const adjustedSpeed = SPEED * (elapsed > 0 ? elapsed / 16.67 : 1);

      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const maxDepth = w;

      // Transparent clear — let the aurora / nebula bg show through
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        star.prevZ = star.z;
        star.z -= adjustedSpeed;

        if (star.z <= 0) {
          star.z = maxDepth;
          star.x = (Math.random() - 0.5) * w * 2;
          star.y = (Math.random() - 0.5) * h * 2;
          star.prevZ = star.z;
        }

        const px = (star.x / star.z) * w + cx;
        const py = (star.y / star.z) * h + cy;

        if (px < 0 || px >= w || py < 0 || py >= h) continue;

        const starOpacity = Math.min(1, 1 - star.z / maxDepth);
        const currentSize = star.size * (1 + (maxDepth / star.z) * 0.05);

        // Draw space particle trail ONLY for close stars (cuts path building by 60%)
        if (star.z < maxDepth * 0.4) {
          const ppx = (star.x / star.prevZ) * w + cx;
          const ppy = (star.y / star.prevZ) * h + cy;

          ctx.beginPath();
          ctx.strokeStyle = star.color;
          ctx.lineWidth = Math.min(2.0, currentSize);
          ctx.globalAlpha = starOpacity * 0.58 * opacity;
          ctx.moveTo(ppx, ppy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }

        // Ultra-high performance core render utilizing hardware-accelerated
        // fillRect. Dark theme = bright white; light theme = warm dark ink
        // so the particle reads against paper.
        ctx.fillStyle = theme === "light" ? "#3a3022" : "#ffffff";
        ctx.globalAlpha = Math.min(1, starOpacity * 1.15 * opacity);
        ctx.fillRect(
          px - currentSize / 2,
          py - currentSize / 2,
          currentSize,
          currentSize
        );
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(drawStarfield);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animationFrameId = requestAnimationFrame(drawStarfield);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      themeObserver.disconnect();
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none select-none"
      style={{ position: "fixed", inset: 0, zIndex: 0, opacity }}
      aria-hidden="true"
    />
  );
}
