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
    const STAR_COUNT = 24000; // Dense star field — floating through deep space
    const SPEED = 0.42; // Continuous z-axis drift

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
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

      for (let i = 0; i < STAR_COUNT; i++) {
        let color = "#ffffff";
        const rand = Math.random();

        if (rand > 0.965) {
          color = "#d97d54"; // Clay terracotta
        } else if (rand > 0.94) {
          color = "#cba158"; // Brushed copper
        } else if (rand > 0.91) {
          color = "#efece6"; // Soft chalky white
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

        // Ultra-high performance core render utilizing hardware-accelerated fillRect in white
        ctx.fillStyle = "#ffffff";
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
