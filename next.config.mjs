/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep local preview output separate from production build output.
  // This prevents missing-module errors when a dev server is open while a
  // production build regenerates `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // Next expects hostnames here, not full URLs.
  allowedDevOrigins: ["localhost", "127.0.0.1", "0.0.0.0", "192.168.1.161"],

  async redirects() {
    return [
      // Legacy alias from the campaign/ tree — keep external links working.
      { source: "/campaign/sip-and-sync", destination: "/sip-and-sync", permanent: true },
    ];
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://api.qrserver.com https://theportalhq.com https://maps.gstatic.com https://maps.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-src https://theportalhq.com https://www.google.com https://maps.google.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.paypal.com",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
