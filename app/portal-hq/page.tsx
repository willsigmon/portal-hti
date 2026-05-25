"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/Button";
import { AccessParkingSection } from "@/components/AccessParkingSection";
import { JsonLd } from "@/components/JsonLd";
import { PortalFooter } from "@/components/PortalFooter";
import { PortalNav } from "@/components/PortalNav";
import { Starfield } from "@/components/Starfield";
import { Toast, type ToastRef } from "@/components/Toast";
import {
  BENTO_PHOTOS,
  CONTACT,
  EVENT_TYPES,
  FAQS,
  FAQ_JSON_LD,
  FEATURE_CARDS,
  GALLERY_IMAGES,
  LOCAL_BUSINESS_JSON_LD,
  PHOTOS,
  PLAN_STEPS,
  REVIEWS,
  TECH_EQUIPMENT,
  VENUE_STATS,
} from "@/lib/portal-content";

const DEFAULT_SPECS: Record<string, boolean> = {
  [TECH_EQUIPMENT.lighting[0].name]: true,
  [TECH_EQUIPMENT.audio[0].name]: true,
  [TECH_EQUIPMENT.audio[3].name]: false,
  [TECH_EQUIPMENT.lighting[1].name]: false,
  [TECH_EQUIPMENT.facilities[0].name]: false,
  [TECH_EQUIPMENT.facilities[1].name]: false,
  [TECH_EQUIPMENT.facilities[5].name]: true,
};

const categoryTabs = [
  { id: "all", label: "All views" },
  { id: "corporate", label: "Corporate" },
  { id: "showcase", label: "Showcase" },
  { id: "celebration", label: "Celebrations" },
];

