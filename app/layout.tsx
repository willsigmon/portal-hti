import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cormorant_Garamond, IBM_Plex_Sans, Space_Mono } from "next/font/google";
import { AmbientSpotlight } from "@/components/AmbientSpotlight";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Starfield } from "@/components/StarField";

// Runs before React hydrates so we set [data-theme] on <html> synchronously,
// preventing a light/dark flash on first paint. Defaults to dark — the
// brand mood — and only honors prefers-color-scheme: light if the visitor
// has no stored preference.
const NO_FLASH_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('ss_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

// Cormorant Garamond on Google Fonts caps at weight 700. display-xl /
// display-lg are anchored to 700 in globals.css — real metal, no
// synthesized faux-800.
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
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
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Static string constant — no user input, safe inline boot script. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        {/* 24,000-star animated canvas — "floating through deep space" travel
            with 3D parallax trails. Sits behind the aurora gas clouds. */}
        <Starfield opacity={0.85} />
        {/* Aurora gas-cloud parallax layer over the star field. */}
        <div className="aurora-deep" aria-hidden="true" />
        <AmbientSpotlight />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}

