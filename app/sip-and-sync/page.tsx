"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, MapPin, Award, ArrowUpRight, CheckCircle, Share2, Ticket } from "lucide-react";
import { Button } from "@/components/Button";
import { HTILogo } from "@/components/HTILogo";
import { PledgeForm } from "@/components/PledgeForm";
import { Starfield } from "@/components/Starfield";
import { Toast, type ToastRef } from "@/components/Toast";
import { PLEDGE_GOAL } from "@/lib/sip-and-sync-config";

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

    // Clear check-in query parameters without reload
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: cleanUrl }, "", cleanUrl);
  };

  // Scroll-lock tied to modal state so abnormal unmount restores the body.
  useEffect(() => {
    if (!scanModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [scanModalOpen]);

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

  const [activeScene, setActiveScene] = useState("6a062176ebf5884479702b73");
  const virtualTourSrc = `https://theportalhq.com/walkthrough-tour-assets/index.html?tour_root=walkthrough-tour-assets&hide_cta=1&scene=${activeScene}`;

  const tourWaypoints = [
    { name: "Entry & Reception", id: "6a062176ebf5884479702b73", label: "Check-in Desk & Drinks" },
    { name: "Showcase Stage", id: "6a062176ebf5884479702b73&stage=1", label: "Live Presentations & AV" },
    { name: "Studio Gallery Hall", id: "6a062176ebf5884479702b73&studio=1", label: "Laptop Drop-off Area" },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-transparent text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white">
      {/* 3D Space Starfield Background */}
      <Starfield opacity={0.86} />

      {/* STICKY GLASSMORPHIC NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3.5">
            <HTILogo className="h-[34px] md:h-[44px] w-auto filter contrast-[1.03] transition-all object-contain" />
            <span className="text-base text-[var(--color-muted)] font-display font-bold select-none opacity-45 mx-0.5">×</span>
            <img src="/portal-logo.png" alt="Portal HQ" className="h-[42px] md:h-[50px] w-auto filter contrast-[1.02] transition-all object-contain" />
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
      <section className="container relative pt-8 pb-16 md:pt-12 md:pb-20">
        <div className="grid w-full min-w-0 items-center gap-x-14 gap-y-14 lg:grid-cols-12">
          <div className="min-w-0 space-y-5 lg:col-span-7">
            <h1
              className="display-xl max-w-full leading-[0.88] tracking-[-0.045em] text-[var(--color-ink)] animate-fade-in-up"
              style={{ fontSize: "clamp(3.45rem, 10vw, 8.75rem)" }}
            >
              <span className="block whitespace-nowrap">
                <span className="text-[var(--color-gold)]">Sip</span>{" "}
                <span className="text-white">&amp;</span>{" "}
                <span className="text-[var(--color-accent)]">Sync</span>
              </span>
              <span className="block text-[var(--color-ink)] whitespace-nowrap">Social Hour</span>
            </h1>

            <p className="text-xl md:text-2xl font-display font-semibold italic text-[var(--color-muted)] tracking-tight max-w-[28ch] border-l-2 border-[var(--color-accent)]/40 pl-4 animate-fade-in-up delay-100">
              "Old Laptops. New Opportunities."
            </p>

            <p className="text-base md:text-lg text-[var(--color-muted)] max-w-[31ch] sm:max-w-[48ch] leading-relaxed animate-fade-in-up delay-200">
              Come join us in Raleigh for a fun social hour. Meet local business owners, enjoy free drinks, and bring an old laptop to help NC families get online.
            </p>

            <div className="flex flex-wrap gap-4 pt-1 animate-fade-in-up delay-300">
              <Button size="lg" asChild>
                <a href="#tickets">Reserve Spot</a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a href="#pledge">Donate Laptop</a>
              </Button>
            </div>
          </div>

          {/* Strong visual hero move - premium Slack meetup mockup framed card */}
          <div className="min-w-0 lg:col-span-5 animate-fade-in-up delay-400">
            <div onMouseMove={handleMouseMove} className="spotlight-card relative mx-auto w-full max-w-[calc(100vw-3rem)] rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/60 p-1.5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.01] lg:max-w-full">
              <div className="absolute -top-3.5 -left-3.5 h-7 w-7 border-t border-l border-[var(--color-accent)] pointer-events-none" />
              <div className="absolute -top-3.5 -right-3.5 h-7 w-7 border-t border-r border-[var(--color-accent)] pointer-events-none" />
              <div className="absolute -bottom-3.5 -left-3.5 h-7 w-7 border-b border-l border-[var(--color-accent)] pointer-events-none" />
              <div className="absolute -bottom-3.5 -right-3.5 h-7 w-7 border-b border-r border-[var(--color-accent)] pointer-events-none" />

              <div className="aspect-[4/3] w-full max-w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-dark)] shadow-inner">
                <img
                  src="/portal_hq_real.png"
                  alt="Real view of Portal HQ Raleigh Event space"
                  className="h-full w-full max-w-full object-cover filter contrast-[1.04] saturate-[0.98] transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* EVENT QUICK INFO GRID */}
        <div className="mt-12 grid gap-5 sm:grid-cols-3 md:mt-16">
          {/* Calendar Card */}
          <a
            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Sip+%26+Sync%3A+Laptop+Pledge+Drive+%26+Social+Hour&dates=20260611T220000Z/20260612T010000Z&details=Join+us+for+Sip+%26+Sync%21+A+joint+collaboration+between+Hub+Zone+Tech+and+Portal+HQ+to+close+the+digital+divide+in+North+Carolina.+Bring+your+old+laptops+to+be+securely+wiped+and+donated+to+local+students+in+need.+Enjoy+free+drinks%2C+networking%2C+food%2C+and+more.&location=Portal+HQ%2C+3801+Hillsborough+St+Suite+113%2C+Raleigh%2C+NC+27607"
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            className="spotlight-card group relative flex min-h-[160px] md:min-h-[165px] w-full min-w-0 flex-col justify-between rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 p-4.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:border-[var(--color-accent)]/30"
          >
            <div className="flex min-w-0 items-start gap-3">
              {/* Bespoke SVG stitch-style calendar icon */}
              <svg className="h-11 w-11 shrink-0 transition-transform group-hover:scale-105 duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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

              <div className="min-w-0 space-y-0.5">
                <div className="text-xs text-[var(--color-accent)] font-bold font-sans tracking-wide">When</div>
                <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-ink)]">Thursday, June 11</h3>
                <p className="text-sm text-[var(--color-muted)]">6:00 PM – 9:00 PM</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-0.5 self-start whitespace-nowrap text-[10px] font-semibold text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent)] sm:self-end">
              Add to Calendar <ArrowUpRight className="h-3 w-3" />
            </span>
          </a>

          {/* Location Card */}
          <a
            href="https://maps.google.com/?q=3801+Hillsborough+St,+Suite+113,+Raleigh,+NC+27607"
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            className="spotlight-card group relative flex min-h-[160px] md:min-h-[165px] w-full min-w-0 flex-col justify-between rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 p-4.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:border-[var(--color-accent)]/30"
          >
            <div className="flex min-w-0 items-start gap-3">
              {/* Bespoke SVG stitch-style map pin icon */}
              <svg className="h-11 w-11 shrink-0 transition-transform group-hover:scale-105 duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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

              <div className="min-w-0 space-y-0.5">
                <div className="text-xs text-[var(--color-accent)] font-bold font-sans tracking-wide">Where</div>
                <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-ink)] whitespace-nowrap">Portal HQ, Raleigh</h3>
                <p className="text-xs text-[var(--color-muted)] leading-tight">3801 Hillsborough St, Suite 113</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-0.5 self-start whitespace-nowrap text-[10px] font-semibold text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent)] sm:self-end">
              Open Maps <ArrowUpRight className="h-3 w-3" />
            </span>
          </a>

          {/* Tickets Info Card */}
          <a
            href="#tickets"
            onMouseMove={handleMouseMove}
            className="spotlight-card group relative flex min-h-[160px] md:min-h-[165px] w-full min-w-0 flex-col justify-between rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 p-4.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:border-[var(--color-accent)]/30"
          >
            <div className="flex min-w-0 items-start gap-3">
              {/* Bespoke SVG stitch-style ticket icon */}
              <svg className="h-11 w-11 shrink-0 transition-transform group-hover:scale-105 duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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

              <div className="min-w-0 space-y-0.5">
                <div className="text-xs text-[var(--color-accent)] font-bold font-sans tracking-wide">Admission</div>
                <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-ink)]">$5.00 Tickets</h3>
                <p className="text-sm text-[var(--color-muted)]">Includes craft drinks + live networking</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-0.5 self-start whitespace-nowrap text-[10px] font-semibold text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent)] sm:self-end">
              Secure Passes <ArrowUpRight className="h-3 w-3" />
            </span>
          </a>
        </div>
      </section>

      {/* THE COLLABORATION (BENTO GRID) */}
      <section id="about" className="section bg-black/20 backdrop-blur-[1px] border-y border-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]">
        <div className="container space-y-8">
          <div className="max-w-2xl">
            <div className="text-xs font-bold text-[var(--color-accent)] tracking-wide mb-1.5 font-sans">
              Why we're gathering
            </div>
            <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)]">
              The Collaboration
            </h2>
            <p className="text-lg text-[var(--color-muted)] mt-2">
              Fusing hardware digital accessibility with Raleigh's high-energy startup and creative ecosystem for one powerful night of impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* HTI Bento Card */}
            <div
              onMouseMove={handleMouseMove}
              className="p-5.5 md:p-7 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="space-y-4.5">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-xs font-semibold tracking-tight text-[var(--color-accent)] font-sans">
                    501(c)(3) Nonprofit Partner
                  </span>
                </div>

                {/* Massive Brand Logo Wrapper */}
                <div className="flex items-center justify-center min-h-[110px] bg-black/40 border border-white/5 rounded-xl py-4 px-4 relative overflow-hidden group">
                  <HTILogo className="h-[75px] w-auto filter contrast-[1.03] transition-all group-hover:scale-105 duration-300 object-contain" />
                </div>

                <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  HUBZone Technology Initiative
                </h3>

                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  HTI bridges the digital divide by transforming retired corporate and private laptops into secure Chromebooks and providing digital literacy training to NC families who lack access to technology.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-black/35 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-accent)]/20 hover:scale-[1.01] shadow-inner">
                    <div className="h-8.5 w-8.5 shrink-0 flex items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-[11px] text-[var(--color-ink)] font-bold font-sans tracking-wide leading-tight">DoD 5220.22-M</strong>
                      <span className="text-[10px] text-[var(--color-muted)] block mt-0.5 leading-none">Secure Wipe</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-black/35 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-accent)]/20 hover:scale-[1.01] shadow-inner">
                    <div className="h-8.5 w-8.5 shrink-0 flex items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-[11px] text-[var(--color-ink)] font-bold font-sans tracking-wide leading-tight">Refurbished</strong>
                      <span className="text-[10px] text-[var(--color-muted)] block mt-0.5 leading-none">OS &amp; Hardware</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-black/35 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-accent)]/20 hover:scale-[1.01] shadow-inner">
                    <div className="h-8.5 w-8.5 shrink-0 flex items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5A2.5 2.5 0 0 1 4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5" /></svg>
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-[11px] text-[var(--color-ink)] font-bold font-sans tracking-wide leading-tight">Distribution</strong>
                      <span className="text-[10px] text-[var(--color-muted)] block mt-0.5 leading-none">Courses</span>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="https://www.hubzonetech.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--color-accent)] inline-flex items-center gap-1 hover:underline mt-5"
              >
                Visit hubzonetech.org <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Portal HQ Bento Card */}
            <div
              onMouseMove={handleMouseMove}
              className="p-5.5 md:p-7 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="space-y-4.5">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-xs font-semibold tracking-tight text-[var(--color-accent)] font-sans">
                    Host &amp; Experience Partner
                  </span>
                </div>

                {/* Massive Brand Logo Wrapper */}
                <div className="flex items-center justify-center min-h-[110px] bg-black/40 border border-white/5 rounded-xl py-4 px-4 relative overflow-hidden group">
                  <img src="/portal-logo.png" alt="Portal HQ" className="h-[100px] w-auto filter contrast-[1.02] transition-all group-hover:scale-105 duration-300 object-contain" />
                </div>

                <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)] whitespace-nowrap">
                  Portal HQ
                </h3>

                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  Raleigh’s premier community workspace and multi-purpose venue. Fostering a high-energy creative ecosystem for entrepreneurs, artists, founders, locally connecting and executing.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-black/35 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-accent)]/20 hover:scale-[1.01] shadow-inner">
                    <div className="h-8.5 w-8.5 shrink-0 flex items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-[11px] text-[var(--color-ink)] font-bold font-sans tracking-wide leading-tight">Concert AV</strong>
                      <span className="text-[10px] text-[var(--color-muted)] block mt-0.5 leading-none">12 Gobo Lights</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-black/35 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-accent)]/20 hover:scale-[1.01] shadow-inner">
                    <div className="h-8.5 w-8.5 shrink-0 flex items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-[11px] text-[var(--color-ink)] font-bold font-sans tracking-wide leading-tight">5,000 Sq Ft</strong>
                      <span className="text-[10px] text-[var(--color-muted)] block mt-0.5 leading-none">Adaptable Space</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-white/5 bg-black/35 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-accent)]/20 hover:scale-[1.01] shadow-inner">
                    <div className="h-8.5 w-8.5 shrink-0 flex items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-[11px] text-[var(--color-ink)] font-bold font-sans tracking-wide leading-tight">Founder Hub</strong>
                      <span className="text-[10px] text-[var(--color-muted)] block mt-0.5 leading-none">Startups</span>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="https://theportalhq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--color-accent)] inline-flex items-center gap-1 hover:underline mt-5"
              >
                Visit theportalhq.com <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Shared Purpose Bento Card (Wide Span) */}
            <div
              className="md:col-span-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/80 backdrop-blur-md shadow-md overflow-hidden grid lg:grid-cols-12"
            >
              <div className="p-8 sm:p-10 md:p-12 lg:p-16 lg:col-span-7 flex flex-col justify-center space-y-4">
                <div>
                  <span className="text-xs font-semibold tracking-tight text-[var(--color-accent)] font-sans">
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

              <div className="lg:col-span-5 h-64 lg:h-full min-h-[240px] relative bg-[var(--color-bg-dark)]">
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
        <div className="container space-y-8">
          <div className="grid lg:grid-cols-12 gap-y-8 lg:gap-x-16 items-center">
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-4 lg:py-2">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--color-accent)] tracking-tight font-sans uppercase">
                  The experience space
                </span>
                <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)] mt-2 whitespace-nowrap">
                  The Venue: Portal HQ
                </h2>
                <p className="text-lg text-[var(--color-muted)] max-w-[46ch] mx-auto">
                  A state-of-the-art 5,000 sq ft community workspace and high-production showcase venue in downtown Raleigh.
                </p>
              </div>

              <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-[54ch] mx-auto">
                The Sip &amp; Sync Social Hour will take place in the main gallery hall of <span className="whitespace-nowrap">Portal HQ</span>. Attendees will experience our full in-house concert production system: 12 active moving Gobo lighting beams, high-lumen visual projection setups, and background ambient sound networks.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 w-full max-w-lg mx-auto">
                <div className="flex min-h-[115px] flex-col items-center justify-center rounded-xl border border-white/5 bg-[var(--color-surface)]/45 p-4 text-center backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <strong className="font-display text-4xl font-extrabold leading-none tracking-[-0.04em] text-[var(--color-ink)]">5,000</strong>
                  <span className="mt-0.5 text-sm font-bold text-[var(--color-accent)]">Sq Ft</span>
                  <span className="mt-1 max-w-[16ch] text-xs leading-snug text-[var(--color-muted)]">Flexible creative hub</span>
                </div>
                <div className="flex min-h-[115px] flex-col items-center justify-center rounded-xl border border-white/5 bg-[var(--color-surface)]/45 p-4 text-center backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <strong className="font-display text-4xl font-extrabold leading-none tracking-[-0.04em] text-[var(--color-ink)]">P</strong>
                  <span className="mt-0.5 text-sm font-bold text-[var(--color-accent)]">Free Parking</span>
                  <span className="mt-1 max-w-[16ch] text-xs leading-snug text-[var(--color-muted)]">150+ spaces on site</span>
                </div>
              </div>
            </div>

            {/* Asymmetric Venue Photo Grid */}
            <div className="lg:col-span-6 lg:col-start-7 grid grid-cols-2 gap-2">
              <div className="rounded-xl overflow-hidden aspect-[4/3] border bg-[var(--color-bg-dark)] shadow-sm">
                <img
                  src="/venue/venue-daylight-floor.jpg"
                  alt="Daylight Portal HQ space"
                  className="w-full h-full object-cover filter contrast-[1.02]"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[4/3] border bg-[var(--color-bg-dark)] shadow-sm">
                <img
                  src="/venue/venue-evening-table.jpg"
                  alt="Evening reception setup"
                  className="w-full h-full object-cover filter contrast-[1.02]"
                />
              </div>
              <div className="col-span-2 rounded-xl overflow-hidden aspect-[16/9] border bg-[var(--color-bg-dark)] shadow-sm relative group">
                <img
                  src="/venue/venue-stage-lighting.jpg"
                  alt="Concert stage lighting production"
                  className="w-full h-full object-cover filter contrast-[1.02] transition-transform group-hover:scale-102 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 text-white text-xs">
                  <div>
                     <strong className="block font-semibold"><span className="whitespace-nowrap">Portal HQ</span> Concert Stage</strong>
                    Experience concert-grade production during the Sip & Sync Social Hour.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4.5 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] pt-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h3 className="font-display text-3xl font-bold tracking-tight text-[var(--color-ink)]">Explore Before You Arrive</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">Walk the main gallery, stage, and lobby from this page. Use touch or drag to look around.</p>
              </div>
              <a
                href={virtualTourSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--color-ink)_14%,transparent)] px-6 text-sm font-semibold text-[var(--color-ink)] transition-all hover:bg-white/5 hover:border-[var(--color-accent)]/45 hover:text-[var(--color-accent)] hover:translate-y-[-1px]"
              >
                Open full tour
              </a>
            </div>
            <div className="relative overflow-hidden rounded-[calc(var(--radius-md)+4px)] border border-[color-mix(in_oklch,var(--color-ink)_12%,transparent)] bg-[var(--color-panel)]/78 p-2.5 shadow-xl shadow-black/30 backdrop-blur-md md:p-3.5 shadow-[0_0_50px_rgba(10,28,75,0.18)]">
              {/* Window Controls Bar */}
              <div className="flex flex-col gap-3 px-2 pb-4 text-sm md:flex-row md:items-center md:justify-between border-b border-white/5 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80 block" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80 block" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80 block" />
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div>
                    <strong className="block font-display text-sm tracking-tight text-[var(--color-ink)]"><span className="whitespace-nowrap">Portal HQ</span> virtual walkthrough</strong>
                    <span className="text-[10px] text-[var(--color-muted)] flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse block" />
                      Interactive 3D Stream Active
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-[var(--color-muted)]">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-semibold">DRAG TO ROTATE</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-semibold">PINCH TO ZOOM</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-semibold">WebGL ACTIVE</span>
                </div>
              </div>
              
              {/* 3D Walkthrough Viewport */}
              <div className="relative overflow-hidden rounded-xl bg-black border border-white/5">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/35 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                <iframe
                  src={virtualTourSrc}
                  title="Sip & Sync Portal HQ Virtual Tour"
                  allow="fullscreen; xr-spatial-tracking"
                  sandbox="allow-scripts allow-same-origin"
                  allowFullScreen
                  loading="lazy"
                  className="block w-full border-0"
                  style={{
                    height: "clamp(320px, 58vh, 620px)",
                    background: "#000"
                  }}
                />
              </div>

              {/* Waypoints Controller Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                {tourWaypoints.map((wp) => (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => {
                      setActiveScene(wp.id);
                      toastRef.current?.show(`Navigating walkthrough to ${wp.name}...`);
                    }}
                    className={`p-2.5 rounded-lg border text-center transition-all duration-300 font-sans cursor-pointer flex flex-col items-center justify-center ${
                      activeScene === wp.id
                        ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-[var(--color-accent)] font-semibold shadow-inner scale-[1.01]"
                        : "bg-black/25 border-white/5 text-[var(--color-muted)] hover:border-white/10 hover:text-white hover:bg-black/40 hover:scale-[1.01]"
                    }`}
                  >
                    <strong className="block text-xs font-semibold tracking-tight">{wp.name}</strong>
                    <span className="text-[10px] opacity-75 mt-1 block font-sans leading-none">{wp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKETS & DONATIONS */}
      <section id="tickets" className="section container">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
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
          <div className="p-3.5 rounded-xl border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/50 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 text-xs">
            <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <strong className="block text-[var(--color-ink)] font-semibold">Receipts for Eligible Donations</strong>
              <p className="text-[var(--color-muted)] leading-relaxed">HTI is a 501(c)(3) nonprofit. Ticket purchases reserve admission; additional gifts can be receipted as donations.</p>
            </div>
          </div>

          <div className="p-6 sm:p-7 md:p-8 rounded-2xl border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/80 backdrop-blur-md shadow-xl shadow-[0_0_50px_rgba(0,0,0,0.25)]">
            <PledgeForm mode="ticket" />
          </div>
        </div>
      </section>

      {/* LAPTOP PLEDGE DRIVE */}
      <section id="pledge" className="section bg-black/20 backdrop-blur-[1px] border-t border-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]">
        <div className="container space-y-8">
          <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8 items-center">

            {/* Live Progress Tracker Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--color-accent)] tracking-wide font-sans">
                  Drive Metrics
                </span>
                <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)]">
                  Live Laptop Pledge Tracker
                </h2>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  Help us reach our collaborative event goal of <strong className="text-[var(--color-ink)]">150 pledged laptops</strong>. Bring your old device to <span className="whitespace-nowrap">Portal HQ</span>, or arrange a free pickup!
                </p>
              </div>

              {/* Live Metric Progress Counter Card */}
              <div
                onMouseMove={handleMouseMove}
                className="p-5 rounded-xl border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-md space-y-5 spotlight-card"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="text-xs font-semibold text-[var(--color-muted)] font-sans">Live Progress</div>
                  <span className="text-[10px] font-semibold tracking-tight text-[var(--color-signal)]">Local tracker</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1 border-r">
                    <span className="text-xs text-[var(--color-muted)] font-sans tracking-wide block">Target Goal</span>
                    <strong className="text-base font-bold text-[var(--color-accent)]">{PLEDGE_GOAL} Devices</strong>
                  </div>
                  <div className="space-y-1 border-r">
                    <span className="text-xs text-[var(--color-muted)] font-sans tracking-wide block">Pledged</span>
                    <strong className="text-base font-bold text-[var(--color-ink)] font-sans">{pledgesCount}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-[var(--color-muted)] font-sans tracking-wide block">Still Needed</span>
                    <strong className="text-base font-bold text-[var(--color-signal)] font-sans">{remainingCount}</strong>
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
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border border-white/5 bg-[var(--color-surface)]/40 backdrop-blur-sm space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--color-accent)] font-bold font-sans">
                    <MapPin className="h-4 w-4 shrink-0" />
                    Drop-off Location
                  </div>
                  <strong className="block text-[var(--color-ink)] font-sans"><span className="whitespace-nowrap">Portal HQ</span> Lobby</strong>
                  <p className="text-[var(--color-muted)] leading-relaxed font-sans">
                    3801 Hillsborough St, Suite 113, Raleigh. Drop off during the event or standard workspace hours.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-white/5 bg-[var(--color-surface)]/40 backdrop-blur-sm space-y-2 text-xs">
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

            <div className="lg:col-span-7 p-6 sm:p-7 md:p-8 rounded-2xl border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/80 backdrop-blur-md shadow-xl shadow-[0_0_50px_rgba(0,0,0,0.25)]">
              <PledgeForm mode="laptop" />
            </div>

          </div>
        </div>
      </section>

      {/* CONNECT & SHARE */}
      <section id="connect" className="section container">
        <div className="space-y-8">
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
          <div className="p-5.5 sm:p-7 md:p-8 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-surface)]/80 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_0_50px_rgba(0,0,0,0.15)]">
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
          <div className="grid md:grid-cols-3 gap-4.5">
            {/* Will Sigmon */}
            <div
              onMouseMove={handleMouseMove}
              className="p-5.5 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden spotlight-card"
            >
              <div className="space-y-3">
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

              <div className="pt-5.5 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] mt-5.5 flex items-center justify-between">
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
              className="p-5.5 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden spotlight-card"
            >
              <div className="space-y-3">
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

              <div className="pt-5.5 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] mt-5.5 flex items-center justify-between">
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
              className="p-5.5 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden spotlight-card"
            >
              <div className="space-y-3">
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

              <div className="pt-5.5 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] mt-5.5 flex items-center justify-between">
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
          <div>Sip &amp; Sync Social Hour — HTI × <span className="whitespace-nowrap">Portal HQ</span> • June 11, 2026</div>
          <div className="flex gap-7 font-semibold">
            <a href="https://hubzonetech.org" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">hubzonetech.org</a>
            <a href="https://theportalhq.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors">theportalhq.com</a>
          </div>
        </div>
      </footer>

      {/* ACTIVE TICKET RETRIEVAL FLOATING PILL */}
      {hasTicket && (
        <div className="fixed bottom-4 right-4 z-40 animate-bounce">
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
            className="relative w-full max-w-md p-5 md:p-6.5 rounded-[var(--radius-md)] border border-[var(--color-signal)]/30 bg-[var(--color-surface)] shadow-2xl space-y-4.5 text-center transform scale-100 opacity-100 transition-all"
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
            <div className="rounded-xl border bg-[var(--color-surface)]/50 p-4 space-y-2.5 text-xs text-left font-sans">
              <div className="flex justify-between items-center border-b pb-2">
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
