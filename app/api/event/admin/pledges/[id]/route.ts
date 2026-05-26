import { NextResponse } from "next/server";
import { adminUpdatePledge, isLocalAdminAllowed } from "@/lib/event-store";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isLocalAdminAllowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const pledge = await adminUpdatePledge(id, {
    status: body.status,
    notes: body.notes,
    donorPhone: body.donorPhone,
  });

  if (!pledge) return NextResponse.json({ error: "Pledge not found" }, { status: 404 });
  return NextResponse.json({ pledge });
}
