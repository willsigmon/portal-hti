import type { Metadata } from "next";
import { VenueLandingPage } from "@/components/VenueLandingPage";
import { EVENT_TYPES } from "@/lib/portal-content";

const eventType = EVENT_TYPES.find((event) => event.id === "celebration")!;

export const metadata: Metadata = {
  title: eventType.seoTitle,
  description: eventType.summary,
  alternates: { canonical: "/celebrations" },
};

export default function CelebrationsPage() {
  return <VenueLandingPage eventType={eventType} />;
}
