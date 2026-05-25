"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, MapPin, Award, ArrowUpRight, CheckCircle, Share2, Ticket } from "lucide-react";
import { Button } from "@/components/Button";
import { HTILogo } from "@/components/HTILogo";
import { PledgeForm } from "@/components/PledgeForm";
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

  // ---- HERO CAROUSEL ----
  const heroPhotos = [
    { src: "/venue/venue-wood-entry.jpg", alt: "Portal HQ lobby — bar, gallery wall, and the neon Portal sign" },
    { src: "/venue/venue-stage-lighting.jpg", alt: "Portal HQ concert stage under full production lighting" },
    { src: "/venue/venue-mural-stage.jpg", alt: "Portal HQ stage with painted mural backdrop" },
    { src: "/venue/venue-projection-wall.jpg", alt: "Portal HQ projection wall during a showcase event" },
    { src: "/venue/venue-lobby-wide.jpg", alt: "Portal HQ wide lobby view with brick and warm lighting" },
  ];
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

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

  // Hero carousel rotation — pauses on hover, respects reduced-motion.
  useEffect(() => {
    if (heroPaused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroPhotos.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [heroPaused, heroPhotos.length]);

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
      <style>{`
        @keyframes seal-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* STICKY GLASSMORPHIC NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img src="/portal-logo.png" alt="Portal HQ" className="h-16 md:h-20 w-auto filter contrast-[1.02] transition-all object-contain" />
            <span aria-hidden="true" className="font-display italic font-light text-3xl md:text-4xl text-[var(--color-accent)] mx-3 leading-none select-none">×</span>
            <HTILogo className="h-12 md:h-14 w-auto filter contrast-[1.03] transition-all object-contain" />
          </div>

          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full border border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] bg-[var(--color-surface)]/55 backdrop-blur-md shadow-inner">
            <a href="#about" className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]">The Collaboration</a>
            <a href="#tickets" className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]">Tickets &amp; Donations</a>
            <a href="#pledge" className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]">Laptop Pledge Drive</a>
            <a href="#connect" className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)] text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]">Connect</a>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {hasTicket && (
              <button
                onClick={handleOpenTicket}
                aria-label={`Open active pass for ${savedTicketName || "guest"}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10 text-xs font-semibold text-[var(--color-accent)] transition-all font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
              >
                <Ticket className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
                Active Pass
              </button>
            )}
            <Button size="default" variant="primary" asChild>
              <a href="#tickets">Get Tickets</a>
            </Button>
          </div>
        </div>
      </nav>

      <main id="main">
      {/* HERO SECTION */}
      <section className="container relative pt-8 pb-16 md:pt-12 md:pb-20">
        <div className="grid w-full min-w-0 items-center gap-x-14 gap-y-14 lg:grid-cols-12">
          <div className="min-w-0 space-y-5 lg:col-span-7">
            <h1
              className="display-xl max-w-full tracking-[-0.045em] text-[var(--color-ink)]"
              style={{ fontSize: "clamp(3.45rem, 10vw, 8.75rem)", lineHeight: 1.5 }}
            >
              <span className="sip-sync-logo relative flex flex-nowrap items-baseline whitespace-nowrap">
                <span className="sip-sync-sip relative z-10 text-[var(--color-gold)]">Sip</span>
                <span className="sip-sync-amp relative z-20 mx-[-0.04em] inline-block text-[var(--color-ink)]">&amp;</span>
                <span className="sip-sync-sync relative z-40 -ml-[0.04em] inline-block text-[var(--color-accent)] drop-shadow-[0_4px_36px_color-mix(in_oklch,var(--color-accent)_55%,transparent)]">Sync</span>
              </span>
              <span className="sip-sync-social relative z-0 block whitespace-nowrap text-[var(--color-ink)]" style={{ marginTop: "-1.05em" }}>Social Hour</span>
            </h1>

            <p className="text-xl md:text-2xl font-display font-semibold italic text-[var(--color-muted)] tracking-tight max-w-[28ch] border-l-2 border-[var(--color-accent)]/40 pl-4 animate-fade-in-up delay-100">
              “Old Laptops. New Opportunities.”
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
            <div onMouseMove={handleMouseMove} className="spotlight-card relative mx-auto w-full max-w-[calc(100vw-3rem)] rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-band)] p-1.5 shadow-lg transition-all duration-300 hover:scale-[1.01] lg:max-w-full">
              <div className="absolute -top-3.5 -left-3.5 h-7 w-7 border-t border-l border-[var(--color-accent)] pointer-events-none" />
              <div className="absolute -top-3.5 -right-3.5 h-7 w-7 border-t border-r border-[var(--color-accent)] pointer-events-none" />
              <div className="absolute -bottom-3.5 -left-3.5 h-7 w-7 border-b border-l border-[var(--color-accent)] pointer-events-none" />
              <div className="absolute -bottom-3.5 -right-3.5 h-7 w-7 border-b border-r border-[var(--color-accent)] pointer-events-none" />

              <div
                className="relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-dark)] shadow-inner"
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
                role="region"
                aria-label="Portal HQ photo carousel"
              >
                {heroPhotos.map((photo, idx) => (
                  <img
                    key={`${photo.src}-${idx === heroIdx ? "active" : "idle"}-${heroIdx}`}
                    src={photo.src}
                    alt={photo.alt}
                    aria-hidden={idx !== heroIdx}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className={`absolute inset-0 h-full w-full object-cover filter contrast-[1.04] saturate-[0.98] transition-opacity duration-[500ms] ease-in-out ${idx === heroIdx ? "opacity-100 kenburns-carousel-active" : "opacity-0"}`}
                  />
                ))}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

                <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-between px-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/80 tabular-nums">
                    {String(heroIdx + 1).padStart(2, "0")} <span className="text-white/40">/ {String(heroPhotos.length).padStart(2, "0")}</span>
                  </span>
                  <div className="flex items-center gap-0.5">
                    {heroPhotos.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`Show photo ${idx + 1} of ${heroPhotos.length}`}
                        aria-current={idx === heroIdx}
                        onClick={() => setHeroIdx(idx)}
                        className="inline-flex h-6 min-w-6 items-center justify-center px-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        <span
                          aria-hidden="true"
                          className={`block h-1.5 rounded-full transition-all duration-300 ${idx === heroIdx ? "w-6 bg-[var(--color-accent)] shadow-[0_0_10px_color-mix(in_oklch,var(--color-accent)_55%,transparent)]" : "w-1.5 bg-white/45 hover:bg-white/75"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Big fun jump-to-3D button under the carousel */}
            <a
              href="#explore-3d"
              className="see3d-button group relative mx-auto mt-7 flex w-fit items-center justify-center gap-3.5 rounded-full bg-[var(--color-accent)] px-9 py-4 font-sans text-base md:text-lg font-extrabold uppercase tracking-[0.08em] text-[var(--color-on-accent)] shadow-[0_18px_45px_color-mix(in_oklch,var(--color-accent)_45%,transparent)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_24px_55px_color-mix(in_oklch,var(--color-accent)_65%,transparent)] active:scale-[0.99] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden="true" />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="relative transition-transform duration-500 ease-out group-hover:rotate-[24deg] group-hover:scale-110">
                <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" />
                <path d="M12 12 L12 22" />
                <path d="M3 7 L12 12" />
                <path d="M21 7 L12 12" />
              </svg>
              <span className="relative">See in 3D!</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="relative transition-transform duration-300 group-hover:translate-y-1">
                <path d="M12 5v14" />
                <path d="M19 12l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>

        {/* EVENT QUICK INFO GRID — asymmetric density per WSADA §15 */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-12 md:mt-20">
          {/* Calendar Card — compact left */}
          <a
            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Sip+%26+Sync%3A+Laptop+Pledge+Drive+%26+Social+Hour&dates=20260611T220000Z/20260612T010000Z&details=Join+us+for+Sip+%26+Sync%21+A+joint+collaboration+between+Hub+Zone+Tech+and+Portal+HQ+to+close+the+digital+divide+in+North+Carolina.+Bring+your+old+laptops+to+be+securely+wiped+and+donated+to+local+students+in+need.+Enjoy+free+drinks%2C+networking%2C+food%2C+and+more.&location=Portal+HQ%2C+3801+Hillsborough+St+Suite+113%2C+Raleigh%2C+NC+27607"
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            style={{
              backgroundImage:
                "linear-gradient(180deg, color-mix(in oklch, var(--color-band) 78%, transparent) 0%, color-mix(in oklch, var(--color-band) 68%, transparent) 100%), url(/venue/venue-evening-table.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="spotlight-card group relative flex min-h-[340px] w-full min-w-0 flex-col items-center justify-center gap-6 overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-band)] p-8 text-center shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:border-[var(--color-accent)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] lg:col-span-3 sm:order-1"
          >
            <svg
              viewBox="0 0 36 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="relative z-10 h-9 w-9 text-[var(--color-accent)]"
            >
              <circle cx="18" cy="18" r="14" />
              <line x1="18" y1="4.5" x2="18" y2="7" />
              <line x1="31.5" y1="18" x2="29" y2="18" />
              <line x1="18" y1="31.5" x2="18" y2="29" />
              <line x1="4.5" y1="18" x2="7" y2="18" />
              <line x1="18" y1="18" x2="18" y2="26" />
              <line x1="18" y1="18" x2="22.5" y2="18" />
            </svg>
            <span className="relative z-10 font-mono text-sm uppercase tracking-[0.22em] text-[var(--color-accent)]">When</span>
            <div className="relative z-10 space-y-2">
              <h3 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-ink)]">Thursday, June 11</h3>
              <p className="text-base text-[var(--color-muted)] tabular-nums">6:00 PM – 9:00 PM</p>
            </div>
            <span className="relative z-10 mt-auto inline-flex items-center gap-1.5 whitespace-nowrap pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]/80 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] w-full justify-center transition-colors group-hover:text-[var(--color-accent)]">
              Add to Calendar <ArrowUpRight className="h-3 w-3" />
            </span>
          </a>

          {/* Location Card — wide hero-of-the-trio, horizontal layout */}
          <a
            href="https://maps.google.com/?q=3801+Hillsborough+St,+Suite+113,+Raleigh,+NC+27607"
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            style={{
              backgroundImage:
                "linear-gradient(180deg, color-mix(in oklch, var(--color-band) 78%, transparent) 0%, color-mix(in oklch, var(--color-band) 68%, transparent) 100%), url(/venue/venue-wood-entry.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="spotlight-card group relative flex min-h-[340px] w-full min-w-0 flex-row items-center justify-between gap-8 overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-band)] p-8 md:p-10 text-left shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:border-[var(--color-accent)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] lg:col-span-6 sm:col-span-2 sm:order-3 lg:order-2"
          >
            {/* LEFT — content stack */}
            <div className="relative z-10 flex flex-col gap-4 min-w-0 flex-1">
              <svg
                viewBox="0 0 36 36"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-9 w-9 text-[var(--color-accent)]"
              >
                <path d="M18 3.5c-5.5 0-10 4.3-10 9.6 0 7 10 19.4 10 19.4s10-12.4 10-19.4c0-5.3-4.5-9.6-10-9.6z" />
                <circle cx="18" cy="13" r="4.5" />
                <line x1="18" y1="10" x2="18" y2="16" />
                <line x1="15" y1="13" x2="21" y2="13" />
              </svg>
              <span className="font-mono text-sm uppercase tracking-[0.22em] text-[var(--color-accent)]">Where</span>
              <div className="space-y-2">
                <h3 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-ink)] leading-[1.02]">
                  <span className="whitespace-nowrap">Portal HQ</span>
                  <span className="block text-2xl md:text-3xl text-[var(--color-muted)] font-medium mt-1 italic">Raleigh, NC</span>
                </h3>
                <p className="text-base text-[var(--color-muted)] leading-snug">3801 Hillsborough St, Suite 113</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 whitespace-nowrap pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]/80 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] transition-colors group-hover:text-[var(--color-accent)] self-stretch">
                Open Maps <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

            {/* RIGHT — editorial compass-rose pointer to Raleigh */}
            <div className="relative z-10 hidden md:flex shrink-0 items-center justify-center">
              <svg
                viewBox="0 0 140 140"
                fill="none"
                aria-hidden="true"
                className="h-32 w-32 lg:h-40 lg:w-40 text-[var(--color-accent)] transition-transform duration-500 ease-out group-hover:rotate-[18deg]"
              >
                {/* outer ring */}
                <circle cx="70" cy="70" r="62" stroke="currentColor" strokeOpacity="0.32" strokeWidth="0.75" />
                <circle cx="70" cy="70" r="48" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.5" />
                {/* tick marks */}
                <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.75" strokeLinecap="round">
                  <line x1="70" y1="10" x2="70" y2="18" />
                  <line x1="70" y1="122" x2="70" y2="130" />
                  <line x1="10" y1="70" x2="18" y2="70" />
                  <line x1="122" y1="70" x2="130" y2="70" />
                </g>
                {/* compass star — N arrow */}
                <path d="M70 22 L80 70 L70 60 L60 70 Z" fill="currentColor" fillOpacity="0.78" />
                <path d="M70 118 L60 70 L70 80 L80 70 Z" fill="currentColor" fillOpacity="0.22" />
                <path d="M22 70 L70 60 L60 70 L70 80 Z" fill="currentColor" fillOpacity="0.22" />
                <path d="M118 70 L70 80 L80 70 L70 60 Z" fill="currentColor" fillOpacity="0.22" />
                {/* RDU dot */}
                <circle cx="70" cy="70" r="3.5" fill="currentColor" />
                <text x="70" y="98" textAnchor="middle" fill="currentColor" fillOpacity="0.75" fontFamily="ui-monospace, SFMono-Regular, monospace" fontSize="7.5" letterSpacing="2.2">RDU</text>
                <text x="70" y="48" textAnchor="middle" fill="currentColor" fillOpacity="0.55" fontFamily="ui-monospace, SFMono-Regular, monospace" fontSize="6.5" letterSpacing="2">N</text>
              </svg>
            </div>
          </a>

          {/* Tickets Info Card — compact right */}
          <a
            href="#tickets"
            onMouseMove={handleMouseMove}
            style={{
              backgroundImage:
                "linear-gradient(180deg, color-mix(in oklch, var(--color-band) 78%, transparent) 0%, color-mix(in oklch, var(--color-band) 68%, transparent) 100%), url(/venue/venue-bar-detail.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="spotlight-card group relative flex min-h-[340px] w-full min-w-0 flex-col items-center justify-center gap-6 overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-band)] p-8 text-center shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:border-[var(--color-accent)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] lg:col-span-3 sm:order-2 lg:order-3"
          >
            <svg
              viewBox="0 0 36 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="relative z-10 h-9 w-9 text-[var(--color-accent)]"
            >
              <path d="M4.5 11.5 L4.5 16 A2 2 0 0 1 4.5 20 L4.5 24.5 L31.5 24.5 L31.5 20 A2 2 0 0 1 31.5 16 L31.5 11.5 Z" />
              <line x1="13" y1="14" x2="13" y2="16" />
              <line x1="13" y1="20" x2="13" y2="22" />
              <path d="M21 14.5 L21 21.5 M18.5 16 Q18.5 14.5 21 14.5 Q23.5 14.5 23.5 16 Q23.5 17.5 21 18 Q18.5 18.5 18.5 20 Q18.5 21.5 21 21.5 Q23.5 21.5 23.5 20" />
            </svg>
            <span className="relative z-10 font-mono text-sm uppercase tracking-[0.22em] text-[var(--color-accent)]">Admission</span>
            <div className="relative z-10 space-y-2">
              <h3 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-ink)] tabular-nums">$5.00</h3>
              <p className="text-base text-[var(--color-muted)] leading-snug max-w-[24ch] mx-auto">Includes craft drinks + live networking</p>
            </div>
            <span className="relative z-10 mt-auto inline-flex items-center gap-1.5 whitespace-nowrap pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]/80 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] w-full justify-center transition-colors group-hover:text-[var(--color-accent)]">
              Secure Passes <ArrowUpRight className="h-3 w-3" />
            </span>
          </a>
        </div>
      </section>

      {/* THE COLLABORATION (BENTO GRID) */}
      <section id="about" className="section bg-black/20 border-y border-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]">
        <div className="container space-y-8">
          <div className="max-w-2xl">
            <div className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-[0.18em] mb-3 font-sans">
              Why we’re gathering
            </div>
            <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)]">
              The Collaboration
            </h2>
            <p className="text-lg text-[var(--color-muted)] mt-2">
              Fusing hardware digital accessibility with Raleigh’s high-energy startup and creative ecosystem for one powerful night of impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* HTI Bento Card */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 md:p-10 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-band)] shadow-sm flex flex-col gap-8 hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="space-y-4.5">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-accent)] font-sans">
                    501(c)(3) Nonprofit Partner
                  </span>
                </div>

                {/* Massive Brand Logo Wrapper */}
                <div className="flex items-center justify-center min-h-[140px] bg-black/40 border border-white/5 rounded-xl py-5 px-5 relative overflow-hidden group">
                  <HTILogo className="h-[80px] w-auto filter contrast-[1.03] transition-all group-hover:scale-105 duration-300 object-contain" />
                </div>

                <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  HUBZone Technology Initiative
                </h3>

                <p className="text-base text-[var(--color-muted)] leading-relaxed">
                  HTI bridges the digital divide by transforming retired corporate and private laptops into secure Chromebooks and providing digital literacy training to NC families who lack access to technology.
                </p>

                <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] border-y border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)]">
                  <div className="px-4 py-3.5 sm:py-4 sm:first:pl-0 sm:last:pr-0 sm:px-5">
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Wipe</dt>
                    <dd className="mt-1 font-sans text-sm font-semibold uppercase tracking-[0.04em] tabular-nums leading-snug text-[var(--color-ink)]">DoD 5220.22-M</dd>
                  </div>
                  <div className="px-4 py-3.5 sm:py-4 sm:first:pl-0 sm:last:pr-0 sm:px-5">
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Rebuild</dt>
                    <dd className="mt-1 font-sans text-sm font-semibold uppercase tracking-[0.04em] tabular-nums leading-snug text-[var(--color-ink)]">Refurbished OS</dd>
                  </div>
                  <div className="px-4 py-3.5 sm:py-4 sm:first:pl-0 sm:last:pr-0 sm:px-5">
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Reach</dt>
                    <dd className="mt-1 font-sans text-sm font-semibold uppercase tracking-[0.04em] tabular-nums leading-snug text-[var(--color-ink)]">Distribution + courses</dd>
                  </div>
                </dl>
              </div>

              <a
                href="https://www.hubzonetech.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm font-semibold text-[var(--color-accent)] inline-flex items-center gap-1 hover:underline mt-5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-band)]"
              >
                Visit hubzonetech.org <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Portal HQ Bento Card */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 md:p-10 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-band)] shadow-sm flex flex-col gap-8 hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="space-y-4.5">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-accent)] font-sans">
                    Host &amp; Experience Partner
                  </span>
                </div>

                {/* Massive Brand Logo Wrapper */}
                <div className="flex items-center justify-center min-h-[140px] bg-black/40 border border-white/5 rounded-xl py-5 px-5 relative overflow-hidden group">
                  <img src="/portal-logo.png" alt="Portal HQ" className="h-[80px] w-auto filter contrast-[1.02] transition-all group-hover:scale-105 duration-300 object-contain" />
                </div>

                <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--color-ink)] whitespace-nowrap">
                  Portal HQ
                </h3>

                <p className="text-base text-[var(--color-muted)] leading-relaxed">
                  Raleigh’s premier community workspace and multi-purpose venue. Fostering a high-energy creative ecosystem for entrepreneurs, artists, founders, locally connecting and executing.
                </p>

                <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] border-y border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)]">
                  <div className="px-4 py-3.5 sm:py-4 sm:first:pl-0 sm:last:pr-0 sm:px-5">
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Stage</dt>
                    <dd className="mt-1 font-sans text-sm font-semibold uppercase tracking-[0.04em] tabular-nums leading-snug text-[var(--color-ink)]">12 Gobo lights</dd>
                  </div>
                  <div className="px-4 py-3.5 sm:py-4 sm:first:pl-0 sm:last:pr-0 sm:px-5">
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Floor</dt>
                    <dd className="mt-1 font-sans text-sm font-semibold uppercase tracking-[0.04em] tabular-nums leading-snug text-[var(--color-ink)]">5,000 sq ft</dd>
                  </div>
                  <div className="px-4 py-3.5 sm:py-4 sm:first:pl-0 sm:last:pr-0 sm:px-5">
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Tenants</dt>
                    <dd className="mt-1 font-sans text-sm font-semibold uppercase tracking-[0.04em] tabular-nums leading-snug text-[var(--color-ink)]">Founder hub</dd>
                  </div>
                </dl>
              </div>

              <a
                href="https://theportalhq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm font-semibold text-[var(--color-accent)] inline-flex items-center gap-1 hover:underline mt-5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-band)]"
              >
                Visit theportalhq.com <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Shared Purpose Bento Card (Wide Span) */}
            <div
              className="md:col-span-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-panel)] shadow-md overflow-hidden grid lg:grid-cols-12"
            >
              <div className="p-8 sm:p-10 md:p-12 lg:p-16 lg:col-span-7 flex flex-col justify-center space-y-4">
                <div>
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-accent)] font-sans">
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
                  By bringing your retired laptop to our social hour, you are not simply recycling silicon. You are directly presenting a NC student with the tools to complete their schooling, expand their ambitions, and pursue their goals. Let’s make sure no child gets left behind.
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
      <section id="venue-spotlight" className="section bg-black/16 border-b border-[color-mix(in_oklch,var(--color-ink)_5%,transparent)]">
        <div className="container space-y-8">
          <div className="grid lg:grid-cols-12 gap-y-8 lg:gap-x-16 items-center">
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-4 lg:py-2">
              <div className="space-y-2">
                <span className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-[0.18em] font-sans">
                  The experience space
                </span>
                <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)] mt-3 leading-[0.95]">
                  The Venue:
                  <span className="block whitespace-nowrap text-[var(--color-accent)]">Portal HQ</span>
                </h2>
                <p className="text-lg md:text-xl text-[var(--color-muted)] max-w-[46ch] mx-auto leading-relaxed mt-5">
                  A state-of-the-art 5,000 sq ft community workspace and high-production showcase venue in downtown Raleigh.
                </p>
              </div>

              <p className="text-base text-[var(--color-muted)] leading-relaxed max-w-[54ch] mx-auto">
                The Sip &amp; Sync Social Hour will take place in the main gallery hall of <span className="whitespace-nowrap">Portal HQ</span>. Attendees will experience our full in-house concert production system: 12 active moving Gobo lighting beams, high-lumen visual projection setups, and background ambient sound networks.
              </p>

              <div className="grid grid-cols-2 gap-5 pt-4 w-full max-w-lg mx-auto">
                <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-[var(--color-surface)] p-8 text-center shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <strong className="font-display text-5xl md:text-6xl font-extrabold leading-none tracking-[-0.04em] text-[var(--color-ink)] tabular-nums">5,000</strong>
                  <span className="text-base md:text-lg font-bold text-[var(--color-accent)]">Sq Ft</span>
                  <span className="max-w-[18ch] text-sm leading-snug text-[var(--color-muted)]">Flexible creative hub</span>
                </div>
                <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-[var(--color-surface)] p-8 text-center shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <strong className="font-display text-5xl md:text-6xl font-extrabold leading-none tracking-[-0.04em] text-[var(--color-ink)] tabular-nums">150+</strong>
                  <span className="text-base md:text-lg font-bold text-[var(--color-accent)]">Free Parking</span>
                  <span className="max-w-[18ch] text-sm leading-snug text-[var(--color-muted)]">Spaces on site</span>
                </div>
              </div>
            </div>

            {/* Asymmetric Venue Photo Grid */}
            <div className="lg:col-span-6 lg:col-start-7 grid grid-cols-2 gap-2">
              <div className="rounded-xl overflow-hidden aspect-[4/3] border bg-[var(--color-bg-dark)] shadow-sm">
                <img
                  src="/venue/venue-daylight-floor.jpg"
                  alt="Daylight Portal HQ space"
                  className="kenburns-photo w-full h-full object-cover filter contrast-[1.02]"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-[4/3] border bg-[var(--color-bg-dark)] shadow-sm">
                <img
                  src="/venue/venue-evening-table.jpg"
                  alt="Evening reception setup"
                  className="kenburns-photo kenburns-photo-delayed w-full h-full object-cover filter contrast-[1.02]"
                />
              </div>
              <div className="col-span-2 rounded-xl overflow-hidden aspect-[16/9] border bg-[var(--color-bg-dark)] shadow-sm relative group">
                <img
                  src="/venue/venue-stage-lighting.jpg"
                  alt="Concert stage lighting production"
                  className="kenburns-photo w-full h-full object-cover filter contrast-[1.02]"
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

          <div id="explore-3d" className="relative scroll-mt-24 space-y-6 p-8 md:p-12 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-accent)_20%,var(--color-border))] bg-[var(--color-panel)] shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_30px_color-mix(in_oklch,var(--color-accent)_12%,transparent)] mt-10">
            <div aria-hidden="true" className="absolute left-0 top-12 bottom-12 w-1 bg-[var(--color-accent)] rounded-r-full" />
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/8 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Interactive 360°
                </span>
                <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-ink)]">Explore Before You Arrive</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">Walk the main gallery, stage, and lobby from this page. Use touch or drag to look around.</p>
              </div>
              <a
                href={virtualTourSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--color-ink)_14%,transparent)] px-6 font-sans text-sm font-semibold text-[var(--color-ink)] transition-all hover:bg-white/5 hover:border-[var(--color-accent)]/45 hover:text-[var(--color-accent)] hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-panel)]"
              >
                Open full tour
              </a>
            </div>
            {/* Walkthrough viewport — full-bleed, no fake browser chrome */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_12%,transparent)] bg-black shadow-xl shadow-black/30">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/40 to-transparent" />
                <iframe
                  src={virtualTourSrc}
                  title="Sip & Sync Portal HQ Virtual Tour"
                  allow="fullscreen; xr-spatial-tracking"
                  sandbox="allow-scripts allow-same-origin"
                  allowFullScreen
                  loading="lazy"
                  className="block w-full border-0"
                  style={{
                    height: "clamp(360px, 62vh, 680px)",
                    background: "#000"
                  }}
                />
              </div>

              {/* Waypoint switcher — editorial numbered rail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)]">
                {tourWaypoints.map((wp, i) => {
                  const isActive = activeScene === wp.id;
                  return (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => {
                        setActiveScene(wp.id);
                        toastRef.current?.show(`Navigating walkthrough to ${wp.name}...`);
                      }}
                      aria-pressed={isActive}
                      className={`group relative flex items-baseline gap-3 px-5 py-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-inset ${
                        isActive
                          ? "bg-[var(--color-accent)]/12 text-[var(--color-ink)]"
                          : "bg-[var(--color-panel)] text-[var(--color-muted)] hover:bg-[var(--color-panel-strong)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <span className={`font-mono text-xs tracking-[0.18em] tabular-nums ${isActive ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]/70"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <strong className="font-display text-base font-semibold leading-none tracking-tight">{wp.name}</strong>
                        <span className="text-sm leading-snug text-[var(--color-muted)]">{wp.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKETS & DONATIONS */}
      <section id="tickets" className="section container py-20 md:py-28">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-[0.18em] font-sans">
              Reserve Admission Passes
            </span>
            <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)]">
              Tickets &amp; Donations
            </h2>
            <p className="text-base text-[var(--color-muted)] max-w-[52ch] mx-auto leading-relaxed">
              Admission passes are just $5.00 each. Every ticket purchased directly covers event operational costs, with all additional donations funding hardware secure wipes.
            </p>
          </div>

          {/* Tax-receipt circular medallion — pure graphic, no text/font inside */}
          <div className="p-7 sm:p-8 rounded-xl border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-surface)]/50 grid grid-cols-[auto_1fr] items-center gap-7">
            <div className="relative h-[108px] w-[108px] shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full text-[var(--color-accent)] [animation:seal-spin_45s_linear_infinite] motion-reduce:[animation:none]"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 4" opacity="0.55" />
                <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const x1 = (50 + Math.cos(angle) * 43).toFixed(3);
                    const y1 = (50 + Math.sin(angle) * 43).toFixed(3);
                    const x2 = (50 + Math.cos(angle) * 39).toFixed(3);
                    const y2 = (50 + Math.sin(angle) * 39).toFixed(3);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
                  })}
                </g>
              </svg>
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-[10px] h-[calc(100%-20px)] w-[calc(100%-20px)] text-[var(--color-accent)]"
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="40" fill="color-mix(in oklch, var(--color-accent) 8%, transparent)" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
                <g opacity="0.32">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 45 * Math.PI) / 180;
                    const x = (50 + Math.cos(angle) * 27).toFixed(3);
                    const y = (50 + Math.sin(angle) * 27).toFixed(3);
                    return <circle key={i} cx={x} cy={y} r="0.9" fill="currentColor" />;
                  })}
                </g>
                <path
                  d="M50 27 C 57 27, 65 30, 70 33 L 70 52 C 70 62, 63 70, 50 76 C 37 70, 30 62, 30 52 L 30 33 C 35 30, 43 27, 50 27 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M40 51 L 47 59 L 62 42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="space-y-1 text-sm">
              <strong className="block text-[var(--color-ink)] font-semibold text-base">Receipts for Eligible Donations</strong>
              <p className="text-[var(--color-muted)] leading-relaxed">HTI is a 501(c)(3) nonprofit. Ticket purchases reserve admission; additional gifts can be receipted as donations.</p>
            </div>
          </div>

          <div className="p-8 sm:p-10 md:p-12 rounded-2xl border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-panel)] shadow-xl shadow-[0_0_50px_rgba(0,0,0,0.25)]">
            <PledgeForm mode="ticket" />
          </div>
        </div>
      </section>

      {/* LAPTOP PLEDGE DRIVE */}
      <section id="pledge" className="section bg-black/20 border-t border-[color-mix(in_oklch,var(--color-ink)_5%,transparent)] pb-12 md:pb-16">
        <div className="container space-y-8">
          {/* Section header — spans full width above the grid for column-top alignment */}
          <div className="max-w-3xl space-y-2">
            <span className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-[0.14em] font-sans font-semibold">
              Drive Metrics
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-ink)]">
              Live Laptop Pledge Tracker
            </h2>
            <p className="text-base text-[var(--color-muted)] leading-relaxed">
              Help us reach our collaborative event goal of <strong className="text-[var(--color-ink)]">150 pledged laptops</strong>. Bring your old device to <span className="whitespace-nowrap">Portal HQ</span>, or arrange a free pickup!
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8 items-start">

            {/* Live Progress Tracker Column */}
            <div className="lg:col-span-5 space-y-5 flex flex-col">
              {/* Live Metric Progress Counter Card */}
              <div
                onMouseMove={handleMouseMove}
                className="p-7 rounded-xl border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-band)] shadow-md space-y-6 spotlight-card"
              >
                <div className="flex items-center justify-between border-b border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] pb-3">
                  <div className="text-xs font-semibold text-[var(--color-muted)] font-sans flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse mr-2" aria-hidden="true" />
                    Live Progress
                  </div>
                  <span className="text-xs font-semibold tracking-tight text-[var(--color-signal)]">Local preview</span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2 border-r border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] py-1">
                    <span className="text-xs text-[var(--color-muted)] font-sans uppercase tracking-[0.14em] font-semibold block">Target</span>
                    <strong key={`goal-${PLEDGE_GOAL}`} className="pledge-count-tick font-display text-3xl md:text-4xl font-bold text-[var(--color-accent)] block tabular-nums leading-none">{PLEDGE_GOAL}</strong>
                  </div>
                  <div className="space-y-2 border-r border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] py-1">
                    <span className="text-xs text-[var(--color-muted)] font-sans uppercase tracking-[0.14em] font-semibold block">Pledged</span>
                    <strong key={`pledged-${pledgesCount}`} className="pledge-count-tick font-display text-3xl md:text-4xl font-bold text-[var(--color-ink)] block tabular-nums leading-none">{pledgesCount}</strong>
                  </div>
                  <div className="space-y-2 py-1">
                    <span className="text-xs text-[var(--color-muted)] font-sans uppercase tracking-[0.14em] font-semibold block">Remaining</span>
                    <strong key={`remaining-${remainingCount}`} className="pledge-count-tick font-display text-3xl md:text-4xl font-bold text-[var(--color-signal)] block tabular-nums leading-none">{remainingCount}</strong>
                  </div>
                </div>

                {/* Progress bar tracks — shimmering fill, count-up animation handled by key prop */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold font-sans">
                    <span className="text-[var(--color-muted)] uppercase tracking-[0.14em] text-xs font-semibold">Campaign Progress</span>
                    <span key={`pct-${percentage}`} className={`pledge-count-tick text-[var(--color-accent)] tabular-nums ${percentage > 0 ? 'drop-shadow-[0_0_18px_color-mix(in_oklch,var(--color-accent)_60%,transparent)]' : ''}`}>{percentage}%</span>
                  </div>

                  <div className="pledge-progress-track relative h-3 w-full rounded-full bg-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] overflow-hidden p-0.5 border transition-shadow hover:shadow-[0_0_24px_color-mix(in_oklch,var(--color-accent)_30%,transparent)]">
                    <div
                      className="pledge-progress-fill relative h-full rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_rgba(245,132,32,0.5)] transition-all duration-[1200ms] ease-out"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-[var(--color-muted)] leading-relaxed italic text-center">
                  {pledgesCount === 0
                    ? "Be the first to pledge a laptop and jumpstart the campaign."
                    : pledgesCount < PLEDGE_GOAL
                      ? `Only ${remainingCount} more laptops needed to hit the Raleigh milestone.`
                      : "Raleigh milestone reached. Thank you for helping close the digital divide."
                  }
                </p>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed text-center border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] pt-3 mt-1">
                  Displayed pledges come from submitted forms saved in this browser until a live database is connected.
                </p>
              </div>

              {/* Logistics grid info */}
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Drop-off Location card with embedded map */}
                <div className="rounded-lg border border-white/5 bg-[var(--color-surface)] overflow-hidden flex flex-col">
                  <div className="relative w-full overflow-hidden border-b border-white/5 bg-[var(--color-bg-dark)]">
                    <iframe
                      src="https://www.google.com/maps?q=3801+Hillsborough+St+Suite+113+Raleigh+NC+27607&output=embed"
                      width="100%"
                      height="160"
                      style={{ border: 0, filter: "grayscale(0.25) contrast(1.05)" }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Drop-off location map"
                      aria-label="Map showing Portal HQ at 3801 Hillsborough St Suite 113 Raleigh NC 27607"
                    />
                  </div>
                  <div className="p-5 space-y-2 text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--color-accent)] font-bold font-sans">
                      <MapPin className="h-4 w-4 shrink-0" />
                      Drop-off Location
                    </div>
                    <strong className="block text-[var(--color-ink)] font-sans"><span className="whitespace-nowrap">Portal HQ</span> Lobby</strong>
                    <p className="text-[var(--color-muted)] leading-relaxed font-sans">
                      3801 Hillsborough St, Suite 113, Raleigh. Drop off during the event or standard workspace hours.
                    </p>
                  </div>
                </div>

                {/* Free Vehicle Pickup card with truck SVG */}
                <div className="p-6 rounded-lg border border-white/5 bg-[var(--color-surface)] space-y-3 text-sm">
                  <svg
                    viewBox="0 0 80 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-12 w-auto text-[var(--color-accent)]"
                  >
                    {/* Cab + cargo body */}
                    <path d="M3 12 L48 12 L48 36 L3 36 Z" />
                    <path d="M48 18 L62 18 L72 26 L72 36 L48 36 Z" />
                    {/* Cab window */}
                    <path d="M52 21 L60 21 L67 27 L52 27 Z" />
                    {/* Cargo door seam */}
                    <line x1="25" y1="14" x2="25" y2="34" />
                    {/* Wheels */}
                    <circle cx="16" cy="38" r="4.5" />
                    <circle cx="60" cy="38" r="4.5" />
                    {/* Ground line */}
                    <line x1="0" y1="42" x2="80" y2="42" strokeDasharray="2 4" opacity="0.45" />
                  </svg>
                  <div className="flex items-center gap-1.5 text-[var(--color-accent)] font-bold font-sans">
                    <Award className="h-4 w-4 shrink-0" />
                    Free Vehicle Pickup
                  </div>
                  <strong className="block text-[var(--color-ink)] font-sans">Donating 5+ Laptops?</strong>
                  <p className="text-[var(--color-muted)] leading-relaxed font-sans">
                    If your business or household has 5 or more laptops to pledge, we’ll coordinate a free courier pickup.
                  </p>
                  <a href="mailto:pickups@hubzonetech.org" className="text-sm font-semibold text-[var(--color-accent)] hover:underline block pt-1 font-sans">
                    Email pickups@hubzonetech.org ➔
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-7 md:p-8 rounded-2xl border border-[color-mix(in_oklch,var(--color-ink)_10%,transparent)] bg-[var(--color-panel)] shadow-xl shadow-[0_0_50px_rgba(0,0,0,0.25)] h-full flex flex-col">
              <PledgeForm mode="laptop" />
            </div>

          </div>
        </div>
      </section>

      {/* CONNECT & SHARE */}
      <section id="connect" className="section container">
        <div className="space-y-8">
          <div className="max-w-2xl">
            <span className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-[0.18em] block mb-3 font-sans">
              Get in Touch
            </span>
            <h2 className="display-lg tracking-[-0.04em] text-[var(--color-ink)]">
              Connect &amp; Share
            </h2>
            <p className="text-lg text-[var(--color-muted)] mt-2">
              Have questions about tax certificates, corporate bulk pledges, or event partnerships? Reach out directly to coordinating directors.
            </p>
          </div>

          {/* SPREAD THE WORD — full-bleed editorial-brutalist panel */}
          <style>{`
            @keyframes mega-wave-ring {
              0%   { transform: scale(0.35); opacity: 0.85; }
              80%  { opacity: 0.05; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            .mega-wave { animation: mega-wave-ring 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite; transform-origin: center; }
            .mega-wave.delay-1 { animation-delay: 0.65s; }
            .mega-wave.delay-2 { animation-delay: 1.3s; }
            @media (prefers-reduced-motion: reduce) {
              .mega-wave { animation: none !important; opacity: 0.35; }
            }
            @keyframes spread-grain {
              0%, 100% { transform: translate(0, 0); }
              50% { transform: translate(-2%, 1%); }
            }
            .spread-grain-layer {
              background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>");
              background-size: 220px 220px;
              mix-blend-mode: overlay;
              opacity: 0.18;
              animation: spread-grain 8s steps(6) infinite;
            }
          `}</style>
          <div
            className="relative isolate overflow-hidden rounded-[var(--radius-md)] border-2 border-[var(--color-accent)]/30 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)]"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--color-accent) 92%, black) 0%, color-mix(in oklch, var(--color-accent) 68%, black) 30%, color-mix(in oklch, var(--color-bg-dark) 88%, black) 75%, var(--color-bg-dark) 100%)"
            }}
          >
            {/* Grain texture overlay */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none spread-grain-layer" />

            {/* Diagonal corner ribbon */}
            <div
              aria-hidden="true"
              className="absolute -right-16 top-7 z-20 rotate-45 bg-[var(--color-bg-dark)] text-[var(--color-accent)] font-mono text-[10px] font-bold uppercase tracking-[0.32em] px-20 py-1.5 border-y border-[var(--color-accent)]/60 shadow-md"
            >
              Share NC
            </div>

            {/* Faint vertical type accent */}
            <div
              aria-hidden="true"
              className="absolute right-6 bottom-6 z-10 font-mono text-[10px] uppercase tracking-[0.42em] text-white/35 [writing-mode:vertical-rl] rotate-180"
            >
              Amplify · Pledge · Repeat
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center gap-8 px-8 sm:px-12 md:px-16 lg:px-20 py-14 md:py-20">
              {/* Animated megaphone + radio waves */}
              <div className="md:col-span-3 flex justify-center md:justify-start">
                <div
                  aria-hidden="true"
                  className="relative h-[160px] w-[160px] flex items-center justify-center"
                >
                  <span className="mega-wave absolute inset-0 rounded-full border-2 border-white/40" />
                  <span className="mega-wave delay-1 absolute inset-0 rounded-full border-2 border-white/30" />
                  <span className="mega-wave delay-2 absolute inset-0 rounded-full border-2 border-white/20" />
                  <svg
                    viewBox="0 0 120 120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative z-10 h-[100px] w-[100px] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]"
                  >
                    <path d="M16 54 L16 78 a4 4 0 0 0 4 4 h10 L60 100 V32 L30 50 H20 a4 4 0 0 0 -4 4 z" fill="currentColor" fillOpacity="0.1" />
                    <path d="M70 46 c8 6 12 14 12 20 s-4 14 -12 20" />
                    <path d="M84 36 c12 9 18 21 18 30 s-6 21 -18 30" />
                    <path d="M34 82 L36 96" />
                  </svg>
                </div>
              </div>

              {/* Massive headline */}
              <div className="md:col-span-6 space-y-3 text-center md:text-left">
                <span className="inline-block font-mono text-[10px] uppercase tracking-[0.36em] font-semibold text-white/70 border border-white/25 rounded-full px-3 py-1">
                  Signal Boost
                </span>
                <h4
                  className="font-display font-extrabold leading-[0.92] tracking-[-0.04em] text-white"
                  style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)" }}
                >
                  Spread<br className="hidden sm:block" /> the Word<span className="text-[var(--color-bg-dark)] drop-shadow-[0_2px_0_rgba(255,255,255,0.35)]">.</span>
                </h4>
                <p className="text-base md:text-lg text-white/85 leading-relaxed max-w-[44ch] mx-auto md:mx-0">
                  No spare laptop? <strong className="text-white font-semibold">Share this flyer.</strong> Every retweet, every Slack drop, every forwarded link makes a Raleigh student’s screen light up.
                </p>
              </div>

              {/* CTAs */}
              <div className="md:col-span-3 flex flex-col gap-3">
                <button
                  onClick={handleCopyLink}
                  className="group flex items-center justify-center gap-2.5 rounded-full bg-white text-[var(--color-bg-dark)] px-6 py-3.5 font-sans text-sm font-bold tracking-tight shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-accent)]"
                >
                  <Share2 className="h-4 w-4 transition-transform group-hover:rotate-12" aria-hidden="true" />
                  Copy Event URL
                </button>
                <a
                  href="/sip_and_sync_flyer.png"
                  download="Sip_And_Sync_Flyer.png"
                  className="group flex items-center justify-center gap-2.5 rounded-full border-2 border-white/80 text-white px-6 py-3.5 font-sans text-sm font-bold tracking-tight transition-all hover:bg-white hover:text-[var(--color-bg-dark)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-accent)]"
                >
                  Download Flyer
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* Coordinators Grid */}
          <div className="grid md:grid-cols-3 gap-4.5">
            {/* Will Sigmon */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 md:p-10 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-band)] shadow-sm flex flex-col items-center text-center gap-6 hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden spotlight-card"
            >
              <div className="flex h-28 items-center justify-center opacity-70 group-hover:opacity-95 transition-opacity duration-300">
                <img src="/hti-cropped.png" alt="" aria-hidden="true" className="h-28 w-auto object-contain" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-2xl text-[var(--color-ink)] leading-tight">Will Sigmon</h4>
                <span className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-[0.18em] block font-sans">
                  HTI representative
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed font-sans max-w-[32ch]">
                Oversees hardware donation logistics, secure wipe data compliance verification, and 501(c)(3) corporate tax certificates.
              </p>
              <div className="mt-auto pt-5 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] w-full flex justify-center">
                <a
                  href="mailto:wsigmon@hubzonetech.org"
                  className="text-sm font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-2 font-sans rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-band)]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" /> wsigmon@hubzonetech.org
                </a>
              </div>
            </div>

            {/* David Galindo */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 md:p-10 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-band)] shadow-sm flex flex-col items-center text-center gap-6 hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden spotlight-card"
            >
              <div className="flex h-14 items-center justify-center gap-3 opacity-70 group-hover:opacity-95 transition-opacity duration-300" aria-hidden="true">
                <img src="/hti-cropped.png" alt="" className="h-14 w-auto object-contain" />
                <span className="text-3xl text-[var(--color-accent)]/55 font-light mx-1 select-none">+</span>
                <img src="/portal-logo.png" alt="" className="h-14 w-auto object-contain" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-2xl text-[var(--color-ink)] leading-tight">David Galindo</h4>
                <span className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-[0.18em] block font-sans">
                  Coordinating director
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed font-sans max-w-[32ch]">
                Coordinates joint campaign workflows, secure check-in operations, sponsor relationships, and community outreach.
              </p>
              <div className="mt-auto pt-5 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] w-full flex justify-center">
                <a
                  href="mailto:dgalindo@kurvpay.com"
                  className="text-sm font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-2 font-sans rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-band)]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" /> dgalindo@kurvpay.com
                </a>
              </div>
            </div>

            {/* Jake Berlin */}
            <div
              onMouseMove={handleMouseMove}
              className="p-8 md:p-10 rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] bg-[var(--color-band)] shadow-sm flex flex-col items-center text-center gap-6 hover:border-[var(--color-accent)]/20 transition-all duration-300 relative group overflow-hidden spotlight-card"
            >
              <div className="flex h-28 items-center justify-center opacity-70 group-hover:opacity-95 transition-opacity duration-300">
                <img src="/portal-logo.png" alt="" aria-hidden="true" className="h-28 w-auto object-contain" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-2xl text-[var(--color-ink)] leading-tight">Jake Berlin</h4>
                <span className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-[0.18em] block font-sans">
                  Portal HQ co-founder
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed font-sans max-w-[32ch]">
                Handles venue logistics, stage AV lighting design coordination, craft beverage sponsorships, and founder partnerships.
              </p>
              <div className="mt-auto pt-5 border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] w-full flex justify-center">
                <a
                  href="mailto:jake@theportalhq.com"
                  className="text-sm font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-2 font-sans rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-band)]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" /> jake@theportalhq.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[color-mix(in_oklch,var(--color-ink)_6%,transparent)] py-12 text-sm text-[var(--color-muted)] bg-[var(--color-surface)]/20">
        <div className="container flex flex-col md:flex-row md:items-center md:justify-between gap-y-8">
          {/* LEFT: co-branding lockup */}
          <div className="flex items-center gap-3.5 opacity-85" aria-hidden="true">
            <HTILogo className="h-10 w-auto object-contain" />
            <span className="text-xl text-[var(--color-accent)]/55 font-light select-none mx-1">+</span>
            <img src="/portal-logo.png" alt="" className="h-10 w-auto object-contain" />
          </div>

          {/* RIGHT: credit + links stacked */}
          <div className="flex flex-col items-start md:items-end gap-3 text-left md:text-right">
            <div>Sip &amp; Sync Social Hour — HTI + <span className="whitespace-nowrap">Portal HQ</span> • June 11, 2026</div>
            <div className="flex gap-7 font-semibold">
              <a href="https://hubzonetech.org" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]">hubzonetech.org</a>
              <a href="https://theportalhq.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-accent)] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]">theportalhq.com</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ACTIVE TICKET RETRIEVAL FLOATING PILL */}
      {hasTicket && (
        <div className="fixed bottom-4 right-4 z-40 animate-fade-in-up delay-500">
          <button
            onClick={handleOpenTicket}
            aria-label={`View active ticket for ${savedTicketName}`}
            className="flex items-center gap-2 px-5 py-3 rounded-full border border-[color-mix(in_oklch,var(--color-on-accent)_25%,transparent)] bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-lg hover:bg-[color-mix(in_oklch,var(--color-accent)_92%,black)] transition-all font-display text-sm font-semibold tracking-tight shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-on-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--color-on-accent)] animate-pulse" aria-hidden="true" />
            <Ticket className="h-4 w-4" aria-hidden="true" />
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
              aria-label="Close ticket modal"
              className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[color-mix(in_oklch,var(--color-ink)_8%,transparent)] text-2xl font-bold leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
            >
              <span aria-hidden="true">&times;</span>
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
