import { NextResponse } from "next/server";
import { adminUpdateTicket, checkInTicket, isLocalAdminAllowed, toPublicTicket } from "@/lib/event-store";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ code: string }> }) {
  if (!isLocalAdminAllowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await context.params;
  const body = await request.json().catch(() => ({}));

  if (body.action === "check_in") {
    const result = await checkInTicket(code, undefined, true);
    if (!result.ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    return NextResponse.json({ ticket: toPublicTicket(result.ticket, true) });
  }

  const ticket = await adminUpdateTicket(code, {
    paymentStatus: body.paymentStatus,
    paymentProvider: body.paymentProvider,
    paymentReference: body.paymentReference,
    notes: body.notes,
    checkInStatus: body.checkInStatus,
  });

  if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  return NextResponse.json({ ticket: toPublicTicket(ticket, true) });
}
