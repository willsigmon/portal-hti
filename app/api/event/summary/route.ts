import { NextResponse } from "next/server";
import { getPublicSummary } from "@/lib/event-store";

export const runtime = "nodejs";

export async function GET() {
  const payload = await getPublicSummary();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
