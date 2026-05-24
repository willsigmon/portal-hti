import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sip & Sync Social Hour — HTI × Portal HQ",
  description: "June 11 at Portal HQ in Raleigh: a $5 social hour and laptop donation drive supporting HTI's digital divide work.",
  alternates: { canonical: "/sip-and-sync" },
};

export default function CampaignSipAndSyncLayout({ children }: { children: React.ReactNode }) {
  return children;
}
