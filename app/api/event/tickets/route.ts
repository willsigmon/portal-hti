import { NextResponse } from "next/server";
import { createTicket, getAdminSnapshot, isLocalAdminAllowed, toPublicTicket } from "@/lib/event-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isLocalAdminAllowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getAdminSnapshot();
  return NextResponse.json({ tickets: snapshot.tickets });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const guestName = String(body.guestName || "").trim();
  const guestEmail = String(body.guestEmail || "").trim();

  if (!guestName || !guestEmail || !guestEmail.includes("@")) {
    return NextResponse.json({ error: "A guest name and valid email are required." }, { status: 400 });
  }

  const ticket = await createTicket({
    guestName,
    guestEmail,
    qty: body.qty,
    donation: body.donation,
    notes: body.notes,
  });

  return NextResponse.json(
    {
      ticket: toPublicTicket(ticket, true),
      paymentUrl: process.env.NEXT_PUBLIC_PAYPAL_DONATE_URL || "https://www.paypal.com/donate/?hosted_button_id=C6QJ6V23C63P2",
    },
    { status: 201 },
  );
}
