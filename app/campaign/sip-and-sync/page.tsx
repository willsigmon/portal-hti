"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Mail, Phone, MapPin, Calendar, Heart, Award, ArrowUpRight, CheckCircle, Share2, Ticket } from "lucide-react";
import { Button } from "@/components/Button";
import { HTILogo } from "@/components/HTILogo";
import { PledgeForm } from "@/components/PledgeForm";
import { Starfield } from "@/components/Starfield";
import { Toast, type ToastRef } from "@/components/Toast";

interface Pledge {
  name: string;
  count: number;
  details: string;
  condition: string;
  time: string;
  code: string;
}

export default function SipAndSync() {
  const toastRef = useRef<ToastRef | null>(null);

  // ---- APP STATE ----
  const PLEDGE_GOAL = 150;
  const [pledgesCount, setPledgesCount] = useState(0);
  const [remainingCount, setRemainingCount] = useState(PLEDGE_GOAL);
  const [percentage, setPercentage] = useState(0);
  const [hasTicket, setHasTicket] = useState(false);
  const [savedTicketName, setSavedTicketName] = useState("");

  // Scan check-in verification modal
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanData, setScanData] = useState({
    code: "",
    guest: "",
    qty: "1",
    donation: "0",
  });

  // ---- HONEST LOCAL PLEDGE TRACKER SYNC ----
  const syncCampaignTracker = () => {
    let stored: Pledge[] = [];

    try {
      stored = JSON.parse(localStorage.getItem("ss_pledges") || "[]");
    } catch {
      stored = [];
    }

    const totalPledged = stored.reduce((sum: number, item: Pledge) => {
      const count = Number(item.count);
      return sum + (Number.isFinite(count) && count > 0 ? count : 0);
    }, 0);

    setPledgesCount(totalPledged);
    setRemainingCount(Math.max(PLEDGE_GOAL - totalPledged, 0));
    setPercentage(Math.min(100, Math.round((totalPledged / PLEDGE_GOAL) * 100)));
  };

  const syncTicketBadge = () => {
    const saved = localStorage.getItem("ss_event_ticket");
    if (saved) {
      const parsed = JSON.parse(saved);
      setHasTicket(true);
      setSavedTicketName(parsed.guestName || "Guest");
    } else {
      setHasTicket(false);
    }
  };

  useEffect(() => {
    // Initialize the pledge store empty; no fake baseline numbers.
    const stored = localStorage.getItem("ss_pledges");
    if (!stored) {
      localStorage.setItem("ss_pledges", "[]");
    }

    syncCampaignTracker();
    syncTicketBadge();

    // Check URL parameters for simulated QR code check-in scans
    const params = new URLSearchParams(window.location.search);
    if (params.has("verify")) {
      const codeVal = params.get("verify") || "";
      const guestVal = params.get("guest") || "Guest";
      const qtyVal = params.get("qty") || "1";
      const donationVal = params.get("donation") || "0";

      setScanData({
        code: codeVal,
        guest: decodeURIComponent(guestVal),
        qty: qtyVal,
        donation: donationVal,
      });
      setScanModalOpen(true);

      // Prevent screen scroll
      document.body.style.overflow = "hidden";
    }

    // Listen to custom local storage sync events emitted by PledgeForm
    const handlePledgeSync = () => {
      syncCampaignTracker();
      toastRef.current?.show("Live laptop progress drive updated!");
    };

    const handleTicketSync = () => {
      syncTicketBadge();
    };

    window.addEventListener("pledgeSync", handlePledgeSync);
    window.addEventListener("ticketSync", handleTicketSync);

    return () => {
      window.removeEventListener("pledgeSync", handlePledgeSync);
      window.removeEventListener("ticketSync", handleTicketSync);
    };
  }, []);

  const handleCloseScanModal = () => {
    setScanModalOpen(false);
    document.body.style.overflow = "";

    // Clear check-in query parameters without reload
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: cleanUrl }, "", cleanUrl);
  };

  // ---- MOUSE SPOTLIGHT EFFECT TRACKER ----
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + window.location.pathname)
        .then(() => {
          toastRef.current?.show("Event link copied to clipboard!");
        })
        .catch(() => {
          toastRef.current?.show("Failed to copy link.");
        });
    }
  };

  const handleOpenTicket = () => {
    // Scroll directly to ticket section to inspect pass
    const section = document.getElementById("tickets");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });

      // Dispatch dummy event to toggle mode if already there
      toastRef.current?.show("Retrieving active pass details...");
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white">
      {/* 3D Space Starfield Background */}
      <Starfield opacity={0.55} />

      {/* STICKY GLASSMORPHIC NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="container flex h-20 md:h-24 items-center justify-between">
          <div className="flex items-center gap-3.5">
            <HTILogo className="h-[34px] md:h-[56px] w-auto filter contrast-[1.03] transition-all object-contain" />
            <span className="text-base text-[var(--color-muted)] font-display font-bold select-none opacity-45 mx-0.5">×</span>
            <img src="/portal-logo.png" alt="Portal HQ" className="h-[42px] md:h-[62px] w-auto filter contrast-[1.02] transition-all object-contain" />
          </div>

          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full border border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] bg-[var(--color-surface)]/55 backdrop-blur-md shadow-inner">
            <a href="#about" className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] text-[var(--color-muted)]">The Collaboration</a>
            <a href="#tickets" className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] text-[var(--color-muted)]">Tickets &amp; Donations</a>
            <a href="#pledge" className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] text-[var(--color-muted)]">Laptop Pledge Drive</a>
            <a href="#connect" className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] text-[var(--color-muted)]">Connect</a>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {hasTicket && (
              <button
                onClick={handleOpenTicket}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10 text-xs font-semibold text-[var(--color-accent)] transition-all font-sans"
              >
                <Ticket className="h-3.5 w-3.5 animate-pulse" />
                Active Pass
              </button>
            )}
            <Button size="default" variant="primary" asChild>
              <a href="#tickets">Get Tickets</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="container pt-8 md:pt-16 pb-20 relative">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)] text-xs font-medium tracking-tight text-[var(--color-muted)] font-sans">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              HTI × Portal HQ presents
            </div>

            <h1 className="display-xl leading-[0.9] tracking-[-0.045em] uppercase text-[var(--color-ink)]">
              SIP &amp; <span className="text-[var(--color-accent)] relative">SYNC<span className="absolute -bottom-1.5 left-0 w-full h-1 bg-[var(--color-accent)]/25 rounded" /></span><br />
              <span className="block sm:inline">SOCIAL</span><span className="hidden sm:inline"> </span><span className="block sm:inline">HOUR</span>
            </h1>

            <p className="text-xl md:text-2xl font-display font-semibold italic text-[var(--color-muted)] tracking-tight max-w-[28ch] border-l-2 border-[var(--color-accent)]/40 pl-4">
              "Old Laptops. New Opportunities."
            </p>

            <p className="text-base md:text-lg text-[var(--color-muted)] max-w-[48ch] leading-relaxed">
              Come join us in Raleigh for a fun social hour. Meet local business owners, enjoy free drinks, and bring an old laptop to help NC families get online.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" asChild>
                <a href="#tickets">Reserve Spot</a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a href="#pledge">Donate Laptop</a>
              </Button>
            </div>
          </div>

          {/* Strong visual hero move - premium Slack meetup mockup framed card */}
          <div className="lg:col-span-5">
            <div onMouseMove={handleMouseMove} className="relative p-2 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-xl transition-all hover:scale-[1.01] duration-300 spotlight-card">
              <div className="absolute -top-3.5 -left-3.5 h-7 w-7 border-t border-l border-[var(--color-accent)] pointer-events-none" />
              <div className="absolute -top-3.5 -right-3.5 h-7 w-7 border-t border-r border-[var(--color-accent)] pointer-events-none" />
              <div className="absolute -bottom-3.5 -left-3.5 h-7 w-7 border-b border-l border-[var(--color-accent)] pointer-events-none" />
              <div className="absolute -bottom-3.5 -right-3.5 h-7 w-7 border-b border-r border-[var(--color-accent)] pointer-events-none" />

              <div className="overflow-hidden rounded-[var(--radius-md)] aspect-[4/3] bg-[var(--color-bg-dark)] shadow-inner">
                <img
                  src="/portal_hq_party_slack_mockup.png"
                  alt="Sip & Sync Social Hour Mockup"
                  className="w-full h-full object-cover filter contrast-[1.04] saturate-[0.98] transition-transform hover:scale-[1.03] duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* EVENT QUICK INFO GRID */}
        <div className="grid sm:grid-cols-3 gap-6 mt-16 md:mt-24">
          {/* Calendar Card */}
          <a
            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Sip+%26+Sync%3A+Laptop+Pledge+Drive+%26+Social+Hour&dates=20260611T220000Z/20260612T010000Z&details=Join+us+for+Sip+%26+Sync%21+A+joint+collaboration+between+Hub+Zone+Tech+and+Portal+HQ+to+close+the+digital+divide+in+North+Carolina.+Bring+your+old+laptops+to+be+securely+wiped+and+donated+to+local+students+in+need.+Enjoy+free+drinks%2C+networking%2C+food%2C+and+more.&location=Portal+HQ%2C+3801+Hillsborough+St+Suite+113%2C+Raleigh%2C+NC+27607"
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            className="group relative block p-6 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm transition-all hover:translate-y-[-2px] hover:border-[var(--color-accent)]/30 duration-300 spotlight-card"
          >
            <div className="flex items-start gap-4">
              {/* Bespoke SVG stitch-style calendar icon */}
              <svg className="h-14 w-14 shrink-0 transition-transform group-hover:scale-105 duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e32" />
                    <stop offset="100%" stopColor="#d9b36a" />
                  </linearGradient>
                </defs>
                <rect x="15" y="25" width="70" height="60" rx="10" stroke="url(#calGrad)" strokeWidth="4" fill="rgba(255, 255, 255, 0.02)" />
                <path d="M15 45H85" stroke="url(#calGrad)" strokeWidth="3" strokeDasharray="3 3" />
                <circle cx="35" cy="15" r="4" fill="#f59e32" />
                <circle cx="65" cy="15" r="4" fill="#d9b36a" />
                <path d="M35 15V28M65 15V28" stroke="url(#calGrad)" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M50 50L53 58L61 61L53 64L50 72L47 64L39 61L47 58Z" fill="#f59e32" />
              </svg>

              <div className="space-y-1">
                <div className="text-xs text-[var(--color-accent)] font-bold font-sans tracking-wide">When</div>
                <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-ink)]">Thursday, June 11</h3>
                <p className="text-sm text-[var(--color-muted)]">6:00 PM – 9:00 PM</p>
              </div>
            </div>
            <span className="absolute bottom-4 right-4 text-[10px] font-semibold text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors flex items-center gap-0.5">
              Add to Calendar <ArrowUpRight className="h-3 w-3" />
            </span>
          </a>

          {/* Location Card */}
          <a
            href="https://maps.google.com/?q=3801+Hillsborough+St,+Suite+113,+Raleigh,+NC+27607"
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            className="group relative block p-6 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm transition-all hover:translate-y-[-2px] hover:border-[var(--color-accent)]/30 duration-300 spotlight-card"
          >
            <div className="flex items-start gap-4">
              {/* Bespoke SVG stitch-style map pin icon */}
              <svg className="h-14 w-14 shrink-0 transition-transform group-hover:scale-105 duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#87b891" />
                    <stop offset="100%" stopColor="#d9b36a" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="85" r="10" stroke="url(#pinGrad)" strokeWidth="1.5" opacity="0.3" strokeDasharray="3 3" />
                <circle cx="50" cy="85" r="18" stroke="url(#pinGrad)" strokeWidth="1" opacity="0.15" />
                <path d="M50 85C50 85 25 55 25 38C25 24.1929 36.1929 13 50 13C63.8071 13 75 24.1929 75 38C75 55 50 85 50 85Z" stroke="url(#pinGrad)" strokeWidth="4" fill="rgba(255, 255, 255, 0.02)" />
                <circle cx="50" cy="38" r="8" fill="#87b891" />
              </svg>

              <div className="space-y-1">
                <div className="text-xs text-[var(--color-accent)] font-bold font-sans tracking-wide">Where</div>
                <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-ink)]">Portal HQ, Raleigh</h3>
                <p className="text-xs text-[var(--color-muted)] leading-tight">3801 Hillsborough St, Suite 113</p>
              </div>
            </div>
            <span className="absolute bottom-4 right-4 text-[10px] font-semibold text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors flex items-center gap-0.5">
              Open Maps <ArrowUpRight className="h-3 w-3" />
            </span>
          </a>

          {/* Tickets Info Card */}
          <a
            href="#tickets"
            onMouseMove={handleMouseMove}
            className="group relative block p-6 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm transition-all hover:translate-y-[-2px] hover:border-[var(--color-accent)]/30 duration-300 spotlight-card"
          >
            <div className="flex items-start gap-4">
              {/* Bespoke SVG stitch-style ticket icon */}
              <svg className="h-14 w-14 shrink-0 transition-transform group-hover:scale-105 duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="tktGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f58420" />
                    <stop offset="100%" stopColor="#ffb800" />
                  </linearGradient>
                </defs>
                <path d="M15 35C15 35 25 35 25 45C25 55 15 55 15 55V75H85V55C85 55 75 55 75 45C75 35 85 35 85 35V15H15V35Z" stroke="url(#tktGrad)" strokeWidth="4" fill="rgba(255, 255, 255, 0.02)" />
                <path d="M40 22V68" stroke="url(#tktGrad)" strokeWidth="2.5" strokeDasharray="5 5" />
                <path d="M60 45L62 49L67 50L63 53L64 57L60 55L56 57L57 53L53 50L58 49Z" fill="#ffb800" />
              </svg>

              <div className="space-y-1">
                <div className="text-xs text-[var(--color-accent)] font-bold font-sans tracking-wide">Admission</div>
                <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-ink)]">$5.00 Tickets</h3>
                <p className="text-sm text-[var(--color-muted)]">Includes craft drinks + live networking</p>
              </div>
            </div>
            <span className="absolute bottom-4 right-4 text-[10px] font-semibold text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors flex items-center gap-0.5">
              Secure Passes <ArrowUpRight className="h-3 w-3" />
            </span>
          </a>
        </div>
      </section>

      {/* THE COLLABORATION (BENTO GRID) */}
      <section id="about" className="section bg-black/20 backdrop-blur-[1px] border-y border-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]">
        <div className="container space-y-12">
          <div className="max-w-2xl">
            <div className="text-xs font-bold text-[var(--color-accent)] tracking-wide mb-1.5 font-sans">
              The Collaboration
            </div>
            <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)]">
              The Collaboration
            </h2>
            <p className="text-lg text-[var(--color-muted)] mt-2">
              Fusing hardware digital accessibility with Raleigh's high-energy startup and creative ecosystem for one powerful night of impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* HTI Bento Card */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 md:p-10 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-xs px-2.5 py-1 rounded bg-orange-500/10 text-orange-600 border border-orange-500/10 font-sans font-bold">
                    501(c)(3) Nonprofit Partner
                  </span>
                </div>

                {/* Massive Brand Logo Wrapper */}
                <div className="flex items-center justify-center min-h-[140px] bg-black/40 border border-white/5 rounded-xl py-6 px-4 relative overflow-hidden group">
                  <HTILogo className="h-[75px] w-auto filter contrast-[1.03] transition-all group-hover:scale-105 duration-300 object-contain" />
                </div>

                <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  HUBZone Technology Initiative
                </h3>

                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  HTI bridges the digital divide by transforming retired corporate and private laptops into secure Chromebooks and providing digital literacy training to NC families who lack access to technology.
                </p>

                <ul className="space-y-2.5 text-xs text-[var(--color-ink)]">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    Secure US DoD 5220.22-M data wipes on all devices
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    Complete hardware refurbishment and setup
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    Free distributions and literacy courses
                  </li>
                </ul>
              </div>

              <a
                href="https://www.hubzonetech.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--color-accent)] inline-flex items-center gap-1 hover:underline mt-8"
              >
                Visit hubzonetech.org <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Portal HQ Bento Card */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 md:p-10 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-xs px-2.5 py-1 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/10 font-sans font-bold">
                    Host &amp; Experience Partner
                  </span>
                </div>

                {/* Massive Brand Logo Wrapper */}
                <div className="flex items-center justify-center min-h-[140px] bg-black/40 border border-white/5 rounded-xl py-6 px-4 relative overflow-hidden group">
                  <img src="/portal-logo.png" alt="Portal HQ" className="h-[120px] w-auto filter contrast-[1.02] transition-all group-hover:scale-105 duration-300 object-contain" />
                </div>

                <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  Portal HQ
                </h3>

                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  Raleigh’s premier community workspace and multi-purpose venue. Fostering a high-energy creative ecosystem for entrepreneurs, artists, founders, locally connecting and executing.
                </p>

                <ul className="space-y-2.5 text-xs text-[var(--color-ink)]">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    Professional concert AV, lighting, and sound
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    Fully adaptable 5,000 sq ft creative hub
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    Focused on elevating NC business founders
                  </li>
                </ul>
              </div>

              <a
                href="https://theportalhq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--color-accent)] inline-flex items-center gap-1 hover:underline mt-8"
              >
                Visit theportalhq.com <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Shared Purpose Bento Card (Wide Span) */}
            <div
              className="md:col-span-2 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/80 backdrop-blur-md shadow-md overflow-hidden grid lg:grid-cols-12"
            >
              <div className="p-8 md:p-12 lg:col-span-7 flex flex-col justify-center space-y-6">
                <div>
                  <span className="text-xs px-3 py-1 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold tracking-wide border border-[var(--color-accent)]/10 font-sans">
                    Our Real Mission
                  </span>
                  <h3 className="font-display text-3xl font-bold tracking-tight text-[var(--color-ink)] mt-3">
                    Close the Digital Divide
                  </h3>
                </div>

                <p className="text-base text-[var(--color-ink)] leading-relaxed">
                  For thousands of school-age children in North Carolina, a laptop is not a luxury screen—it is their primary doorway to education. Without a device at home, doing homework, researching projects, or discovering creative talents is nearly impossible.
                </p>

                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  By bringing your retired laptop to our social hour, you are not simply recycling silicon. You are directly presenting a NC student with the tools to complete their schooling, expand their ambitions, and pursue their goals. Let's make sure no child gets left behind.
                </p>
              </div>

              <div className="lg:col-span-5 h-64 lg:h-full min-h-[300px] relative bg-[var(--color-bg-dark)]">
                <img
                  src="/heartfelt_laptop.png"
                  alt="NC student using a refurbished Chromebook"
                  className="absolute inset-0 w-full h-full object-cover filter contrast-[1.02] saturate-[0.96]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VENUE SPOTLIGHT & 360° WALKTHROUGH */}
      <section id="venue-spotlight" className="section bg-black/16 backdrop-blur-[1px] border-b border-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]">
        <div className="container space-y-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold text-[var(--color-accent)] tracking-tight font-sans">
                  The experience space
                </span>
                <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)] mt-2">
                  The Venue: Portal HQ
                </h2>
                <p className="text-lg text-[var(--color-muted)] mt-2">
                  A state-of-the-art 5,000 sq ft community workspace and high-production showcase venue in downtown Raleigh.
                </p>
              </div>

              <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                The Sip & Sync Social Hour will take place in the main gallery hall of Portal HQ. Attendees will experience our full in-house concert production system: 12 active moving Gobo lighting beams, high-lumen visual projection setups, and background ambient sound networks.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-white/5 bg-[var(--color-surface)]/40 backdrop-blur-sm space-y-1">
                  <strong className="block text-xl font-bold font-sans">5,000 Sq Ft</strong>
                  <span className="text-xs text-[var(--color-muted)]">Flexible Creative Hub</span>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-[var(--color-surface)]/40 backdrop-blur-sm space-y-1">
                  <strong className="block text-xl font-bold font-sans">Free Parking</strong>
                  <span className="text-xs text-[var(--color-muted)]">150+ Spaces on Site</span>
                </div>
              </div>
            </div>

            {/* Asymmetric Venue Photo Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl overflow-hidden aspect-[4/3] border bg-[var(--color-bg-dark)] shadow-sm">
                <img
                  src="https://theportalhq.com/Newphotos/5.png"
                  alt="Daylight Portal HQ space"
                  className="w-full h-full object-cover filter contrast-[1.02]"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[4/3] border bg-[var(--color-bg-dark)] shadow-sm">
                <img
                  src="https://theportalhq.com/Newphotos/Elegant%20Affair/1C7A8512.jpeg"
                  alt="Evening reception setup"
                  className="w-full h-full object-cover filter contrast-[1.02]"
                />
              </div>
              <div className="col-span-2 rounded-xl overflow-hidden aspect-[16/9] border bg-[var(--color-bg-dark)] shadow-sm relative group">
                <img
                  src="https://theportalhq.com/Newphotos/Showcase/1C7A9000.jpeg"
                  alt="Concert stage lighting production"
                  className="w-full h-full object-cover filter contrast-[1.02] transition-transform group-hover:scale-102 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 text-white text-xs">
                  <div>
                    <strong className="block font-semibold">Active Concert Configuration</strong>
                    Experience concert-grade production during the Sip & Sync Social Hour.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Virtual Walkthrough */}
          <div className="pt-8 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] space-y-6">
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]">Explore Before You Arrive</h3>
              <p className="text-xs text-[var(--color-muted)]">Take an interactive 360° tour through the main gallery, stage, and lobby.</p>
            </div>
            <div className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md p-2.5 shadow-md">
              <iframe
                src="https://theportalhq.com/walkthrough-tour-assets/index.html?tour_root=walkthrough-tour-assets&hide_cta=1&scene=6a062176ebf5884479702b73"
                title="Sip & Sync Portal HQ Virtual Tour"
                allow="fullscreen; xr-spatial-tracking"
                loading="lazy"
                className="w-full aspect-video rounded-[var(--radius-md)] border-0"
                style={{
                  height: "min(45vh, 400px)",
                  background: "#000"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TICKETS & DONATIONS */}
      <section id="tickets" className="section container">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-[var(--color-accent)] tracking-wide font-sans">
              Reserve Admission Passes
            </span>
            <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)]">
              Tickets &amp; Donations
            </h2>
            <p className="text-sm text-[var(--color-muted)] max-w-[48ch] mx-auto leading-relaxed">
              Admission passes are just $5.00 each. Every ticket purchased directly covers event operational costs, with all additional donations funding hardware secure wipes.
            </p>
          </div>

          {/* Secure Trust Badges Panel */}
          <div className="p-5 rounded-2xl border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Award className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <strong className="block text-[var(--color-ink)] font-semibold">Receipts for Eligible Donations</strong>
              <p className="text-[var(--color-muted)] leading-relaxed">HTI is a 501(c)(3) nonprofit. Ticket purchases reserve admission; additional gifts can be receipted as donations.</p>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/80 backdrop-blur-md shadow-xl">
            <PledgeForm mode="ticket" />
          </div>
        </div>
      </section>

      {/* LAPTOP PLEDGE DRIVE */}
      <section id="pledge" className="section bg-black/20 backdrop-blur-[1px] border-t border-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]">
        <div className="container space-y-12">
          <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10 items-start">

            {/* Live Progress Tracker Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold text-[var(--color-accent)] tracking-wide font-sans">
                  Drive Metrics
                </span>
                <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)]">
                  Live Laptop Pledge Tracker
                </h2>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  Help us reach our collaborative event goal of <strong className="text-[var(--color-ink)]">150 pledged laptops</strong>. Bring your old device to Portal HQ, or arrange a free pickup!
                </p>
              </div>

              {/* Live Metric Progress Counter Card */}
              <div
                onMouseMove={handleMouseMove}
                className="p-6 rounded-2xl border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-md space-y-6 spotlight-card"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="text-xs font-semibold text-[var(--color-muted)] font-sans">Live Progress</div>
                  <span className="h-2 w-2 rounded-full bg-[var(--color-signal)] animate-ping" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1 border-r">
                    <span className="text-xs text-[var(--color-muted)] font-sans tracking-wide block">Target Goal</span>
                    <strong className="text-lg font-bold text-[var(--color-accent)]">{PLEDGE_GOAL} Devices</strong>
                  </div>
                  <div className="space-y-1 border-r">
                    <span className="text-xs text-[var(--color-muted)] font-sans tracking-wide block">Pledged</span>
                    <strong className="text-lg font-bold text-[var(--color-ink)] font-sans">{pledgesCount}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-[var(--color-muted)] font-sans tracking-wide block">Still Needed</span>
                    <strong className="text-lg font-bold text-[var(--color-signal)] font-sans">{remainingCount}</strong>
                  </div>
                </div>

                {/* Progress bar tracks */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold font-sans">
                    <span className="text-[var(--color-muted)]">Campaign Progress</span>
                    <span className="text-[var(--color-accent)]">{percentage}%</span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] overflow-hidden p-0.5 border">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_rgba(245,132,32,0.4)] transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-[var(--color-muted)] leading-relaxed italic text-center">
                  {pledgesCount === 0
                    ? "Be the first to pledge a laptop and jumpstart the campaign."
                    : pledgesCount < PLEDGE_GOAL
                      ? `Only ${remainingCount} more laptops needed to hit the Raleigh milestone.`
                      : "Raleigh milestone reached. Thank you for helping close the digital divide."
                  }
                </p>
                <p className="text-[10px] text-[var(--color-muted)] leading-relaxed text-center">
                  Displayed pledges come from submitted forms saved in this browser until a live database is connected.
                </p>
              </div>

              {/* Logistics grid info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-white/5 bg-[var(--color-surface)]/40 backdrop-blur-sm space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--color-accent)] font-bold font-sans">
                    <MapPin className="h-4 w-4 shrink-0" />
                    Drop-off Location
                  </div>
                  <strong className="block text-[var(--color-ink)] font-sans">Portal HQ Lobby</strong>
                  <p className="text-[var(--color-muted)] leading-relaxed font-sans">
                    3801 Hillsborough St, Suite 113, Raleigh. Drop off during the event or standard workspace hours.
                  </p>
                </div>
                <div className="p-5 rounded-xl border border-white/5 bg-[var(--color-surface)]/40 backdrop-blur-sm space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--color-accent)] font-bold font-sans">
                    <Award className="h-4 w-4 shrink-0" />
                    Free Vehicle Pickup
                  </div>
                  <strong className="block text-[var(--color-ink)] font-sans">Donating 5+ Laptops?</strong>
                  <p className="text-[var(--color-muted)] leading-relaxed font-sans">
                    If your business or household has 5 or more laptops to pledge, we'll coordinate a free courier pickup.
                  </p>
                  <a href="mailto:pickups@hubzonetech.org" className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline block pt-1 font-sans">
                    Email pickups@hubzonetech.org ➔
                  </a>
                </div>
              </div>
            </div>

            {/* Laptop Pledge Input Form Card */}
            <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/80 backdrop-blur-md shadow-xl">
              <PledgeForm mode="laptop" />
            </div>

          </div>
        </div>
      </section>

      {/* CONNECT & SHARE */}
      <section id="connect" className="section container">
        <div className="space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-[var(--color-accent)] tracking-wide block mb-1 font-sans">
              Get in Touch
            </span>
            <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)]">
              Connect &amp; Share
            </h2>
            <p className="text-lg text-[var(--color-muted)] mt-2">
              Have questions about tax certificates, corporate bulk pledges, or event partnerships? Reach out directly to coordinating directors.
            </p>
          </div>

          {/* Encouraging Social share panel */}
          <div className="p-8 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-[50ch]">
              <h4 className="font-display font-semibold text-lg text-[var(--color-ink)]">Spread the Word!</h4>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                Even if you don't have a spare laptop, sharing this event flyer with your NC network or corporate Slack amplifies the campaign immensely.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCopyLink} variant="secondary" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Copy Event URL
              </Button>
              <Button asChild className="flex items-center gap-2">
                <a href="/sip_and_sync_flyer.png" download="Sip_And_Sync_Flyer.png">
                  Download Event Flyer
                </a>
              </Button>
            </div>
          </div>

          {/* Coordinators Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Will Sigmon */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden spotlight-card"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-display font-bold text-xl text-[var(--color-ink)]">Will Sigmon</h4>
                  <span className="text-xs font-semibold text-[var(--color-accent)] tracking-tight block mt-0.5 font-sans">
                    HTI representative
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed font-sans">
                  Oversees hardware donation logistics, secure wipe data compliance verification, and 501(c)(3) corporate tax certificates.
                </p>
              </div>

              <div className="pt-8 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] mt-8 flex items-center justify-between">
                <a
                  href="mailto:wsigmon@hubzonetech.org"
                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1.5 font-sans"
                >
                  <Mail className="h-3.5 w-3.5" /> wsigmon@hubzonetech.org
                </a>
                <img src="/hti-cropped.png" alt="HTI" className="h-[28px] w-auto opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300 object-contain" />
              </div>
            </div>

            {/* David Galindo */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden spotlight-card"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-display font-bold text-xl text-[var(--color-ink)]">David Galindo</h4>
                  <span className="text-xs font-semibold text-[var(--color-accent)] tracking-tight block mt-0.5 font-sans">
                    Coordinating director
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed font-sans">
                  Coordinates joint campaign workflows, secure check-in operations, sponsor relationships, and community outreach.
                </p>
              </div>

              <div className="pt-8 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] mt-8 flex items-center justify-between">
                <a
                  href="mailto:dgalindo@kurvpay.com"
                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1.5 font-sans"
                >
                  <Mail className="h-3.5 w-3.5" /> dgalindo@kurvpay.com
                </a>
                <div className="flex gap-3.5 opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300 items-center">
                  <img src="/hti-cropped.png" alt="HTI" className="h-[22px] w-auto object-contain" />
                  <img src="/portal-logo.png" alt="Portal" className="h-[38px] w-auto object-contain" />
                </div>
              </div>
            </div>

            {/* Jake Berlin */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 rounded-[var(--radius-lg)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden spotlight-card"
            >
              <div className="space-y-4">
                <div>
                  <h4 className="font-display font-bold text-xl text-[var(--color-ink)]">Jake Berlin</h4>
                  <span className="text-xs font-semibold text-[var(--color-accent)] tracking-tight block mt-0.5 font-sans">
                    Portal HQ co-founder
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed font-sans">
                  Handles venue logistics, stage AV lighting design coordination, craft beverage sponsorships, and founder partnerships.
                </p>
              </div>

              <div className="pt-8 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] mt-8 flex items-center justify-between">
                <a
                  href="mailto:jake@theportalhq.com"
                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1.5 font-sans"
                >
                  <Mail className="h-3.5 w-3.5" /> jake@theportalhq.com
                </a>
                <img src="/portal-logo.png" alt="Portal" className="h-14 w-auto opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] py-12 text-sm text-[var(--color-muted)] bg-[var(--color-surface)]/20">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-y-4">
          <div>Sip &amp; Sync Social Hour — HTI × Portal HQ • June 11, 2026</div>
          <div className="flex gap-7 font-semibold">
            <a href="https://hubzonetech.org" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">hubzonetech.org</a>
            <a href="https://theportalhq.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">theportalhq.com</a>
          </div>
        </div>
      </footer>

      {/* ACTIVE TICKET RETRIEVAL FLOATING PILL */}
      {hasTicket && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce">
          <button
            onClick={handleOpenTicket}
            className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 bg-[var(--color-accent)] text-white shadow-lg hover:bg-[color-mix(in_oklch,var(--color-accent)_92%,black)] transition-all font-display text-sm font-semibold tracking-tight shadow-orange-500/20"
          >
            <Ticket className="h-4 w-4" />
            Active Ticket for {savedTicketName}
          </button>
        </div>
      )}

      {/* SCAN VERIFIED MODAL OVERLAY */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div
            className="relative w-full max-w-md p-6 md:p-8 rounded-[var(--radius-lg)] border border-[var(--color-signal)]/30 bg-[var(--color-surface)] shadow-2xl space-y-6 text-center transform scale-100 opacity-100 transition-all"
          >
            {/* Close modal X button */}
            <button
              onClick={handleCloseScanModal}
              className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-ink)] text-xl font-bold"
            >
              &times;
            </button>

            {/* Status Check badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--color-signal)]/20 bg-[var(--color-signal)]/10 text-xs font-bold text-[var(--color-signal)] font-sans tracking-wide mx-auto animate-pulse">
              <CheckCircle className="h-3.5 w-3.5" />
              Scan Authorized
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                Entrance Access Granted
              </h3>
              <p className="text-xs text-[var(--color-muted)] max-w-[32ch] mx-auto font-sans">
                Welcome to the Sip &amp; Sync Social Hour! Show this scan validation sheet to the check-in supervisor.
              </p>
            </div>

            {/* Checked-in pass invoice receipt breakdown details */}
            <div className="rounded-xl border bg-[var(--color-surface)]/50 p-5 space-y-3.5 text-xs text-left font-sans">
              <div className="flex justify-between items-center border-b pb-2.5">
                <span className="text-[var(--color-muted)]">Gate Code</span>
                <strong className="font-sans tabular-nums text-sm text-[var(--color-ink)]">#{scanData.code}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-muted)]">Primary Guest</span>
                <strong className="font-semibold text-[var(--color-ink)]">{scanData.guest}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-muted)]">Pass Quantity</span>
                <strong className="font-semibold text-[var(--color-ink)]">{scanData.qty} Passes</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-muted)]">Sponsor Level</span>
                <strong className="font-bold text-[var(--color-accent)]">
                  {parseFloat(scanData.donation) > 0 ? `$${parseFloat(scanData.donation).toFixed(2)} Donation` : "General Admission"}
                </strong>
              </div>
            </div>

            <Button onClick={handleCloseScanModal} size="lg" className="w-full justify-center">
              Proceed to Entrance
            </Button>
          </div>
        </div>
      )}

      {/* Lightweight Toast Notifier */}
      <Toast ref={toastRef} />
    </div>
  );
}
