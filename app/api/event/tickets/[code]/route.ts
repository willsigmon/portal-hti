import { NextResponse } from "next/server";
import { getTicket, toPublicTicket } from "@/lib/event-store";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || undefined;
  const result = await getTicket(code, token);

  if (!result) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json({
    ticket: toPublicTicket(result.ticket, result.authorized),
    authorized: result.authorized,
  });
}