export default function PortalHQBooking() {
  const toastRef = useRef<ToastRef | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [carouselCategory, setCarouselCategory] = useState("all");
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, boolean>>(DEFAULT_SPECS);
  const [activeConfigTab, setActiveConfigTab] = useState("audio");
  const [formStep, setFormStep] = useState(1);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "corporate",
    guestCount: "50-100",
    date: "",
    notes: "",
  });

  const filteredImages = useMemo(() => {
    if (carouselCategory === "all") return GALLERY_IMAGES;
    return GALLERY_IMAGES.filter((img) => img.category === carouselCategory || img.category === "general");
  }, [carouselCategory]);

  const activeSpecs = useMemo(
    () => Object.entries(selectedSpecs).filter(([, active]) => active).map(([name]) => name),
    [selectedSpecs],
  );

  const handleNextImg = () => setCarouselIdx((prev) => (prev + 1) % filteredImages.length);
  const handlePrevImg = () => setCarouselIdx((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);

  const toggleSpec = (specName: string) => {
    setSelectedSpecs((prev) => ({ ...prev, [specName]: !prev[specName] }));
    toastRef.current?.show(`${selectedSpecs[specName] ? "Removed" : "Added"}: ${specName}`);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventLabel = EVENT_TYPES.find((event) => event.id === formData.eventType)?.title || "Custom Portal HQ event";
    const subject = `Portal HQ proposal request — ${eventLabel}`;
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone || "Not provided"}`,
      `Event type: ${eventLabel}`,
      `Guest count: ${formData.guestCount}`,
      `Target date: ${formData.date || "Flexible / TBD"}`,
      "",
      "Selected room / AV configuration:",
      ...(activeSpecs.length ? activeSpecs.map((item) => `- ${item}`) : ["- No specific specs selected yet"]),
      "",
      "Notes:",
      formData.notes || "No additional notes yet.",
    ].join("\n");

    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormSubmitted(true);
    toastRef.current?.show("Proposal email draft opened for Jake Berlin.");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white grain">
      <JsonLd data={LOCAL_BUSINESS_JSON_LD} />
      <JsonLd data={FAQ_JSON_LD} />
      <Starfield opacity={0.52} />
      <Toast ref={toastRef} />
      <PortalNav />

      <main className="relative overflow-hidden">
        <section className="container relative grid gap-12 pb-20 pt-10 md:pt-16 lg:grid-cols-12 lg:items-center">
          {/* Minimalist Celestial Gold-Leaf Engraving Backdrop */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 select-none opacity-80 transition-opacity duration-1000 md:h-[800px] md:w-[800px] lg:h-[1000px] lg:w-[1000px]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--color-accent)]/15 to-[var(--color-violet)]/20 blur-3xl animate-pulse" />
            <img 
              src="/portal_cosmic_hero.png" 
              alt="" 
              className="absolute inset-0 h-full w-full object-contain mix-blend-screen opacity-85 animate-spin-slow filter sepia-[0.95] saturate-[0.7] brightness-[0.75] contrast-[1.15] hue-rotate-[320deg] drop-shadow-[0_0_80px_rgba(217,125,84,0.38)]"
              style={{ 
                animationDuration: "140s",
                maskImage: "radial-gradient(circle, rgba(0,0,0,1) 28%, rgba(0,0,0,0) 65%)", 
                WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 28%, rgba(0,0,0,0) 65%)" 
              }}
            />
          </div>

          <div className="relative z-10 space-y-8 lg:col-span-7">
            <div className="eyebrow">// 35.7876° N, 78.6791° W // SECTION 01 // THE RALEIGH EVENT HOUSE</div>
            <h1 className="display-xl max-w-[12ch] leading-[1.08] tracking-tight">
              One Space. <span className="font-normal italic bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-violet)] to-[var(--color-accent)] bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(217,125,84,0.1)]">Every Event.</span>
            </h1>
            <p className="max-w-[30ch] border-l-2 border-[var(--color-accent)]/30 pl-5 font-display text-2xl font-medium italic leading-relaxed text-[var(--color-muted)] md:text-3xl">
              A transformable venue for corporate retreats, live showcases, and private celebrations.
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Portal HQ is not trying to be a ballroom. It is a high-craft, production-ready room on Hillsborough Street with full-wall projection, concert sound, warm guest flow, and <strong className="text-[var(--color-ink)]">free on-site parking</strong>.
            </p>
            <div className="grid max-w-2xl grid-cols-2 gap-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-panel)]/70 sm:grid-cols-4">
              {VENUE_STATS.map((stat) => (
                <div key={stat.label} className="border-r border-[var(--color-border)] p-4 last:border-r-0 text-center">
                  <strong className="block font-mono text-2xl font-bold tracking-tight text-[var(--color-ink)]">{stat.value}</strong>
                  <span className="block mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">{stat.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild><a href="#proposal">Request a Custom Proposal</a></Button>
              <Button size="lg" variant="secondary" asChild><a href="#tour">Explore the 360° Tour</a></Button>
            </div>
          </div>

          <div className="relative z-10 lg:col-span-5 flex flex-col justify-center items-center">
            <div onMouseMove={handleMouseMove} className="photo-frame spotlight-card flex flex-col justify-center items-center w-full">
              <img src={PHOTOS.hero} alt={PHOTOS.heroAlt} className="h-full w-full object-cover" />
              <div className="absolute inset-x-4 bottom-4 rounded-sm border border-white/10 bg-black/75 p-4.5 text-white shadow-xl backdrop-blur-md flex flex-col justify-center items-center text-center">
                <strong className="block font-display text-lg tracking-tight">A Room of Rare Adaptability</strong>
                <p className="mt-1 text-xs text-white/75 leading-relaxed max-w-[280px]">5,000 square feet of high-volume industrial space, designed to shape itself to your guest experience.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="surface-band section">
          <div className="container space-y-10">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-2xl space-y-3">
                <div className="eyebrow">// SPECIFICATION RECORD // SECTION 02 // VISUAL PORTFOLIO</div>
                <h2 className="display-lg leading-tight tracking-tight">Visual States &amp; <span className="font-normal italic text-[var(--color-accent)]">Chamber Layouts.</span></h2>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  From daylight assemblies to high-energy visual production, view the spatial transformations of our Hillsborough Street showroom.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCarouselCategory(tab.id);
                      setCarouselIdx(0);
                    }}
                    className={`rounded-sm border px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                      carouselCategory === tab.id
                        ? "border-transparent bg-[var(--color-accent)] text-white shadow-md"
                        : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div onMouseMove={handleMouseMove} className="panel-card-strong spotlight-card overflow-hidden p-3 flex flex-col justify-center items-center">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-black md:aspect-[21/9] w-full">
                <img src={filteredImages[carouselIdx]?.src} alt={filteredImages[carouselIdx]?.alt} className="h-full w-full object-cover transition-all duration-500" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/72 via-black/8 to-transparent" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-4">
                  <button onClick={handlePrevImg} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/66 text-white backdrop-blur-md transition hover:bg-black/86 cursor-pointer" aria-label="Previous image">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={handleNextImg} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/66 text-white backdrop-blur-md transition hover:bg-black/86 cursor-pointer" aria-label="Next image">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-3xl text-white flex flex-col justify-center items-center text-center">
                  <div className="mb-3 inline-flex rounded-sm border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.18em] backdrop-blur-md">
                    {carouselIdx + 1} / {filteredImages.length} • {filteredImages[carouselIdx]?.category}
                  </div>
                  <h3 className="font-display text-3xl font-black tracking-tight">{filteredImages[carouselIdx]?.alt}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/78">{filteredImages[carouselIdx]?.description}</p>
                </div>
              </div>
            </div>

            <div className="grid auto-rows-[170px] gap-4 md:grid-cols-4 md:auto-rows-[210px]">
              {BENTO_PHOTOS.map((photo) => (
                <img key={photo.src} src={photo.src} alt={photo.alt} className={`h-full w-full rounded-sm border border-[var(--color-border)] object-cover shadow-md ${photo.className}`} />
              ))}
            </div>
          </div>
        </section>

        <section id="tour" className="section container">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <div className="space-y-4">
              <div className="eyebrow">// SPATIAL TELEMETRY // SECTION 03 // 360° WALKTHROUGH</div>
              <h2 className="display-lg leading-tight tracking-tight">Interactive <span className="font-normal italic text-[var(--color-accent)]">Spatial Telemetry.</span></h2>
              <p className="text-sm leading-relaxed text-[var(--color-muted)] font-sans">
                Navigate the main gallery floor, concert stage, and reception entry in interactive 360° space.
              </p>
              <Button variant="secondary" asChild><a href="https://theportalhq.com/walkthrough-tour-assets/index.html?tour_root=walkthrough-tour-assets&hide_cta=1&scene=6a062176ebf5884479702b73" target="_blank" rel="noreferrer">Open full-window tour <ArrowUpRight className="h-4 w-4" /></a></Button>
            </div>
            <div onMouseMove={handleMouseMove} className="panel-card-strong spotlight-card overflow-hidden p-3 flex flex-col justify-center items-center">
              <iframe
                src="https://theportalhq.com/walkthrough-tour-assets/index.html?tour_root=walkthrough-tour-assets&hide_cta=1&scene=6a062176ebf5884479702b73"
                title="The Portal HQ 360 Walkthrough Tour"
                allow="fullscreen; xr-spatial-tracking"
                loading="lazy"
                className="h-[min(68vh,650px)] w-full rounded-sm border-0 bg-black"
              />
              <div className="flex flex-col items-center justify-center gap-3 p-4 text-xs text-[var(--color-muted)] text-center w-full">
                <span className="flex items-center justify-center gap-2"><Info className="h-4 w-4 text-[var(--color-accent)]" />Drag, zoom, and use floor arrows to move through the room.</span>
                <a href="#proposal" className="font-bold text-[var(--color-accent)] hover:underline">Book a tour after exploring</a>
              </div>
            </div>
          </div>
        </section>

        <AccessParkingSection />

        <section id="event-styles" className="surface-band section">
          <div className="container space-y-10">
            <div className="max-w-3xl space-y-3">
              <div className="eyebrow">// EXPERIENCE ARCHITECTURE // SECTION 04 // INTERIOR CONFIGURATIONS</div>
              <h2 className="display-lg leading-tight tracking-tight">Purpose-Built <span className="font-normal italic text-[var(--color-accent)]">Chambers.</span></h2>
              <p className="text-base leading-relaxed text-[var(--color-muted)]">
                Explore our core architectural configurations, each tailored to specific guest flows, capacities, and technical demands.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {EVENT_TYPES.map((event) => {
                const EventIcon = event.icon;
                return (
                  <Link key={event.id} href={event.href} onMouseMove={handleMouseMove} className="panel-card group spotlight-card overflow-hidden p-0 flex flex-col justify-between items-center text-center cursor-pointer">
                    <img src={event.photo} alt={event.alt} className="h-52 w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    <div className="space-y-5 p-7 flex flex-col justify-center items-center text-center w-full min-h-[220px]">
                      <div className="flex items-center justify-center">
                        <span className="eyebrow flex items-center gap-1.5"><EventIcon className="h-3.5 w-3.5 text-[var(--color-accent)] animate-pulse shrink-0" />{event.eyebrow}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center gap-2">
                        <h3 className="font-display text-3xl font-black tracking-tight text-[var(--color-ink)]">{event.title}</h3>
                        <p className="text-sm leading-relaxed text-[var(--color-muted)] max-w-[24ch]">{event.summary}</p>
                      </div>
                      <div className="flex items-center justify-center mt-3">
                        <ArrowRight className="h-5 w-5 text-[var(--color-accent)] transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="specs" className="section container">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <div className="space-y-8 lg:col-span-7">
              <div className="space-y-3">
                <div className="eyebrow">// ESTIMATOR SCHEMATICS // SECTION 05 // AV PRODUCTION CONFIGURATOR</div>
                <h2 className="display-lg leading-tight tracking-tight">Interactive <span className="font-normal italic text-[var(--color-accent)]">Production Configurator.</span></h2>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  Specify the precise spatial and technical requirements for your event. Select categories below to construct your custom room brief.
                </p>
              </div>

              {/* Minimal geometric tabs inspired by Two Twelve wayfinding */}
              <div className="flex flex-wrap gap-1.5 border-b border-[var(--color-border)] pb-6 w-full justify-center md:justify-start">
                {[
                  { id: "audio", label: "Sound & Acoustics" },
                  { id: "lighting", label: "Lights & Laser Projection" },
                  { id: "facilities", label: "Chamber Operations" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveConfigTab(tab.id)}
                    className={`rounded-sm px-4 py-2 text-[9px] font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                      activeConfigTab === tab.id
                        ? "border-transparent bg-[var(--color-accent)] text-white shadow-md"
                        : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/45 hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 w-full">
                {(() => {
                  const group =
                    activeConfigTab === "audio"
                      ? { title: "Audio & Acoustics", items: TECH_EQUIPMENT.audio, note: "sound system" }
                      : activeConfigTab === "lighting"
                      ? { title: "Projection & Lights", items: TECH_EQUIPMENT.lighting, note: "visual production" }
                      : { title: "Venue Flow", items: TECH_EQUIPMENT.facilities, note: "guest operations" };

                  return (
                    <div onMouseMove={handleMouseMove} className="panel-card spotlight-card p-6 flex flex-col justify-center items-center text-center w-full">
                      <h3 className="font-display text-xl font-bold tracking-tight text-[var(--color-ink)]">{group.title}</h3>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 w-full">
                        {group.items.slice(0, 6).map((eq) => (
                          <button
                            key={eq.name}
                            onClick={() => toggleSpec(eq.name)}
                            className={`rounded-sm border p-3.5 text-center text-xs transition-all flex flex-col items-center justify-center cursor-pointer ${
                              selectedSpecs[eq.name]
                                ? "border-[var(--color-accent)]/45 bg-[var(--color-accent)]/10 text-[var(--color-ink)]"
                                : "border-[var(--color-border)] bg-[var(--color-panel-strong)]/38 text-[var(--color-muted)] hover:border-[var(--color-accent)]/35 hover:text-[var(--color-ink)]"
                            }`}
                          >
                            <span className="flex flex-col items-center justify-center gap-2">
                              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-sm border ${selectedSpecs[eq.name] ? "border-transparent bg-[var(--color-accent)] text-white" : "border-[var(--color-border-strong)]"}`}>
                                {selectedSpecs[eq.name] && <Check className="h-3 w-3" />}
                              </span>
                              <span>
                                <strong className="block text-[var(--color-ink)]">{eq.name}</strong>
                                <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-[var(--color-muted)]">Qty {eq.qty} • {group.note}</span>
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <aside className="lg:col-span-5 w-full flex flex-col items-center justify-center">
              <div onMouseMove={handleMouseMove} className="panel-card-strong spotlight-card sticky top-28 space-y-6 p-6.5 flex flex-col justify-center items-center text-center w-full max-w-[420px]">
                <div className="flex flex-col items-center justify-center border-b border-[var(--color-border)] pb-5 w-full">
                  <h3 className="font-display text-2xl font-black tracking-tight text-[var(--color-ink)]">Your Room Brief</h3>
                  <p className="mt-1.5 text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)]">Proposal checklist</p>
                  <span className="mt-4 rounded-sm border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/8 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent)]">{activeSpecs.length} active items</span>
                </div>
                <div className="space-y-3.5 text-sm w-full flex flex-col items-center min-h-[120px] justify-center">
                  {activeSpecs.length === 0 ? (
                    <div className="py-8 px-4 flex flex-col justify-center items-center text-center space-y-2.5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-muted)] opacity-55">[ NO PRODUCTION ITEMS ACTIVE ]</span>
                      <p className="text-[11px] leading-normal text-[var(--color-muted)] max-w-[200px]">
                        Tap production items on the left to customize your room brief and AV layout.
                      </p>
                    </div>
                  ) : (
                    activeSpecs.map((spec) => (
                      <div key={spec} className="flex items-center justify-between gap-4 w-full max-w-[280px] border-b border-[var(--color-border)] pb-2.5 last:border-b-0 last:pb-0">
                        <span className="flex items-center gap-2.5 text-[var(--color-ink)] text-xs text-left">
                          <CheckCircle className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                          {spec}
                        </span>
                        <button onClick={() => toggleSpec(spec)} className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent)] hover:underline shrink-0 cursor-pointer">
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-3 border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-muted)] w-full flex flex-col items-center font-mono">
                  <div className="flex justify-between gap-3 w-full max-w-[280px]"><span>Scoping Model</span><strong className="text-[var(--color-accent)] font-bold">Consultative</strong></div>
                  <div className="flex justify-between gap-3 w-full max-w-[280px]"><span>Production Design</span><strong className="text-[var(--color-signal)] font-bold">Bespoke</strong></div>
                  <div className="flex justify-between gap-3 w-full max-w-[280px]"><span>On-Site Parking</span><strong className="text-[var(--color-signal)] font-bold">Complimentary</strong></div>
                </div>
                <Button size="lg" className="w-full" asChild><a href="#proposal">Apply to Proposal</a></Button>
              </div>
            </aside>
          </div>
        </section>

        <section id="reviews" className="surface-band section">
          <div className="container space-y-10">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <div className="eyebrow justify-center">// PUBLIC RECORD // SECTION 06 // CLIENT REVIEWS & AUDITS</div>
              <h2 className="display-lg leading-tight tracking-tight">Selected <span className="font-normal italic text-[var(--color-accent)]">Client Audits.</span></h2>
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">Read firsthand accounts of events produced and hosted at our Hillsborough Street location.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {REVIEWS.map((rev, index) => (
                <div key={rev.author} onMouseMove={handleMouseMove} className={`panel-card spotlight-card p-8.5 flex flex-col justify-center items-center text-center ${index === 1 ? "lg:col-span-2" : ""}`}>
                  <div className="mb-4.5 flex justify-center gap-1">{[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[var(--color-accent)] text-[var(--color-accent)]" />)}</div>
                  <p className="text-sm leading-relaxed text-[var(--color-ink)] max-w-md">“{rev.text}”</p>
                  <div className="mt-8.5 border-t border-[var(--color-border)] pt-5.5 w-full flex flex-col items-center justify-center">
                    <strong className="block font-display text-lg tracking-tight text-[var(--color-ink)]">{rev.author}</strong>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--color-muted)] mt-1">{rev.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="visit" className="section container">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-5 lg:col-span-5 flex flex-col justify-center items-center text-center">
              <div className="eyebrow flex items-center justify-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--color-accent)] animate-pulse" /> // PHYSICAL WAYFINDING // SECTION 07 // VENUE LOCATION</div>
              <h2 className="display-lg leading-tight tracking-tight">Seamless <span className="font-normal italic text-[var(--color-accent)]">Arrival &amp; Transit.</span></h2>
              <p className="text-base leading-relaxed text-[var(--color-muted)] max-w-md font-sans">
                Located centrally on Hillsborough Street, with accessible arrival paths, load-in support, and 150+ free on-site parking spaces.
              </p>
              <div className="panel-card inline-block p-5 text-sm leading-relaxed text-[var(--color-muted)] flex flex-col justify-center items-center text-center">
                <strong className="block text-[var(--color-ink)]">The Portal HQ</strong>
                {CONTACT.addressLine}<br />{CONTACT.city}<br />
                <a className="mt-3 inline-flex font-bold text-[var(--color-accent)] hover:underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="panel-card-strong overflow-hidden p-3 flex flex-col justify-center items-center">
                <iframe
                  title="Map to The Portal HQ"
                  src="https://www.google.com/maps?q=3801%20Hillsborough%20St%20%23113%2C%20Raleigh%2C%20NC%2027607&output=embed"
                  loading="lazy"
                  className="h-[420px] w-full rounded-[var(--radius-md)] border-0 bg-white"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="proposal" className="surface-band section">
          <div className="container max-w-4xl">
            <div onMouseMove={handleMouseMove} className="panel-card-strong spotlight-card space-y-8 p-6 md:p-10 flex flex-col justify-center items-center">
              <div className="mx-auto max-w-2xl space-y-3 text-center">
                <div className="eyebrow justify-center">// BOOKINGS & PROPOSALS // SECTION 08 // INQUIRY DIRECTIVE</div>
                <h2 className="display-lg leading-tight tracking-tight">Initiate your <span className="font-normal italic text-[var(--color-accent)]">Custom Proposal.</span></h2>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  Complete the structural brief below. Our team will review your specifications, capacity, and timing to construct a tailored production proposal.
                </p>
              </div>

              {/* Minimal geometric steps inspired by Two Twelve wayfinding */}
              <div className="flex items-center justify-center gap-3 w-full max-w-xs border-b border-[var(--color-border)] pb-4">
                <span className={`font-mono text-[9px] uppercase tracking-[0.16em] transition-colors duration-300 ${formStep === 1 ? "text-[var(--color-accent)] font-bold" : "text-[var(--color-muted)]"}`}>
                  01 // Contact
                </span>
                <span className="h-px w-6 bg-[var(--color-border)]" />
                <span className={`font-mono text-[9px] uppercase tracking-[0.16em] transition-colors duration-300 ${formStep === 2 ? "text-[var(--color-accent)] font-bold" : "text-[var(--color-muted)]"}`}>
                  02 // Logistics
                </span>
              </div>

              {formSubmitted && (
                <div className="rounded-sm border border-[var(--color-signal)]/28 bg-[var(--color-signal)]/10 p-5 text-center text-sm text-[var(--color-muted)] w-full">
                  <CheckCircle className="mx-auto mb-3 h-6 w-6 text-[var(--color-signal)] animate-pulse" />
                  Your email draft should be open. If your browser blocked it, email <a className="font-bold text-[var(--color-accent)]" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> with the same details.
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6 text-sm w-full">
                {formStep === 1 && (
                  <div className="space-y-6 animate-fade-in-up w-full flex flex-col items-center">
                    <div className="grid gap-6 sm:grid-cols-2 w-full text-left">
                      <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">
                        Full Name
                        <input required name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter your name" className="input-field" />
                      </label>
                      <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">
                        Email Address
                        <input required type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="you@domain.com" className="input-field" />
                      </label>
                    </div>
                    <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full text-left">
                      Phone Number
                      <input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Optional contact phone" className="input-field" />
                    </label>
                    <Button
                      type="button"
                      size="lg"
                      className="w-full mt-4"
                      disabled={!formData.name || !formData.email}
                      onClick={() => setFormStep(2)}
                    >
                      Continue to Event Logistics
                    </Button>
                  </div>
                )}

                {formStep === 2 && (
                  <div className="space-y-6 animate-fade-in-up w-full flex flex-col items-center">
                    <div className="grid gap-6 sm:grid-cols-2 w-full text-left">
                      <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">
                        Event Category
                        <select name="eventType" value={formData.eventType} onChange={handleFormChange} className="input-field bg-transparent py-1 border-b border-[var(--color-border-strong)] outline-none">
                          {EVENT_TYPES.map((event) => <option key={event.id} value={event.id} className="bg-[var(--color-panel)] text-[var(--color-ink)]">{event.shortTitle}</option>)}
                          <option value="custom" className="bg-[var(--color-panel)] text-[var(--color-ink)]">Custom</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full">
                        Guest Count
                        <select name="guestCount" value={formData.guestCount} onChange={handleFormChange} className="input-field bg-transparent py-1 border-b border-[var(--color-border-strong)] outline-none">
                          <option value="Under 50" className="bg-[var(--color-panel)] text-[var(--color-ink)]">Under 50</option>
                          <option value="50-100" className="bg-[var(--color-panel)] text-[var(--color-ink)]">50–100</option>
                          <option value="100-200" className="bg-[var(--color-panel)] text-[var(--color-ink)]">100–200</option>
                          <option value="Flexible / TBD" className="bg-[var(--color-panel)] text-[var(--color-ink)]">Flexible / TBD</option>
                        </select>
                      </label>
                    </div>
                    <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full text-left">
                      Target Date
                      <input type="date" name="date" value={formData.date} onChange={handleFormChange} className="input-field" />
                    </label>
                    <label className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)] w-full text-left">
                      Layout Goals and AV Needs
                      <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows={3} placeholder="Tell Jake what the event needs to feel like: stage, projection, micro-keynotes, flow, etc." className="input-field resize-y" />
                    </label>
                    <div className="rounded-sm border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/8 p-4 text-xs leading-relaxed text-[var(--color-muted)] text-center w-full flex items-center justify-center gap-2">
                      <Info className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
                      Your email will include <strong className="text-[var(--color-ink)]">{activeSpecs.length} selected configuration items</strong> from the room brief above.
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        className="w-full"
                        onClick={() => setFormStep(1)}
                      >
                        Back to Contact Info
                      </Button>
                      <Button type="submit" size="lg" className="w-full">
                        Open Proposal Email to Jake
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        <section id="faq" className="section container max-w-3xl">
          <div className="space-y-8">
            <div className="space-y-3 text-center">
              <div className="eyebrow justify-center">// TECHNICAL DOCUMENTATION // SECTION 09 // VENUE MANUAL</div>
              <h2 className="display-lg leading-tight tracking-tight">Frequently asked <span className="font-normal italic text-[var(--color-accent)]">venue details.</span></h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div key={faq.q} className="border-b border-[var(--color-border)] pb-3">
                  <button onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)} className="flex w-full items-center justify-between gap-5 py-4 text-left font-display text-lg font-bold text-[var(--color-ink)] hover:text-[var(--color-accent)]">
                    {faq.q}<span className="text-2xl text-[var(--color-accent)]">{openFaqIdx === idx ? "−" : "+"}</span>
                  </button>
                  {openFaqIdx === idx && <p className="pb-4 text-sm leading-relaxed text-[var(--color-muted)]">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PortalFooter />
    </div>
  );
}
