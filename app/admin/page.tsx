"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Starfield } from "@/components/Starfield";
import type { EventStoreSnapshot, PaymentStatus, PledgeStatus, PublicTicket } from "@/lib/event-types";

const paymentStatuses: PaymentStatus[] = ["pending", "pending_review", "paid", "refunded", "void"];
const pledgeStatuses: PledgeStatus[] = ["new", "contacted", "scheduled", "received", "wiped", "distributed", "cancelled"];

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

function shortDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminPage() {
  const [snapshot, setSnapshot] = useState<EventStoreSnapshot | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const query = adminKey ? `?key=${encodeURIComponent(adminKey)}` : "";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/event/admin${query}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 401 ? "Admin key required." : "Could not load operations data.");
      const payload = await response.json();
      setSnapshot(payload);
      if (adminKey) localStorage.setItem("portal_hti_admin_key", adminKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load operations data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem("portal_hti_admin_key") || "";
    setAdminKey(savedKey);
  }, []);

  useEffect(() => {
    load();
  }, [adminKey]);

  const filteredTickets = useMemo(() => {
    const term = filter.trim().toLowerCase();
    const tickets = snapshot?.tickets || [];
    if (!term) return tickets;
    return tickets.filter((ticket) =>
      [ticket.code, ticket.guestName, ticket.guestEmail, ticket.paymentStatus, ticket.checkInStatus]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [filter, snapshot?.tickets]);

  const updateTicket = async (ticket: PublicTicket, patch: Record<string, unknown>) => {
    const response = await fetch(`/api/event/admin/tickets/${encodeURIComponent(ticket.code)}${query}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error || "Ticket update failed.");
      return;
    }
    await load();
  };

  const updatePledge = async (id: string, patch: Record<string, unknown>) => {
    const response = await fetch(`/api/event/admin/pledges/${encodeURIComponent(id)}${query}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error || "Pledge update failed.");
      return;
    }
    await load();
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white">
      <Starfield opacity={0.42} />
      <main className="container py-8 md:py-12 space-y-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="eyebrow">// EVENT OPS // SIP & SYNC COMMAND CENTER</div>
            <h1 className="display-lg tracking-[-0.04em]">Admin Console</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              iPad-friendly check-in, payment review, laptop pledge coordination, and live campaign telemetry.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="Admin key if deployed"
              className="input-field min-w-[220px]"
            />
            <Button onClick={load} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/10 p-4 text-sm text-[var(--color-ink)]">
            {error}
          </div>
        )}

        {snapshot && (
          <>
            <section className="grid gap-3 md:grid-cols-5">
              {[
                ["Pledged", `${snapshot.summary.pledgedDevices}/${snapshot.summary.goal}`],
                ["Tickets", snapshot.summary.ticketsReserved],
                ["Paid", snapshot.summary.paidTickets],
                ["Checked In", snapshot.summary.checkedInGuests],
                ["Intent", money(snapshot.summary.donationIntent + snapshot.summary.ticketRevenueIntent)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-[var(--color-surface)]/72 p-4 backdrop-blur-md">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</div>
                  <strong className="mt-2 block font-display text-3xl tracking-tight text-[var(--color-ink)]">{value}</strong>
                </div>
              ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
              <div className="rounded-2xl border border-white/10 bg-[var(--color-surface)]/78 p-4 backdrop-blur-md">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-3xl font-bold tracking-tight">Tickets & Check-in</h2>
                    <p className="text-xs text-[var(--color-muted)]">Mark payment, force check-in, and validate QR results from an iPad at the door.</p>
                  </div>
                  <input
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    placeholder="Search ticket, guest, status"
                    className="input-field sm:max-w-[260px]"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      <tr>
                        <th className="py-3 pr-3">Pass</th>
                        <th className="py-3 pr-3">Guest</th>
                        <th className="py-3 pr-3">Due</th>
                        <th className="py-3 pr-3">Payment</th>
                        <th className="py-3 pr-3">Check-in</th>
                        <th className="py-3 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6">
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.code} className="align-top">
                          <td className="py-3 pr-3 font-mono font-bold text-[var(--color-accent)]">{ticket.code}</td>
                          <td className="py-3 pr-3">
                            <strong className="block text-[var(--color-ink)]">{ticket.guestName}</strong>
                            <span className="text-[var(--color-muted)]">{ticket.guestEmail}</span>
                          </td>
                          <td className="py-3 pr-3 font-mono">
                            {money(ticket.totalDue)}
                            <span className="block text-[var(--color-muted)]">{ticket.qty} pass{ticket.qty === 1 ? "" : "es"}</span>
                          </td>
                          <td className="py-3 pr-3">
                            <select
                              value={ticket.paymentStatus}
                              onChange={(event) => updateTicket(ticket, { paymentStatus: event.target.value, paymentProvider: "manual" })}
                              className="rounded border border-white/10 bg-black/30 px-2 py-1"
                            >
                              {paymentStatuses.map((status) => (
                                <option key={status} value={status}>{status.replace("_", " ")}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 pr-3">
                            <span className={ticket.checkInStatus === "checked_in" ? "text-[var(--color-signal)]" : "text-[var(--color-muted)]"}>
                              {ticket.checkInStatus.replaceAll("_", " ")}
                            </span>
                            <span className="block text-[var(--color-muted)]">{shortDate(ticket.checkedInAt)}</span>
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => updateTicket(ticket, { paymentStatus: "paid", paymentProvider: "manual" })}
                                className="rounded bg-[var(--color-accent)] px-3 py-1.5 font-semibold text-white"
                              >
                                Mark paid
                              </button>
                              <button
                                onClick={() => updateTicket(ticket, { action: "check_in" })}
                                className="rounded border border-white/10 px-3 py-1.5 font-semibold text-[var(--color-ink)]"
                              >
                                Check in
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-[var(--color-surface)]/78 p-4 backdrop-blur-md">
                  <h2 className="font-display text-2xl font-bold tracking-tight">Live Activity</h2>
                  <div className="mt-4 space-y-3">
                    {snapshot.summary.latestActivity.length ? snapshot.summary.latestActivity.map((event) => (
                      <div key={event.id} className="rounded-lg border border-white/8 bg-black/20 p-3">
                        <p className="text-xs leading-relaxed text-[var(--color-ink)]">{event.message}</p>
                        <span className="mt-1 block text-[10px] text-[var(--color-muted)]">{shortDate(event.createdAt)}</span>
                      </div>
                    )) : <p className="text-sm text-[var(--color-muted)]">No activity yet.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[var(--color-surface)]/78 p-4 backdrop-blur-md">
                  <h2 className="font-display text-2xl font-bold tracking-tight">Watch Pulse</h2>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
                    Companion-watch MVP: this panel is the notification source for paid pass, new pledge, and check-in milestones. Native haptics can subscribe here later.
                  </p>
                </div>
              </aside>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[var(--color-surface)]/78 p-4 backdrop-blur-md">
              <div className="mb-4">
                <h2 className="font-display text-3xl font-bold tracking-tight">Laptop Pledge Queue</h2>
                <p className="text-xs text-[var(--color-muted)]">Coordinate contact, pickup, wipe, and distribution status.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    <tr>
                      <th className="py-3 pr-3">ID</th>
                      <th className="py-3 pr-3">Donor</th>
                      <th className="py-3 pr-3">Device</th>
                      <th className="py-3 pr-3">Contact</th>
                      <th className="py-3 pr-3">Status</th>
                      <th className="py-3 pr-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/6">
                    {snapshot.pledges.map((pledge) => (
                      <tr key={pledge.id} className="align-top">
                        <td className="py-3 pr-3 font-mono font-bold text-[var(--color-accent)]">{pledge.id}</td>
                        <td className="py-3 pr-3">
                          <strong className="block text-[var(--color-ink)]">{pledge.donorName}</strong>
                          <span className="text-[var(--color-muted)]">{pledge.notes || "—"}</span>
                        </td>
                        <td className="py-3 pr-3">
                          <strong className="text-[var(--color-ink)]">{pledge.quantity} × {pledge.brand}</strong>
                          <span className="block text-[var(--color-muted)]">{pledge.condition}</span>
                        </td>
                        <td className="py-3 pr-3">
                          <span className="block">{pledge.donorEmail}</span>
                          <span className="text-[var(--color-muted)]">{pledge.donorPhone || "No phone"}</span>
                        </td>
                        <td className="py-3 pr-3">
                          <select
                            value={pledge.status}
                            onChange={(event) => updatePledge(pledge.id, { status: event.target.value })}
                            className="rounded border border-white/10 bg-black/30 px-2 py-1"
                          >
                            {pledgeStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-3 text-[var(--color-muted)]">{shortDate(pledge.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
