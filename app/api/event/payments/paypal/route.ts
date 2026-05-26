import { NextResponse } from "next/server";
import { adminUpdateTicket, toPublicTicket } from "@/lib/event-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.EVENT_WEBHOOK_SECRET;
  if (webhookSecret && request.headers.get("x-event-webhook-secret") !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const ticketCode = String(body.ticketCode || body.custom_id || body.invoice_id || "").trim();
  if (!ticketCode) {
    return NextResponse.json({ error: "ticketCode/custom_id is required." }, { status: 400 });
  }

  const ticket = await adminUpdateTicket(ticketCode, {
    paymentStatus: "paid",
    paymentProvider: "paypal",
    paymentReference: String(body.paymentReference || body.id || body.resource?.id || "").trim(),
  });

  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  return NextResponse.json({ ticket: toPublicTicket(ticket, true) });
}
