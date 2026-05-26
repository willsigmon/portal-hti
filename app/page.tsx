import type { Metadata } from "next";
import SipAndSync from "./sip-and-sync/page";

const TITLE = "Sip & Sync Social Hour — HTI × Portal HQ";
const DESCRIPTION =
  "Thursday, June 11 · 6–9 PM at Portal HQ in Raleigh. A $5 social hour + laptop donation drive that funds HTI's mission to close the digital divide in NC. Drinks, music, secure laptop wipes — all in one night.";
const URL = "https://sipandsync.vercel.app";
// Absolute URL — scrapers resolve OG images without applying
// metadataBase, so we hardcode the share domain.
const OG_IMAGE = `${URL}/sip_and_sync_flyer.png`;

/**
 * Rich link unfurl for iMessage / Slack / Discord / WhatsApp /
 * Twitter / LinkedIn / Facebook when someone shares the bare
 * sipandsync.vercel.app URL. Root page renders the Sip & Sync
 * landing component so metadata here is what every social
 * scraper actually sees.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: URL,
    siteName: "Sip & Sync · HTI × Portal HQ",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 1024,
        height: 1024,
        alt: "Sip & Sync Social Hour — June 11 at Portal HQ, Raleigh NC",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  other: {
    "theme-color": "#0a0d1f",
    "apple-mobile-web-app-title": "Sip & Sync",
  },
};

export default function HomePage() {
  return <SipAndSync />;
}
