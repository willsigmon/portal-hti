import { NextResponse } from "next/server";
import { checkInTicket, isLocalAdminAllowed, toPublicTicket } from "@/lib/event-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "").trim();
  const token = typeof body.token === "string" ? body.token : undefined;
  const force = Boolean(body.force) && isLocalAdminAllowed(request);

  if (!code) {
    return NextResponse.json({ error: "Ticket code is required." }, { status: 400 });
  }

  const result = await checkInTicket(code, token, force);
  if (!result.ticket) {
    return NextResponse.json({ ok: false, reason: result.reason, error: "Ticket not found." }, { status: 404 });
  }

  const status = result.ok ? 200 : result.reason === "payment_required" ? 402 : 403;
  return NextResponse.json(
    {
      ok: result.ok,
      reason: result.reason,
      ticket: toPublicTicket(result.ticket, result.ok || force),
    },
    { status },
  );
}
