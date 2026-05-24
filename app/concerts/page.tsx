import type { Metadata } from "next";
import { VenueLandingPage } from "@/components/VenueLandingPage";
import { EVENT_TYPES } from "@/lib/portal-content";

const eventType = EVENT_TYPES.find((event) => event.id === "showcase")!;

export const metadata: Metadata = {
  title: eventType.seoTitle,
  description: eventType.summary,
  alternates: { canonical: "/concerts" },
};

export default function ConcertsPage() {
  return <VenueLandingPage eventType={eventType} />;
}
