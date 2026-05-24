import type { Metadata } from "next";
import { VenueLandingPage } from "@/components/VenueLandingPage";
import { EVENT_TYPES } from "@/lib/portal-content";

const eventType = EVENT_TYPES.find((event) => event.id === "corporate")!;

export const metadata: Metadata = {
  title: eventType.seoTitle,
  description: eventType.summary,
  alternates: { canonical: "/corporate" },
};

export default function CorporatePage() {
  return <VenueLandingPage eventType={eventType} />;
}
