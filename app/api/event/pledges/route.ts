import { NextResponse } from "next/server";
import { createPledge, getAdminSnapshot, isLocalAdminAllowed, toPublicPledge } from "@/lib/event-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isLocalAdminAllowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getAdminSnapshot();
  return NextResponse.json({ pledges: snapshot.pledges });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const donorName = String(body.donorName || body.name || "").trim();
  const donorEmail = String(body.donorEmail || body.email || "").trim();
  const condition = String(body.condition || "").trim();

  if (!donorName || !donorEmail.includes("@") || !condition) {
    return NextResponse.json({ error: "Name, valid email, and hardware condition are required." }, { status: 400 });
  }

  const pledge = await createPledge({
    quantity: body.quantity,
    brand: body.brand,
    condition,
    donorName,
    donorEmail,
    donorPhone: body.donorPhone || body.phone,
    notes: body.notes,
  });

  return NextResponse.json({ pledge: toPublicPledge(pledge) }, { status: 201 });
}
