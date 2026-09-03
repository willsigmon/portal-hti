import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yqqjjlfwdgwyjdcduexf.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_EnCpbQEpPn6RaZOH0s9kOQ_QJ1pGY0r";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }

    const { type, data } = body as { type?: string; data?: Record<string, unknown> };
    if (!type || !data) {
      return NextResponse.json({ error: "missing-payload" }, { status: 400 });
    }

    // Map to form_kind: 'partner_device_request' for laptop pledges, 'event_request' for tickets
    const kind = type === "laptop_pledge" ? "partner_device_request" : "event_request";
    const payload = {
      source: "portal-hti-sip-and-sync",
      submission_type: type,
      ...data,
      received_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ kind, payload }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Failed to persist pledge to Supabase:", res.status, errText);
      return NextResponse.json({ error: "database-storage-failed", status: res.status }, { status: 502 });
    }

    const inserted = await res.json().catch(() => []);
    return NextResponse.json({ ok: true, record: inserted[0] ?? null });
  } catch (error) {
    console.error("Unexpected error in /api/pledge:", error);
    return NextResponse.json({ error: "internal-error" }, { status: 500 });
  }
}
