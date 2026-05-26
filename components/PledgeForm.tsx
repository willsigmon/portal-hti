"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./Button";
import type { PaymentStatus, PublicPledge, PublicTicket } from "@/lib/event-types";

type Mode = "ticket" | "laptop";
type TicketStep = "configure" | "wallet";
type LaptopStep = "details" | "success";

interface PledgeFormProps {
  mode?: Mode;
}

const PAYPAL_URL =
  process.env.NEXT_PUBLIC_PAYPAL_DONATE_URL ||
  "https://www.paypal.com/donate/?hosted_button_id=C6QJ6V23C63P2";

function normalizeTicket(raw: any): PublicTicket | null {
  if (!raw?.code) return null;
  const paymentStatus: PaymentStatus = raw.paymentStatus || (raw.paid ? "paid" : "pending");
  return {
    code: raw.code,
    token: raw.token || "",
    guestName: raw.guestName || raw.name || "Event Guest",
    guestEmail: raw.guestEmail || raw.email || "",
    qty: Number(raw.qty || 1),
    donation: Number(raw.donation || 0),
    ticketTotal: Number(raw.ticketTotal ?? (Number(raw.qty || 1) * 5)),
    totalDue: Number(raw.totalDue ?? (Number(raw.qty || 1) * 5 + Number(raw.donation || 0))),
    paymentStatus,
    paymentProvider: raw.paymentProvider,
    paymentReference: raw.paymentReference,
    paymentConfirmedAt: raw.paymentConfirmedAt,
    checkedInAt: raw.checkedInAt,
    checkInStatus: raw.checkInStatus || "not_checked_in",
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function PledgeForm({ mode = "laptop" }: PledgeFormProps) {
  const [ticketStep, setTicketStep] = useState<TicketStep>("configure");
  const [ticketQty, setTicketQty] = useState(1);
  const [donationPreset, setDonationPreset] = useState("25");
  const [donationValue, setDonationValue] = useState(25);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [paymentReference, setPaymentReference] = useState("");

  const [laptopStep, setLaptopStep] = useState<LaptopStep>("details");
  const [laptopData, setLaptopData] = useState({
    quantity: "1",
    brand: "",
    condition: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [pledge, setPledge] = useState<PublicPledge | null>(null);

  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== "ticket") return;

    const savedTicket = localStorage.getItem("ss_event_ticket");
    if (!savedTicket) return;

    try {
      const parsed = normalizeTicket(JSON.parse(savedTicket));
      if (!parsed) return;
      setTicket(parsed);
      setTicketQty(parsed.qty || 1);
      setDonationValue(parsed.donation || 0);
      setGuestName(parsed.guestName || "");
      setGuestEmail(parsed.guestEmail || "");
      setTicketStep("wallet");

      if (parsed.token) {
        fetch(`/api/event/tickets/${encodeURIComponent(parsed.code)}?token=${encodeURIComponent(parsed.token)}`, {
          cache: "no-store",
        })
          .then(async (response) => {
            if (!response.ok) return;
            const payload = await response.json();
            const fresh = normalizeTicket(payload.ticket);
            if (!fresh) return;
            localStorage.setItem("ss_event_ticket", JSON.stringify(fresh));
            setTicket(fresh);
            setTicketQty(fresh.qty || 1);
            setDonationValue(fresh.donation || 0);
            setGuestName(fresh.guestName || "");
            setGuestEmail(fresh.guestEmail || "");
          })
          .catch(() => undefined);
      }
    } catch {
      localStorage.removeItem("ss_event_ticket");
    }
  }, [mode]);

  const invoiceTicketsCost = ticketQty * 5;
  const invoiceTotal = invoiceTicketsCost + donationValue;
  const ticketPaid = ticket?.paymentStatus === "paid";

  const verifyUrl = useMemo(() => {
    if (typeof window === "undefined" || !ticket) return "";
    const params = new URLSearchParams({
      verify: ticket.code,
      token: ticket.token || "",
      guest: ticket.guestName,
      qty: String(ticket.qty),
      donation: String(ticket.donation),
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [ticket]);

  const qrCodeSrc = verifyUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(verifyUrl)}`
    : "";

  const handlePresetSelect = (preset: string) => {
    setDonationPreset(preset);
    if (preset !== "custom") setDonationValue(parseInt(preset, 10));
  };

  const handleDonationSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setDonationValue(val);
    setDonationPreset(val === 25 || val === 50 || val === 100 ? val.toString() : "custom");
  };

  const handleDonationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (Number.isNaN(val) || val < 0) val = 0;
    setDonationValue(val);
    setDonationPreset(val === 25 || val === 50 || val === 100 ? val.toString() : "custom");
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage("");

    try {
      const response = await fetch("/api/event/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          guestEmail,
          qty: ticketQty,
          donation: donationValue,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ticket) throw new Error(payload.error || "Could not create pass.");

      const nextTicket = normalizeTicket(payload.ticket)!;
      localStorage.setItem("ss_event_ticket", JSON.stringify(nextTicket));
      setTicket(nextTicket);
      setTicketStep("wallet");
      setFormMessage("Pass reserved. Complete PayPal payment, then request activation review.");
      window.dispatchEvent(new Event("ticketSync"));
    } catch (error) {
      const fallback = normalizeTicket({
        code: `SS-${Math.floor(10000 + Math.random() * 90000)}`,
        guestName: guestName.trim() || "Event Guest",
        guestEmail: guestEmail.trim(),
        qty: ticketQty,
        donation: donationValue,
        paymentStatus: "pending",
      })!;
      localStorage.setItem("ss_event_ticket", JSON.stringify(fallback));
      setTicket(fallback);
      setTicketStep("wallet");
      setFormMessage(error instanceof Error ? `${error.message} Saved locally for now.` : "Saved locally for now.");
      window.dispatchEvent(new Event("ticketSync"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentReviewRequest = async () => {
    if (!ticket) return;
    if (!ticket.token) {
      setFormMessage("This locally saved pass cannot be activated. Recreate it once the API is online.");
      return;
    }

    setIsSubmitting(true);
    setFormMessage("");
    try {
      const response = await fetch(`/api/event/tickets/${encodeURIComponent(ticket.code)}/payment-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: ticket.token, reference: paymentReference }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ticket) throw new Error(payload.error || "Could not request payment review.");

      const nextTicket = normalizeTicket(payload.ticket)!;
      localStorage.setItem("ss_event_ticket", JSON.stringify(nextTicket));
      setTicket(nextTicket);
      setFormMessage("Payment review requested. Event ops can now mark this pass paid in the admin console.");
      window.dispatchEvent(new Event("ticketSync"));
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : "Could not request payment review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetTicket = () => {
    localStorage.removeItem("ss_event_ticket");
    setTicket(null);
    setTicketStep("configure");
    setTicketQty(1);
    setDonationValue(25);
    setDonationPreset("25");
    setGuestName("");
    setGuestEmail("");
    setPaymentReference("");
    setFormMessage("");
    window.dispatchEvent(new Event("ticketSync"));
  };

  const handleLaptopChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setLaptopData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLaptopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage("");

    try {
      const response = await fetch("/api/event/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: laptopData.quantity,
          brand: laptopData.brand,
          condition: laptopData.condition,
          donorName: laptopData.name,
          donorEmail: laptopData.email,
          donorPhone: laptopData.phone,
          notes: laptopData.notes,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.pledge) throw new Error(payload.error || "Could not save pledge.");

      const nextPledge = payload.pledge as PublicPledge;
      setPledge(nextPledge);
      const currentPledges = JSON.parse(localStorage.getItem("ss_pledges") || "[]");
      localStorage.setItem(
        "ss_pledges",
        JSON.stringify([
          {
            ...nextPledge,
            name: nextPledge.donorName,
            count: nextPledge.quantity,
            details: nextPledge.brand,
            code: nextPledge.id,
            time: "Just Now",
          },
          ...currentPledges,
        ]),
      );
      setLaptopStep("success");
      window.dispatchEvent(new Event("pledgeSync"));
    } catch (error) {
      const fallback: PublicPledge = {
        id: `PLG-${Math.floor(100000 + Math.random() * 900000)}`,
        quantity: parseInt(laptopData.quantity, 10) || 1,
        brand: laptopData.brand.trim() || "Laptop Device",
        condition: laptopData.condition,
        donorName: laptopData.name.trim() || "Anonymous",
        status: "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPledge(fallback);
      const currentPledges = JSON.parse(localStorage.getItem("ss_pledges") || "[]");
      localStorage.setItem(
        "ss_pledges",
        JSON.stringify([{ ...fallback, name: fallback.donorName, count: fallback.quantity, details: fallback.brand, code: fallback.id, time: "Just Now" }, ...currentPledges]),
      );
      setFormMessage(error instanceof Error ? `${error.message} Saved locally for now.` : "Saved locally for now.");
      setLaptopStep("success");
      window.dispatchEvent(new Event("pledgeSync"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetLaptop = () => {
    setLaptopStep("details");
    setPledge(null);
    setLaptopData({ quantity: "1", brand: "", condition: "", name: "", email: "", phone: "", notes: "" });
    setFormMessage("");
  };

  if (mode === "ticket") {
    if (ticketStep === "wallet" && ticket) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h4 className="font-display text-xl tracking-tight text-[var(--color-ink)]">Your Interactive Event Pass</h4>
            <button onClick={handleResetTicket} className="text-xs text-[var(--color-accent)] hover:underline">
              Start Over / Reserve Another
            </button>
          </div>

          <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_12%,transparent)] bg-[var(--color-surface)] shadow-lg">
            <div className={`px-6 py-2.5 text-center text-xs font-bold font-sans tracking-wide text-white ${ticketPaid ? "bg-[var(--color-signal)]" : "bg-[var(--color-accent)]"}`}>
              {ticketPaid
                ? "✓ Pass Activated — Entrance Granted"
                : ticket.paymentStatus === "pending_review"
                  ? "◷ Payment Review Requested"
                  : "⚠️ Pending Payment / Inactive"}
            </div>

            <div className="p-4.5 md:p-6 space-y-4.5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[var(--color-muted)] text-xs font-semibold tracking-wide font-sans">Official Joint Event Pass</div>
                  <h3 className="font-display text-2xl font-bold tracking-tight mt-1 text-[var(--color-ink)]">Sip &amp; Sync Social Hour</h3>
                </div>
                <div className="font-sans tabular-nums text-sm px-3 py-1.5 rounded bg-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] self-start md:self-auto select-all">
                  #{ticket.code}
                </div>
              </div>

              <div className="border-t border-dashed border-[color-mix(in_oklch,var(--color-ink)_15%,transparent)] my-3" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4.5 text-sm">
                <div>
                  <span className="block text-xs text-[var(--color-muted)] font-sans tracking-wide mb-1">Guest Name</span>
                  <strong className="text-[var(--color-ink)] font-semibold font-sans">{ticket.guestName}</strong>
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-muted)] font-sans tracking-wide mb-1">Passes Held</span>
                  <strong className="text-[var(--color-ink)] font-semibold font-sans">{ticket.qty} General Admission</strong>
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-muted)] font-sans tracking-wide mb-1">Date &amp; Time</span>
                  <strong className="text-[var(--color-ink)] font-semibold font-sans">Thursday, June 11 • 6-9PM</strong>
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-muted)] font-sans tracking-wide mb-1">Payment</span>
                  <strong className="text-[var(--color-ink)] font-semibold font-sans capitalize">{ticket.paymentStatus.replace("_", " ")}</strong>
                </div>
              </div>

              <div className="border-t border-dashed border-[color-mix(in_oklch,var(--color-ink)_15%,transparent)] my-3" />

              <div className="flex flex-col items-center justify-center pt-1">
                <div className="relative p-3 rounded-lg border bg-white shadow-sm overflow-hidden group">
                  <div className="absolute left-0 top-0 w-full h-0.5 bg-[var(--color-accent)] animate-bounce z-10" />
                  {qrCodeSrc && (
                    <img
                      src={qrCodeSrc}
                      alt="Admission Ticket QR Code"
                      className={`h-32 w-32 object-contain transition-all duration-500 ${ticketPaid ? "opacity-100 blur-0" : "opacity-25 blur-[6px]"}`}
                    />
                  )}
                  {!ticketPaid && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center z-20">
                      <span className="font-sans text-[11px] font-semibold tracking-tight text-[var(--color-accent)]">Awaiting ops activation</span>
                      <span className="text-[10px] text-[var(--color-muted)] max-w-[20ch] mt-1 font-sans">Pay, then request review to unlock this gate pass</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[var(--color-muted)] text-center max-w-[42ch] mt-3.5 font-sans">
                  Paid passes scan against the event operations API. Pending passes remain visible, but cannot check in until operations marks them paid.
                </p>
              </div>
            </div>
          </div>

          {!ticketPaid ? (
            <div className="rounded-xl border border-[var(--color-accent)]/20 bg-[color-mix(in_oklch,var(--color-accent)_4%,var(--color-bg))] p-4.5 space-y-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-display font-semibold text-lg text-[var(--color-ink)]">Secure Ticket Payment Gateway</h5>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">
                    Add ticket code <strong className="text-[var(--color-ink)]">{ticket.code}</strong> in your PayPal note, then request review.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--color-muted)] font-sans block mb-0.5">Amount Due</span>
                  <strong className="text-2xl font-bold font-display text-[var(--color-accent)]">${ticket.totalDue.toFixed(2)}</strong>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <Button asChild size="lg" className="w-full justify-center">
                  <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer">Pay via PayPal Secure ➔</a>
                </Button>
                <Button variant="secondary" size="lg" onClick={handlePaymentReviewRequest} className="w-full" disabled={isSubmitting || ticket.paymentStatus === "pending_review"}>
                  {ticket.paymentStatus === "pending_review" ? "Review Requested" : "I Sent PayPal Payment"}
                </Button>
              </div>

              <label className="block pt-1 text-left text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                Optional PayPal reference / sender note
                <input
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                  placeholder={`Use ticket note ${ticket.code}`}
                  className="input-field mt-1"
                />
              </label>
              {formMessage && <p className="text-xs text-[var(--color-muted)] leading-relaxed">{formMessage}</p>}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-signal)]/20 bg-[color-mix(in_oklch,var(--color-signal)_4%,var(--color-bg))] p-5 text-center">
              <h5 className="font-display font-bold text-lg text-[var(--color-ink)]">Ticket Activated!</h5>
              <p className="text-sm text-[var(--color-muted)] max-w-[42ch] mx-auto mt-1">Thank you for your support of HTI and Portal HQ. See you on June 11th.</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <form onSubmit={handleTicketSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white font-sans tabular-nums">01</span>
                <h4 className="font-display font-bold text-lg text-[var(--color-ink)]">Select Ticket Quantity</h4>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <label className="font-semibold block text-sm text-[var(--color-ink)]">Admission Passes</label>
                  <span className="text-xs text-[var(--color-muted)]">$5.00 each • Fills seats + funds wipes</span>
                </div>
                <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-[var(--radius-md)] p-1 self-end sm:self-auto shadow-sm">
                  <button type="button" onClick={() => setTicketQty((q) => Math.max(1, q - 1))} className="h-9 w-9 flex items-center justify-center rounded text-lg font-bold hover:bg-white/10 text-white transition-colors active:scale-95">−</button>
                  <input type="number" value={ticketQty} readOnly className="w-12 text-center text-base font-bold font-sans tabular-nums focus:outline-none bg-transparent text-white" />
                  <button type="button" onClick={() => setTicketQty((q) => Math.min(20, q + 1))} className="h-9 w-9 flex items-center justify-center rounded text-lg font-bold hover:bg-white/10 text-white transition-colors active:scale-95">+</button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white font-sans tabular-nums">02</span>
                <h4 className="font-display font-bold text-lg text-[var(--color-ink)]">Add Campaign Donation</h4>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-4">
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">Support HTI’s 501(c)(3) mission to buy secure drive wipes, license OS platforms, and distribute refurbished machines.</p>
                <div className="grid grid-cols-4 gap-2">
                  {["25", "50", "100", "custom"].map((preset) => (
                    <button key={preset} type="button" onClick={() => handlePresetSelect(preset)} className={`py-2 px-3 rounded-lg border font-sans tabular-nums text-sm font-semibold tracking-tight transition-all duration-200 ${donationPreset === preset ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-sm shadow-orange-500/20" : "bg-black/30 border-white/10 text-white hover:border-[var(--color-accent)]/50 hover:bg-black/50"}`}>
                      {preset === "custom" ? "Other" : `$${preset}`}
                    </button>
                  ))}
                </div>
                <input type="range" min={donationPreset === "custom" ? "0" : "25"} max="250" step="5" value={donationValue} onChange={handleDonationSliderChange} className="w-full accent-[var(--color-accent)] h-1 rounded bg-white/10 cursor-pointer" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[var(--color-muted)]">Donation Amount</span>
                  <div className="relative rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3 py-1.5 flex items-center shadow-sm w-32">
                    <span className="text-[var(--color-muted)] font-semibold text-sm mr-1">$</span>
                    <input type="number" min="0" value={donationValue} onChange={handleDonationInputChange} className="w-full font-sans tabular-nums text-sm font-bold text-right bg-transparent text-white focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white font-sans tabular-nums">03</span>
                <h4 className="font-display font-bold text-lg text-[var(--color-ink)]">Primary Guest Information</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-6 w-full text-left">
                <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">
                  Guest Name
                  <input type="text" required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" className="input-field" />
                </label>
                <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">
                  Email Address
                  <input type="email" required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="you@example.com" className="input-field" />
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] rounded-2xl bg-[var(--color-surface)] p-5 md:p-6 space-y-4.5 shadow-sm lg:sticky lg:top-24">
            <div>
              <div className="text-xs font-bold text-[var(--color-accent)] tracking-wide font-sans">Invoice Breakdown</div>
              <h4 className="font-display font-bold text-xl text-[var(--color-ink)] mt-1">Summary Sheet</h4>
            </div>
            <div className="border-t border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] pt-3.5 space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-[var(--color-ink)]"><span>{ticketQty} × General Admission Ticket{ticketQty > 1 ? "s" : ""}</span><span className="font-sans tabular-nums font-semibold">${invoiceTicketsCost.toFixed(2)}</span></div>
              <div className="flex justify-between items-center text-[var(--color-ink)]"><span>Additional Donation</span><span className="font-sans tabular-nums font-semibold">${donationValue.toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span>Processing & Platform Fees</span><span className="font-sans tabular-nums font-bold text-[var(--color-signal)] text-xs px-2 py-0.5 rounded bg-[var(--color-signal)]/10">FREE</span></div>
            </div>
            <div className="border-t border-[color-mix(in_oklch,var(--color-ink)_15%,transparent)] border-dashed pt-3.5 flex justify-between items-baseline">
              <strong className="font-display font-bold text-base text-[var(--color-ink)]">Total Due</strong>
              <strong className="font-display text-2xl font-black text-[var(--color-accent)]">${invoiceTotal.toFixed(2)}</strong>
            </div>
            <div className="space-y-3 pt-1">
              <Button type="submit" size="lg" className="w-full justify-center" disabled={isSubmitting}>{isSubmitting ? "Creating Secure Pass..." : "Register & Get Ticket ➔"}</Button>
              <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:underline py-1 transition-colors">Or, donate directly via PayPal</a>
              {formMessage && <p className="text-xs text-[var(--color-muted)] leading-relaxed">{formMessage}</p>}
            </div>
          </div>
        </div>
      </form>
    );
  }

  if (laptopStep === "success") {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-signal)]/30 bg-[color-mix(in_oklch,var(--color-signal)_4%,var(--color-surface))] p-6 md:p-8 text-center space-y-4.5">
        <div>
          <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-1.5">Pledge Received. Thank You!</h3>
          <p className="text-[var(--color-muted)] text-sm max-w-[44ch] mx-auto leading-relaxed">We’ve registered your laptop pledge in the event operations queue. A coordinating representative from HTI can now schedule drop-off, data wipe, and receipt handling.</p>
        </div>
        <div className="font-sans tabular-nums text-xs text-[var(--color-muted)] py-1.5 bg-black/20 rounded-lg border border-white/10 inline-block px-3.5">
          Tracking ID: <span className="text-[var(--color-ink)] font-bold">{pledge?.id || "Saved"}</span>
        </div>
        {formMessage && <p className="text-xs text-[var(--color-muted)]">{formMessage}</p>}
        <button onClick={handleResetLaptop} className="text-sm font-semibold text-[var(--color-accent)] hover:underline">Pledge Another Device ➔</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLaptopSubmit} className="space-y-4.5">
      <div>
        <span className="text-xs font-bold text-[var(--color-accent)] tracking-wide block mb-1.5 font-sans">HTI × Portal Live Drive</span>
        <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">Pledge a Laptop</h3>
        <p className="text-xs text-[var(--color-muted)] mt-1.5 leading-relaxed font-sans">Every machine pledged goes through secure data handling, wipe verification, refurbishment, and direct distribution to an NC family in need.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 w-full text-left">
        <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">
          How Many Laptops?
          <input type="number" name="quantity" min="1" required value={laptopData.quantity} onChange={handleLaptopChange} className="input-field" />
        </label>
        <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">
          Brand / Model (Optional)
          <input type="text" name="brand" placeholder="Dell, Lenovo, MacBook etc." value={laptopData.brand} onChange={handleLaptopChange} className="input-field" />
        </label>
      </div>

      <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full text-left">
        General Hardware Condition
        <select name="condition" required value={laptopData.condition} onChange={handleLaptopChange} className="input-field bg-transparent py-1 border-b border-[var(--color-border-strong)] outline-none">
          <option value="" className="bg-[var(--color-panel)] text-[var(--color-ink)]">Select general condition...</option>
          <option value="excellent" className="bg-[var(--color-panel)] text-[var(--color-ink)]">Excellent — boots fast, clean display</option>
          <option value="good" className="bg-[var(--color-panel)] text-[var(--color-ink)]">Good — functional, minor scratches</option>
          <option value="fair" className="bg-[var(--color-panel)] text-[var(--color-ink)]">Fair — boots but needs cleanup</option>
        </select>
      </label>

      <div className="border-t border-white/10 pt-6.5 space-y-6 w-full">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent)] block text-left">Coordination Details</span>
        <div className="grid sm:grid-cols-2 gap-6 w-full text-left">
          <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">Your Full Name<input type="text" name="name" required placeholder="Your name" value={laptopData.name} onChange={handleLaptopChange} className="input-field" /></label>
          <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">Email Address<input type="email" name="email" required placeholder="you@domain.com" value={laptopData.email} onChange={handleLaptopChange} className="input-field" /></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 w-full text-left">
          <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">Phone Number<input type="tel" name="phone" placeholder="(919) 555-0199" value={laptopData.phone} onChange={handleLaptopChange} className="input-field" /></label>
          <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">Notes or Pickup Preferences<input type="text" name="notes" placeholder="Has charger, pick up from office, etc." value={laptopData.notes} onChange={handleLaptopChange} className="input-field" /></label>
        </div>
      </div>

      <div className="pt-1.5">
        <Button type="submit" size="lg" className="w-full justify-center" disabled={isSubmitting}>{isSubmitting ? "Saving Pledge..." : "Pledge Device Now ➔"}</Button>
        <p className="text-center text-[10px] text-[var(--color-muted)] mt-2.5">By submitting this form you authorize HTI to contact you about hardware collection and receipt handling.</p>
        {formMessage && <p className="text-center text-xs text-[var(--color-muted)] mt-2.5">{formMessage}</p>}
      </div>
    </form>
  );
}
