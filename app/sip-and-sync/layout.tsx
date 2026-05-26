import type { Metadata } from "next";

const TITLE = "Sip & Sync Social Hour — HTI × Portal HQ";
const DESCRIPTION =
  "Thursday, June 11 · 6–9 PM at Portal HQ in Raleigh. A $5 social hour + laptop donation drive that funds HTI's mission to close the digital divide in NC. Drinks, music, secure laptop wipes — all in one night.";
const URL = "https://sipandsync.vercel.app";
const OG_IMAGE = `${URL}/sip_and_sync_flyer.png`;

/**
 * Page-level metadata. Drives the rich link preview that iMessage,
 * Slack, Discord, WhatsApp, Twitter, LinkedIn, and Facebook all
 * unfurl from this URL. iMessage uses the OG image + title +
 * description verbatim. Twitter Card is set to summary_large_image
 * so Twitter / X show the flyer at full width.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/sip-and-sync" },
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
  // iMessage / iOS Safari status-bar tint to match the deep nebula bg.
  other: {
    "theme-color": "#0a0d1f",
    "apple-mobile-web-app-title": "Sip & Sync",
  },
};

export default function SipAndSyncLayout({ children }: { children: React.ReactNode }) {
  return children;
}
