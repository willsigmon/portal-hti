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
          {/* Cosmic Portal Swirling in the Center Background (Vibrant space black-hole vibe) */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 select-none opacity-45 transition-opacity duration-1000 md:h-[800px] md:w-[800px] lg:h-[1000px] lg:w-[1000px]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--color-accent)]/15 to-[var(--color-violet)]/25 blur-3xl animate-pulse" />
            <img 
              src="/portal_cosmic_hero.png" 
              alt="" 
              className="absolute inset-0 h-full w-full object-contain mix-blend-screen opacity-70 animate-spin-slow filter drop-shadow-[0_0_80px_rgba(250,204,21,0.3)]"
              style={{ 
                animationDuration: "100s",
                maskImage: "radial-gradient(circle, rgba(0,0,0,1) 32%, rgba(0,0,0,0) 68%)", 
                WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 32%, rgba(0,0,0,0) 68%)" 
              }}
            />
          </div>

          <div className="relative z-10 space-y-8 lg:col-span-7">
            <div className="eyebrow">Raleigh's 5,000 sq ft event house</div>
            <h1 className="display-xl max-w-[9ch] uppercase tracking-[-0.06em]">
              One Space. <span className="text-[var(--color-accent)]">Every Event.</span>
            </h1>
            <p className="max-w-[30ch] border-l-2 border-[var(--color-accent)]/50 pl-5 font-display text-2xl font-semibold leading-tight text-[var(--color-muted)] md:text-3xl">
              A transformable venue for corporate retreats, live showcases, and private celebrations.
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Portal HQ is not trying to be a ballroom. It is a high-craft, production-ready room on Hillsborough Street with full-wall projection, concert sound, warm guest flow, and <strong className="text-[var(--color-ink)]">free on-site parking</strong>.
            </p>
            <div className="grid max-w-2xl grid-cols-2 gap-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-panel)]/70 sm:grid-cols-4">
              {VENUE_STATS.map((stat) => (
                <div key={stat.label} className="border-r border-[var(--color-border)] p-4 last:border-r-0">
                  <strong className="block font-display text-2xl font-black text-[var(--color-ink)]">{stat.value}</strong>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">{stat.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild><a href="#proposal">Request a Custom Proposal</a></Button>
              <Button size="lg" variant="secondary" asChild><a href="#tour">Explore the 360° Tour</a></Button>
            </div>
          </div>

          <div className="relative z-10 lg:col-span-5">
            <div onMouseMove={handleMouseMove} className="photo-frame spotlight-card">
              <img src={PHOTOS.hero} alt={PHOTOS.heroAlt} className="h-full w-full object-cover" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/68 p-4 text-white shadow-2xl backdrop-blur-md">
                <strong className="block font-display text-xl">Lighten the room. Keep the edge.</strong>
                <p className="mt-1 text-sm text-white/76">A brighter first image, warmer palette, and no public package pricing.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="surface-band section">
          <div className="container space-y-10">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-2xl space-y-3">
                <div className="eyebrow">Real venue photos</div>
                <h2 className="display-lg">A brighter gallery, not a pricing sheet.</h2>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  Jake asked to remove packages and bring the image carousel higher. This gallery now sells the transformation first: daylight, stage energy, dinner warmth, and guest arrival.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCarouselCategory(tab.id);
                      setCarouselIdx(0);
                    }}
                    className={`rounded-full border px-4 py-2 transition-all ${
                      carouselCategory === tab.id
                        ? "border-transparent bg-[var(--color-accent)] text-white shadow-[0_12px_35px_color-mix(in_oklch,var(--color-accent)_24%,transparent)]"
                        : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div onMouseMove={handleMouseMove} className="panel-card-strong spotlight-card overflow-hidden p-3">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)] bg-black md:aspect-[21/9]">
                <img src={filteredImages[carouselIdx]?.src} alt={filteredImages[carouselIdx]?.alt} className="h-full w-full object-cover transition-all duration-500" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/72 via-black/8 to-transparent" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-4">
                  <button onClick={handlePrevImg} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/66 text-white backdrop-blur-md transition hover:bg-black/86" aria-label="Previous image">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={handleNextImg} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/66 text-white backdrop-blur-md transition hover:bg-black/86" aria-label="Next image">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute bottom-5 left-5 right-5 max-w-3xl text-white">
                  <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md">
                    {carouselIdx + 1} / {filteredImages.length} • {filteredImages[carouselIdx]?.category}
                  </div>
                  <h3 className="font-display text-3xl font-black tracking-tight">{filteredImages[carouselIdx]?.alt}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/78">{filteredImages[carouselIdx]?.description}</p>
                </div>
              </div>
            </div>

            <div className="grid auto-rows-[170px] gap-4 md:grid-cols-4 md:auto-rows-[210px]">
              {BENTO_PHOTOS.map((photo) => (
                <img key={photo.src} src={photo.src} alt={photo.alt} className={`h-full w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] object-cover shadow-lg ${photo.className}`} />
              ))}
            </div>
          </div>
        </section>

        <section id="tour" className="section container">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <div className="space-y-4">
              <div className="eyebrow">Explore before booking</div>
              <h2 className="display-lg">Move the virtual tour up.</h2>
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                The tour now sits before the sales pitch. Visitors can understand the room first, then choose whether to request a proposal.
              </p>
              <Button variant="secondary" asChild><a href="https://theportalhq.com/walkthrough-tour-assets/index.html?tour_root=walkthrough-tour-assets&hide_cta=1&scene=6a062176ebf5884479702b73" target="_blank" rel="noreferrer">Open full-window tour <ArrowUpRight className="h-4 w-4" /></a></Button>
            </div>
            <div onMouseMove={handleMouseMove} className="panel-card-strong spotlight-card overflow-hidden p-3">
              <iframe
                src="https://theportalhq.com/walkthrough-tour-assets/index.html?tour_root=walkthrough-tour-assets&hide_cta=1&scene=6a062176ebf5884479702b73"
                title="The Portal HQ 360 Walkthrough Tour"
                allow="fullscreen; xr-spatial-tracking"
                loading="lazy"
                className="h-[min(68vh,650px)] w-full rounded-[var(--radius-md)] border-0 bg-black"
              />
              <div className="flex flex-col justify-between gap-3 p-4 text-xs text-[var(--color-muted)] sm:flex-row sm:items-center">
                <span className="flex items-center gap-2"><Info className="h-4 w-4 text-[var(--color-accent)]" />Drag, zoom, and use floor arrows to move through the room.</span>
                <a href="#proposal" className="font-bold text-[var(--color-accent)] hover:underline">Book a tour after exploring</a>
              </div>
            </div>
          </div>
        </section>

        <AccessParkingSection />

        <section id="event-styles" className="surface-band section">
          <div className="container space-y-10">
            <div className="max-w-3xl space-y-3">
              <div className="eyebrow">SEO landing pages</div>
              <h2 className="display-lg">Split the story by event intent.</h2>
              <p className="text-base leading-relaxed text-[var(--color-muted)]">
                The homepage stays cohesive, while corporate, concert, and celebration pages give search visitors a more specific entry point.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {EVENT_TYPES.map((event) => {
                const EventIcon = event.icon;
                return (
                  <Link key={event.id} href={event.href} onMouseMove={handleMouseMove} className="panel-card group spotlight-card overflow-hidden p-0">
                    <img src={event.photo} alt={event.alt} className="h-52 w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    <div className="space-y-5 p-7">
                      <div className="flex items-center justify-between">
                        <span className="eyebrow"><EventIcon className="h-3.5 w-3.5" />{event.eyebrow}</span>
                        <ArrowRight className="h-5 w-5 text-[var(--color-accent)] transition group-hover:translate-x-1" />
                      </div>
                      <div>
                        <h3 className="font-display text-3xl font-black tracking-tight">{event.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{event.summary}</p>
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
                <div className="eyebrow">Custom proposal builder</div>
                <h2 className="display-lg">Choose the gear conversation.</h2>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  The public page no longer sells fixed packages. Visitors select what matters, then Jake's team follows up with a custom configuration.
                </p>
              </div>

              <div className="grid gap-5">
                {[
                  { title: "Audio & Acoustics", items: TECH_EQUIPMENT.audio, note: "sound system" },
                  { title: "Projection & Lights", items: TECH_EQUIPMENT.lighting, note: "visual production" },
                  { title: "Venue Flow", items: TECH_EQUIPMENT.facilities, note: "guest operations" },
                ].map((group) => (
                  <div key={group.title} onMouseMove={handleMouseMove} className="panel-card spotlight-card p-6">
                    <h3 className="font-display text-xl font-bold">{group.title}</h3>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {group.items.slice(0, 6).map((eq) => (
                        <button
                          key={eq.name}
                          onClick={() => toggleSpec(eq.name)}
                          className={`rounded-xl border p-3 text-left text-xs transition-all ${
                            selectedSpecs[eq.name]
                              ? "border-[var(--color-accent)]/45 bg-[var(--color-accent)]/10 text-[var(--color-ink)]"
                              : "border-[var(--color-border)] bg-[var(--color-panel-strong)]/38 text-[var(--color-muted)] hover:border-[var(--color-accent)]/35 hover:text-[var(--color-ink)]"
                          }`}
                        >
                          <span className="flex items-start gap-2.5">
                            <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${selectedSpecs[eq.name] ? "border-transparent bg-[var(--color-accent)] text-white" : "border-[var(--color-border-strong)]"}`}>
                              {selectedSpecs[eq.name] && <Check className="h-3 w-3" />}
                            </span>
                            <span>
                              <strong className="block text-[var(--color-ink)]">{eq.name}</strong>
                              <span className="mt-1 block">Qty {eq.qty} • {group.note}</span>
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div onMouseMove={handleMouseMove} className="panel-card-strong spotlight-card sticky top-28 space-y-6 p-6">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
                  <div>
                    <h3 className="font-display text-2xl font-black">Your room brief</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Proposal checklist</p>
                  </div>
                  <span className="rounded-full bg-[var(--color-accent)]/12 px-3 py-1.5 text-xs font-black text-[var(--color-accent)]">{activeSpecs.length} items</span>
                </div>
                <div className="space-y-3 text-sm">
                  {Object.keys(selectedSpecs).map((spec) => (
                    <div key={spec} className="flex items-start justify-between gap-4">
                      <span className={`flex items-start gap-2.5 ${selectedSpecs[spec] ? "text-[var(--color-ink)]" : "text-[var(--color-muted)] opacity-55 line-through"}`}>
                        <CheckCircle className={`mt-0.5 h-4 w-4 shrink-0 ${selectedSpecs[spec] ? "text-[var(--color-accent)]" : "text-[var(--color-border-strong)]"}`} />
                        {spec}
                      </span>
                      <button onClick={() => toggleSpec(spec)} className="text-xs font-bold text-[var(--color-accent)] hover:underline">
                        {selectedSpecs[spec] ? "Remove" : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-muted)]">
                  <div className="flex justify-between gap-3"><span>Public package pricing</span><strong className="text-[var(--color-accent)]">Removed</strong></div>
                  <div className="flex justify-between gap-3"><span>Custom scoping</span><strong className="text-[var(--color-signal)]">Required</strong></div>
                  <div className="flex justify-between gap-3"><span>Free parking</span><strong className="text-[var(--color-signal)]">Always included</strong></div>
                </div>
                <Button size="lg" className="w-full" asChild><a href="#proposal">Apply to Proposal</a></Button>
              </div>
            </aside>
          </div>
        </section>

        <section id="reviews" className="surface-band section">
          <div className="container space-y-10">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <div className="eyebrow justify-center">What people are saying</div>
              <h2 className="display-lg">The vibe already works.</h2>
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">The revamp should sharpen the story without losing the social proof Jake already has.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {REVIEWS.map((rev, index) => (
                <div key={rev.author} onMouseMove={handleMouseMove} className={`panel-card spotlight-card p-7 ${index === 1 ? "lg:col-span-2" : ""}`}>
                  <div className="mb-4 flex gap-1">{[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[var(--color-accent)] text-[var(--color-accent)]" />)}</div>
                  <p className="text-sm leading-relaxed text-[var(--color-ink)]">“{rev.text}”</p>
                  <div className="mt-7 border-t border-[var(--color-border)] pt-5">
                    <strong className="block font-display text-lg">{rev.author}</strong>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">{rev.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="visit" className="section container">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-5 lg:col-span-5">
              <div className="eyebrow"><MapPin className="h-3.5 w-3.5" /> Visit the venue</div>
              <h2 className="display-lg">Hillsborough Street, without the parking headache.</h2>
              <p className="text-base leading-relaxed text-[var(--color-muted)]">
                Portal HQ's free on-site parking is not a footnote. It is a conversion point for corporate planners, families, performers, caterers, and production crews.
              </p>
              <div className="panel-card inline-block p-5 text-sm leading-relaxed text-[var(--color-muted)]">
                <strong className="block text-[var(--color-ink)]">The Portal HQ</strong>
                {CONTACT.addressLine}<br />{CONTACT.city}<br />
                <a className="mt-3 inline-flex font-bold text-[var(--color-accent)] hover:underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="panel-card-strong overflow-hidden p-3">
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
            <div onMouseMove={handleMouseMove} className="panel-card-strong spotlight-card space-y-8 p-6 md:p-10">
              <div className="mx-auto max-w-2xl space-y-3 text-center">
                <div className="eyebrow justify-center">Free tour & proposal request</div>
                <h2 className="display-lg">Your event starts here.</h2>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  This form opens a pre-filled email to Jake's team with your selected room brief. No fake “sent” state and no public package pricing.
                </p>
              </div>

              {formSubmitted && (
                <div className="rounded-2xl border border-[var(--color-signal)]/28 bg-[var(--color-signal)]/10 p-5 text-center text-sm text-[var(--color-muted)]">
                  <CheckCircle className="mx-auto mb-3 h-6 w-6 text-[var(--color-signal)]" />
                  Your email draft should be open. If your browser blocked it, email <a className="font-bold text-[var(--color-accent)]" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> with the same details.
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6 text-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 font-semibold">Full name<input required name="name" value={formData.name} onChange={handleFormChange} placeholder="Your name" className="input-field" /></label>
                  <label className="space-y-2 font-semibold">Email<input required type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="you@example.com" className="input-field" /></label>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-2 font-semibold">Phone<input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Optional" className="input-field" /></label>
                  <label className="space-y-2 font-semibold">Event category<select name="eventType" value={formData.eventType} onChange={handleFormChange} className="input-field">
                    {EVENT_TYPES.map((event) => <option key={event.id} value={event.id}>{event.shortTitle}</option>)}
                    <option value="custom">Custom</option>
                  </select></label>
                  <label className="space-y-2 font-semibold">Guest count<select name="guestCount" value={formData.guestCount} onChange={handleFormChange} className="input-field">
                    <option value="Under 50">Under 50</option>
                    <option value="50-100">50–100</option>
                    <option value="100-200">100–200</option>
                    <option value="Flexible / TBD">Flexible / TBD</option>
                  </select></label>
                </div>
                <label className="block space-y-2 font-semibold">Target date<input type="date" name="date" value={formData.date} onChange={handleFormChange} className="input-field" /></label>
                <label className="block space-y-2 font-semibold">Layout goals and AV needs<textarea name="notes" value={formData.notes} onChange={handleFormChange} rows={5} placeholder="Tell Jake what the event needs to feel like: stage, dinner flow, bar, projection, microphones, photos, patio, load-in, etc." className="input-field resize-y" /></label>
                <div className="rounded-2xl border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/8 p-4 text-xs leading-relaxed text-[var(--color-muted)]">
                  <Info className="mr-2 inline h-4 w-4 text-[var(--color-accent)]" />
                  Your email will include <strong className="text-[var(--color-ink)]">{activeSpecs.length} selected configuration items</strong> from the room brief above.
                </div>
                <Button type="submit" size="lg" className="w-full">Open Proposal Email to Jake</Button>
              </form>
            </div>
          </div>
        </section>

        <section id="faq" className="section container max-w-3xl">
          <div className="space-y-8">
            <div className="space-y-3 text-center">
              <div className="eyebrow justify-center">Common Questions</div>
              <h2 className="display-lg">Enough detail to trust the next step.</h2>
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
