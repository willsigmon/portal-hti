import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Playfair_Display, Outfit } from "next/font/google";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theportalhq.com"),
  title: {
    default: "The Portal HQ — Raleigh Event Venue",
    template: "%s | The Portal HQ",
  },
  description: "Book The Portal HQ, a flexible 5,000 sq ft Raleigh event venue for corporate retreats, concerts, showcases, receptions, and private celebrations.",
  keywords: [
    "event venue Raleigh NC",
    "corporate event space Raleigh",
    "concert venue Raleigh",
    "private party venue Raleigh",
    "Hillsborough Street venue",
    "The Portal HQ",
  ],
  icons: { icon: "/portal-logo.png" },
  openGraph: {
    type: "website",
    siteName: "The Portal HQ",
    title: "The Portal HQ — Raleigh Event Venue",
    description: "A transformable 5,000 sq ft Raleigh venue with production-grade AV, stage lighting, 360° tour, and custom event proposals.",
    url: "/",
    images: [{ url: "/venue/venue-daylight-floor.jpg", width: 1600, height: 1067, alt: "Daylight inside The Portal HQ event venue" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Portal HQ — Raleigh Event Venue",
    description: "Corporate retreats, concerts, showcases, and private celebrations in one production-ready Raleigh venue.",
    images: ["/venue/venue-daylight-floor.jpg"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
