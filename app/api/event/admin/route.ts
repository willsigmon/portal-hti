import { NextResponse } from "next/server";
import { getAdminSnapshot, isLocalAdminAllowed } from "@/lib/event-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isLocalAdminAllowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getAdminSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
