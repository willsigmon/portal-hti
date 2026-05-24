"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";

type Mode = "ticket" | "laptop";
type TicketStep = "configure" | "wallet";
type LaptopStep = "details" | "success";

interface PledgeFormProps {
  mode?: Mode;
}

export function PledgeForm({ mode = "laptop" }: PledgeFormProps) {
  // ---- TICKET MODE STATE ----
  const [ticketStep, setTicketStep] = useState<TicketStep>("configure");
  const [ticketQty, setTicketQty] = useState(1);
  const [donationPreset, setDonationPreset] = useState("25");
  const [donationValue, setDonationValue] = useState(25);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [ticketPaid, setTicketPaid] = useState(false);

  // ---- LAPTOP MODE STATE ----
  const [laptopStep, setLaptopStep] = useState<LaptopStep>("details");
  const [laptopData, setLaptopData] = useState({
    quantity: 1,
    brand: "",
    condition: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Check localStorage for existing ticket on mount
  useEffect(() => {
    if (mode === "ticket") {
      const savedTicket = localStorage.getItem("ss_event_ticket");
      if (savedTicket) {
        const parsed = JSON.parse(savedTicket);
        setTicketQty(parsed.qty || 1);
        setDonationValue(parsed.donation || 0);
        setGuestName(parsed.guestName || "");
        setGuestEmail(parsed.guestEmail || "");
        setTicketCode(parsed.code || "");
        setTicketPaid(parsed.paid || false);
        setTicketStep("wallet");
      }
    }
  }, [mode]);

  // Sync preset chip selection with slider/input
  const handlePresetSelect = (preset: string) => {
    setDonationPreset(preset);
    if (preset !== "custom") {
      const val = parseInt(preset);
      setDonationValue(val);
    }
  };

  const handleDonationSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setDonationValue(val);
    if (val === 25 || val === 50 || val === 100) {
      setDonationPreset(val.toString());
    } else {
      setDonationPreset("custom");
    }
  };

  const handleDonationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) val = 0;
    setDonationValue(val);
    if (val === 25 || val === 50 || val === 100) {
      setDonationPreset(val.toString());
    } else {
      setDonationPreset("custom");
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = guestName.trim() || "Event Guest";
    const finalCode = `SS-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTicket = {
      guestName: finalName,
      guestEmail: guestEmail.trim(),
      qty: ticketQty,
      donation: donationValue,
      code: finalCode,
      paid: false,
    };

    localStorage.setItem("ss_event_ticket", JSON.stringify(newTicket));
    setTicketCode(finalCode);
    setTicketPaid(false);
    setTicketStep("wallet");

    // Emit event to notify navbar/retrieval badges
    window.dispatchEvent(new Event("ticketSync"));
  };

  const handleMarkAsPaid = () => {
    const savedTicket = localStorage.getItem("ss_event_ticket");
    if (savedTicket) {
      const parsed = JSON.parse(savedTicket);
      parsed.paid = true;
      localStorage.setItem("ss_event_ticket", JSON.stringify(parsed));
      setTicketPaid(true);
      window.dispatchEvent(new Event("ticketSync"));
    }
  };

  const handleResetTicket = () => {
    localStorage.removeItem("ss_event_ticket");
    setTicketStep("configure");
    setTicketQty(1);
    setDonationValue(25);
    setDonationPreset("25");
    setGuestName("");
    setGuestEmail("");
    setTicketCode("");
    setTicketPaid(false);
    window.dispatchEvent(new Event("ticketSync"));
  };

  // ---- LAPTOP MODE ACTIONS ----
  const handleLaptopChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLaptopData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLaptopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPledges = JSON.parse(localStorage.getItem("ss_pledges") || "[]");

    const newPledge = {
      name: laptopData.name.trim() || "Anonymous",
      count: parseInt(laptopData.quantity as any) || 1,
      details: laptopData.brand.trim() || "Laptop Device",
      condition: laptopData.condition,
      time: "Just Now",
      code: `PLG-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    const updatedPledges = [...currentPledges, newPledge];
    localStorage.setItem("ss_pledges", JSON.stringify(updatedPledges));

    setLaptopStep("success");

    // Emit live synchronization trigger for progress bar
    window.dispatchEvent(new Event("pledgeSync"));
  };

  const handleResetLaptop = () => {
    setLaptopStep("details");
    setLaptopData({
      quantity: 1,
      brand: "",
      condition: "",
      name: "",
      email: "",
      phone: "",
      notes: "",
    });
  };

  // ---- RENDER TICKET MODE ----
  if (mode === "ticket") {
    if (ticketStep === "wallet") {
      const totalDue = ticketQty * 5 + donationValue;
      const verifyUrl = typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}?verify=${ticketCode}&guest=${encodeURIComponent(guestName)}&qty=${ticketQty}&donation=${donationValue}`
        : "";
      const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`;

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xl tracking-tight text-[var(--color-ink)]">
              Your Interactive Event Pass
            </h4>
            <button
              onClick={handleResetTicket}
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              Start Over / Reserve Another
            </button>
          </div>

          {/* Premium Dashed Coupon Ticket Pass */}
          <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_12%,transparent)] bg-[var(--color-surface)] shadow-lg">
            {/* Top Indicator Strip */}
            <div
              className={`px-6 py-2.5 text-center text-xs font-bold font-sans tracking-wide ${
                ticketPaid
                  ? "bg-[var(--color-signal)] text-white"
                  : "bg-[var(--color-accent)] text-white"
              }`}
            >
              {ticketPaid ? "✓ Pass Activated — Entrance Granted" : "⚠️ Pending Payment / Inactive"}
            </div>

            {/* Main Ticket Info */}
            <div className="p-4.5 md:p-6 space-y-4.5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[var(--color-muted)] text-xs font-semibold tracking-wide font-sans">
                    Official Joint Event Pass
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-tight mt-1 text-[var(--color-ink)]">
                    Sip & Sync Social Hour
                  </h3>
                </div>
                <div className="font-sans tabular-nums text-sm px-3 py-1.5 rounded bg-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] self-start md:self-auto select-all">
                  #{ticketCode}
                </div>
              </div>

              {/* Separator dots */}
              <div className="border-t border-dashed border-[color-mix(in_oklch,var(--color-ink)_15%,transparent)] my-3 relative">
                <div className="absolute -left-[33px] -top-2 h-4 w-4 rounded-full bg-[var(--color-bg)] border-r border-[color-mix(in_oklch,var(--color-ink)_12%,transparent)]" />
                <div className="absolute -right-[33px] -top-2 h-4 w-4 rounded-full bg-[var(--color-bg)] border-l border-[color-mix(in_oklch,var(--color-ink)_12%,transparent)]" />
              </div>

              {/* Pass details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4.5 text-sm">
                <div>
                  <span className="block text-xs text-[var(--color-muted)] font-sans tracking-wide mb-1">
                    Guest Name
                  </span>
                  <strong className="text-[var(--color-ink)] font-semibold font-sans">{guestName}</strong>
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-muted)] font-sans tracking-wide mb-1">
                    Passes Held
                  </span>
                  <strong className="text-[var(--color-ink)] font-semibold font-sans">
                    {ticketQty} General Admission
                  </strong>
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-muted)] font-sans tracking-wide mb-1">
                    Date &amp; Time
                  </span>
                  <strong className="text-[var(--color-ink)] font-semibold font-sans">
                    Thursday, June 11 • 6-9PM
                  </strong>
                </div>
                <div>
                  <span className="block text-xs text-[var(--color-muted)] font-sans tracking-wide mb-1">
                    Event Venue
                  </span>
                  <strong className="text-[var(--color-ink)] font-semibold font-sans whitespace-nowrap">
                    Portal HQ, Raleigh
                  </strong>
                </div>
              </div>

              {/* Separator dots */}
              <div className="border-t border-dashed border-[color-mix(in_oklch,var(--color-ink)_15%,transparent)] my-3 relative">
                <div className="absolute -left-[33px] -top-2 h-4 w-4 rounded-full bg-[var(--color-bg)] border-r border-[color-mix(in_oklch,var(--color-ink)_12%,transparent)]" />
                <div className="absolute -right-[33px] -top-2 h-4 w-4 rounded-full bg-[var(--color-bg)] border-l border-[color-mix(in_oklch,var(--color-ink)_12%,transparent)]" />
              </div>

              {/* Interactive QR Code scan preview */}
              <div className="flex flex-col items-center justify-center pt-1">
                <div className="relative p-3 rounded-lg border bg-white shadow-sm overflow-hidden group">
                  {/* Scanner laser sweep line */}
                  <div className="absolute left-0 top-0 w-full h-0.5 bg-[var(--color-accent)] animate-bounce z-10" />

                  {/* QR Image */}
                  <img
                    src={qrCodeSrc}
                    alt="Admission Ticket QR Code"
                    className={`h-32 w-32 object-contain transition-all duration-500 ${
                      ticketPaid ? "opacity-100 blur-0" : "opacity-25 blur-[6px]"
                    }`}
                  />

                  {/* Lock Screen for Unpaid */}
                  {!ticketPaid && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center z-20">
                      <svg
                        className="h-7 w-7 text-[var(--color-accent)] animate-pulse mb-1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="font-sans text-[11px] font-semibold tracking-tight text-[var(--color-accent)]">
                        Awaiting payment
                      </span>
                      <span className="text-[10px] text-[var(--color-muted)] max-w-[20ch] mt-1 font-sans">
                        Complete payment below to activate this gate pass
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-[var(--color-muted)] text-center max-w-[38ch] mt-3.5 font-sans">
                  Show this digital QR pass at the Portal HQ entrance on June 11th. A copy of your tax receipt and pass details was saved to this browser.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Payment CTAs */}
          {!ticketPaid ? (
            <div className="rounded-xl border border-[var(--color-accent)]/20 bg-[color-mix(in_oklch,var(--color-accent)_4%,var(--color-bg))] p-4.5 space-y-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-display font-semibold text-lg text-[var(--color-ink)]">
                    Secure Ticket Payment Gateway
                  </h5>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">
                    Complete payment to activate your ticket. Additional gifts can be receipted as donations.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--color-muted)] font-sans block mb-0.5">Amount Due</span>
                  <strong className="text-2xl font-bold font-display text-[var(--color-accent)]">
                    ${totalDue.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <Button asChild size="lg" className="w-full justify-center">
                  <a
                    href="https://www.paypal.com/donate/?hosted_button_id=C6QJ6V23C63P2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pay via PayPal Secure ➔
                  </a>
                </Button>
                <Button variant="secondary" size="lg" onClick={handleMarkAsPaid} className="w-full">
                  I Have Completed Payment
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-signal)]/20 bg-[color-mix(in_oklch,var(--color-signal)_4%,var(--color-bg))] p-5 text-center">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-signal)]/10 text-[var(--color-signal)] mb-2.5">
                <svg
                  className="h-5.5 w-5.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h5 className="font-display font-bold text-lg text-[var(--color-ink)]">
                Ticket Activated!
              </h5>
              <p className="text-sm text-[var(--color-muted)] max-w-[42ch] mx-auto mt-1">
                Thank you for your support of HTI and Portal HQ. Your donation helps bridge the NC digital divide. See you on June 11th!
              </p>
            </div>
          )}
        </div>
      );
    }

    // configure step
    const invoiceTicketsCost = ticketQty * 5;
    const invoiceTotal = invoiceTicketsCost + donationValue;

    return (
      <form onSubmit={handleTicketSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Configurator Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Quantity */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white font-sans tabular-nums">
                  01
                </span>
                <h4 className="font-display font-bold text-lg text-[var(--color-ink)]">
                  Select Ticket Quantity
                </h4>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <label className="font-semibold block text-sm text-[var(--color-ink)]">
                    Admission Passes
                  </label>
                  <span className="text-xs text-[var(--color-muted)]">
                    $5.00 each • Fills seats + funds wipes
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-[var(--radius-md)] p-1 self-end sm:self-auto shadow-sm">
                  <button
                    type="button"
                    onClick={() => setTicketQty((q) => Math.max(1, q - 1))}
                    className="h-9 w-9 flex items-center justify-center rounded text-lg font-bold hover:bg-white/10 text-white transition-colors active:scale-95"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={ticketQty}
                    readOnly
                    className="w-12 text-center text-base font-bold font-sans tabular-nums focus:outline-none bg-transparent text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setTicketQty((q) => Math.min(10, q + 1))}
                    className="h-9 w-9 flex items-center justify-center rounded text-lg font-bold hover:bg-white/10 text-white transition-colors active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Donation Slider & Presets */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white font-sans tabular-nums">
                  02
                </span>
                <h4 className="font-display font-bold text-lg text-[var(--color-ink)]">
                  Add Campaign Donation
                </h4>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-4">
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  Support HTI's 501(c)(3) mission to buy secure drive wipes, license OS platforms, and distribute refurbished machines to families in need.
                </p>

                {/* Preset Option Chips */}
                <div className="grid grid-cols-4 gap-2">
                  {["25", "50", "100", "custom"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`py-2 px-3 rounded-lg border font-sans tabular-nums text-sm font-semibold tracking-tight transition-all duration-200 ${
                        donationPreset === preset
                          ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-sm shadow-orange-500/20"
                          : "bg-black/30 border-white/10 text-white hover:border-[var(--color-accent)]/50 hover:bg-black/50"
                      }`}
                    >
                      {preset === "custom" ? "Other" : `$${preset}`}
                    </button>
                  ))}
                </div>

                {/* Range Slider synced with Input */}
                <div className="space-y-3">
                  <input
                    type="range"
                    min={donationPreset === "custom" ? "0" : "25"}
                    max="250"
                    step="5"
                    value={donationValue}
                    onChange={handleDonationSliderChange}
                    className="w-full accent-[var(--color-accent)] h-1 rounded bg-white/10 cursor-pointer"
                  />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-[var(--color-muted)]">Donation Slider</span>
                    <div className="relative rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3 py-1.5 flex items-center shadow-sm w-32">
                      <span className="text-[var(--color-muted)] font-semibold text-sm mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        value={donationValue}
                        onChange={handleDonationInputChange}
                        className="w-full font-sans tabular-nums text-sm font-bold text-right bg-transparent text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Guest details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white font-sans tabular-nums">
                  03
                </span>
                <h4 className="font-display font-bold text-lg text-[var(--color-ink)]">
                  Primary Guest Information
                </h4>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1 font-sans">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] placeholder-white/30 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1 font-sans">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] placeholder-white/30 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Invoice Column */}
          <div className="lg:col-span-5 border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] rounded-2xl bg-[var(--color-surface)] p-5 md:p-6 space-y-4.5 shadow-sm lg:sticky lg:top-24">
            <div>
              <div className="text-xs font-bold text-[var(--color-accent)] tracking-wide font-sans">
                Invoice Breakdown
              </div>
              <h4 className="font-display font-bold text-xl text-[var(--color-ink)] mt-1">
                Summary Sheet
              </h4>
            </div>

            <div className="border-t border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] pt-3.5 space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-[var(--color-ink)]">
                <span>
                  {ticketQty} × General Admission Ticket{ticketQty > 1 ? "s" : ""}
                </span>
                <span className="font-sans tabular-nums font-semibold">${invoiceTicketsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--color-ink)]">
                <span>Tax-Deductible Donation</span>
                <span className="font-sans tabular-nums font-semibold">${donationValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Processing & Platform Fees</span>
                <span className="font-sans tabular-nums font-bold text-[var(--color-signal)] text-xs px-2 py-0.5 rounded bg-[var(--color-signal)]/10">
                  FREE
                </span>
              </div>
            </div>

            <div className="border-t border-[color-mix(in_oklch,var(--color-ink)_15%,transparent)] border-dashed pt-3.5 flex justify-between items-baseline">
              <strong className="font-display font-bold text-base text-[var(--color-ink)]">
                Total Due
              </strong>
              <strong className="font-display text-2xl font-black text-[var(--color-accent)]">
                ${invoiceTotal.toFixed(2)}
              </strong>
            </div>

            <div className="space-y-3 pt-1">
              <Button type="submit" size="lg" className="w-full justify-center">
                Register & Get Ticket ➔
              </Button>

              <a
                href="https://www.paypal.com/donate/?hosted_button_id=C6QJ6V23C63P2"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:underline py-1 transition-colors"
              >
                Or, donate directly via PayPal
              </a>
            </div>
          </div>
        </div>
      </form>
    );
  }

  // ---- RENDER LAPTOP MODE ----
  if (laptopStep === "success") {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-signal)]/30 bg-[color-mix(in_oklch,var(--color-signal)_4%,var(--color-surface))] p-6 md:p-8 text-center space-y-4.5">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-signal)]/15 text-[var(--color-signal)] mb-1">
          <svg
            className="h-5.5 w-5.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-1.5">
            Pledge Received. Thank You!
          </h3>
          <p className="text-[var(--color-muted)] text-sm max-w-[44ch] mx-auto leading-relaxed">
            We’ve securely registered your laptop pledge to the live drive stats stream. A coordinating representative from HTI will reach out within 48 hours to coordinate drop-off details and schedule your data wipe.
          </p>
        </div>
        <div className="font-sans tabular-nums text-xs text-[var(--color-muted)] py-1.5 bg-black/20 rounded-lg border border-white/10 inline-block px-3.5">
          Tracking ID: <span className="text-[var(--color-ink)] font-bold">PLG-{Date.now().toString().slice(-6)}</span>
        </div>
        <div>
          <button
            onClick={handleResetLaptop}
            className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
          >
            Pledge Another Device ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleLaptopSubmit} className="space-y-4.5">
      <div>
        <span className="text-xs font-bold text-[var(--color-accent)] tracking-wide block mb-1.5 font-sans">
          HTI × Portal Live Drive
        </span>
        <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
          Pledge a Laptop
        </h3>
        <p className="text-xs text-[var(--color-muted)] mt-1.5 leading-relaxed font-sans">
          Every machine pledged goes through secure US DoD-grade data wipes. We completely clean it, install secure operating systems, and provide it directly to an NC family in need.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1 font-sans">
            How Many Laptops?
          </label>
          <input
            type="number"
            name="quantity"
            min="1"
            required
            value={laptopData.quantity}
            onChange={handleLaptopChange}
            className="w-full rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1 font-sans">
            Brand / Model (Optional)
          </label>
          <input
            type="text"
            name="brand"
            placeholder="Dell Latitude, MacBook, Lenovo etc."
            value={laptopData.brand}
            onChange={handleLaptopChange}
            className="w-full rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1 font-sans">
          General Hardware Condition
        </label>
        <select
          name="condition"
          required
          value={laptopData.condition}
          onChange={handleLaptopChange}
          className="w-full rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] shadow-sm [&>option]:bg-[#131127] [&>option]:text-white"
        >
          <option value="">Select general condition...</option>
          <option value="excellent">Excellent — boots fast, perfect display screen</option>
          <option value="good">Good — functional, holds a charge, minor surface scratches</option>
          <option value="fair">Fair — boots up but holds weak charge or operates slowly</option>
        </select>
      </div>

      {/* Contact info grid */}
      <div className="border-t border-white/10 pt-4.5 space-y-3.5">
        <span className="text-xs font-bold text-[var(--color-accent)] tracking-wide block font-sans mb-2">
          Coordination Details
        </span>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1 font-sans">
              Your Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Your name"
              value={laptopData.name}
              onChange={handleLaptopChange}
              className="w-full rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1 font-sans">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              value={laptopData.email}
              onChange={handleLaptopChange}
              className="w-full rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] shadow-sm"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1 font-sans">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="(919) 555-0199"
              value={laptopData.phone}
              onChange={handleLaptopChange}
              className="w-full rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] shadow-sm font-sans"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1 font-sans">
              Notes or Pickup Preferences
            </label>
            <textarea
              name="notes"
              rows={1}
              placeholder="Has charger, pick up from office, etc."
              value={laptopData.notes}
              onChange={handleLaptopChange}
              className="w-full rounded-[var(--radius-md)] border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] shadow-sm resize-none font-sans"
            />
          </div>
        </div>
      </div>

      <div className="pt-1.5">
        <Button type="submit" size="lg" className="w-full justify-center">
          Pledge Device Now ➔
        </Button>
        <p className="text-center text-[10px] text-[var(--color-muted)] mt-2.5">
          By submitting this form you authorize HTI to issue an official 501(c)(3) tax certificate upon hardware collection.
        </p>
      </div>
    </form>
  );
}
