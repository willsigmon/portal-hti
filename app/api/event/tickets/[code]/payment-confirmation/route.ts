import { NextResponse } from "next/server";
import { requestPaymentReview, toPublicTicket } from "@/lib/event-store";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");

  if (!token) {
    return NextResponse.json({ error: "Ticket token is required." }, { status: 400 });
  }

  const ticket = await requestPaymentReview(code, token, body.reference);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found or token invalid." }, { status: 404 });
  }

  return NextResponse.json({ ticket: toPublicTicket(ticket, true) });
}
