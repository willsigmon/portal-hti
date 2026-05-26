/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep local preview output separate from production build output.
  // This prevents missing-module errors when a dev server is open while a
  // production build regenerates `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // Next expects hostnames here, not full URLs.
  allowedDevOrigins: ["localhost", "127.0.0.1", "0.0.0.0", "192.168.1.161"],

  // Lint is handled by `npm run lint`; keeping build separate avoids Next's
  // deprecated internal lint bridge fighting the current ESLint CLI.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
