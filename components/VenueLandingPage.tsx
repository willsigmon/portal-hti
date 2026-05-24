import Link from "next/link";
import { ArrowRight, Check, MapPin, Star } from "lucide-react";
import { AccessParkingSection } from "@/components/AccessParkingSection";
import { Button } from "@/components/Button";
import { PortalNav } from "@/components/PortalNav";
import { PortalFooter } from "@/components/PortalFooter";
import { Starfield } from "@/components/Starfield";
import { CONTACT, EVENT_TYPES, FEATURE_CARDS, PHOTOS, PLAN_STEPS, REVIEWS } from "@/lib/portal-content";

type EventType = (typeof EVENT_TYPES)[number];

export function VenueLandingPage({ eventType }: { eventType: EventType }) {
  const Icon = eventType.icon;
  const related = EVENT_TYPES.filter((item) => item.id !== eventType.id);

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white grain">
      <Starfield opacity={0.38} />
      <PortalNav />

      <main>
        <section className="container grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:items-center">
          <div className="space-y-7 lg:col-span-7">
            <div className="eyebrow"><Icon className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0 animate-pulse" /> // {eventType.eyebrow.toUpperCase()} CONFIGURATION</div>
            <h1 className="display-xl max-w-[12ch] leading-[1.08] tracking-tight">{eventType.seoTitle.replace(" in Raleigh, NC", "")}</h1>
            <p className="max-w-2xl border-l-2 border-[var(--color-accent)]/30 pl-5 font-display text-2xl font-medium italic leading-relaxed text-[var(--color-muted)]">
              {eventType.summary}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild><Link href="/portal-hq#proposal">Request Custom Proposal</Link></Button>
              <Button size="lg" variant="secondary" asChild><Link href="/portal-hq#tour">Explore 360° Tour</Link></Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="photo-frame spotlight-card">
              <img src={eventType.photo} alt={eventType.alt} className="h-full w-full object-cover" />
              <div className="absolute inset-x-4 bottom-4 rounded-sm border border-white/10 bg-black/75 p-4.5 text-sm text-white backdrop-blur-md">
                <strong className="block font-display text-lg tracking-tight">Adaptable Space Layout</strong>
                <span className="text-white/76 text-xs mt-1 block">This chamber configuration is built to adapt dynamically to your visual and structural requirements.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-band section-tight">
          <div className="container grid gap-6 lg:grid-cols-3">
            {eventType.inclusions.map((item) => (
              <div key={item} className="panel-card spotlight-card p-7.5 flex flex-col justify-center items-center text-center min-h-[140px]">
                <Check className="mb-4 h-4 w-4 text-[var(--color-accent)] animate-pulse" />
                <p className="text-sm font-semibold leading-relaxed text-[var(--color-ink)] max-w-[20ch]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <AccessParkingSection compact />

        <section className="section container">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 lg:col-span-5">
              <div className="eyebrow">// SERVICE SEQUENCE // THE PROCESS</div>
              <h2 className="display-lg leading-tight tracking-tight">Bespoke <span className="font-normal italic text-[var(--color-accent)]">Scoping Pipeline.</span></h2>
              <p className="text-base leading-relaxed text-[var(--color-muted)]">
                We avoid rigid, pre-packaged event plans. Instead, we work with you to scope visual production, layouts, staff, and guest movement.
              </p>
            </div>
            <div className="grid gap-4 lg:col-span-7">
              {PLAN_STEPS.map((step, index) => (
                <div key={step.title} className="panel-card flex flex-col items-center justify-center text-center p-7.5 gap-3.5">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-accent)]">Step 0{index + 1}</div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <h3 className="font-display text-2xl font-bold text-[var(--color-ink)]">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--color-muted)] max-w-md">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-band section">
          <div className="container space-y-10">
            <div className="max-w-3xl space-y-3">
              <div className="eyebrow">// SPATIAL ARCHIVE // VISUAL PROOF</div>
              <h2 className="display-lg leading-tight tracking-tight">Gallery of <span className="font-normal italic text-[var(--color-accent)]">Chamber Variations.</span></h2>
            </div>
            <div className="grid auto-rows-[220px] gap-4 md:grid-cols-4">
              {[eventType.photo, PHOTOS.entry, PHOTOS.stage, PHOTOS.dining, PHOTOS.exterior].map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={`${eventType.shortTitle} venue proof ${index + 1}`}
                  className={`h-full w-full rounded-sm border border-[var(--color-border)] object-cover ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section container">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURE_CARDS.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <div key={feature.title} className="panel-card spotlight-card p-8 flex flex-col justify-center items-center text-center min-h-[220px]">
                  <FeatureIcon className="mb-5 h-5 w-5 text-[var(--color-accent)]" />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <h3 className="font-display text-2xl font-bold text-[var(--color-ink)]">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--color-muted)] max-w-[22ch]">{feature.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="surface-band section-tight">
          <div className="container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <div className="eyebrow"><Star className="h-3.5 w-3.5 text-[var(--color-accent)] shrink-0 animate-pulse" /> // AUDIT JOURNAL // CLIENT ADVISORY</div>
              <blockquote className="font-display text-3xl font-semibold leading-tight tracking-tight text-[var(--color-ink)] md:text-4xl">
                “{REVIEWS[1].text}”
              </blockquote>
              <p className="text-sm font-semibold text-[var(--color-muted)]">— {REVIEWS[1].author}, {REVIEWS[1].role}</p>
            </div>
            <div className="panel-card p-7 flex flex-col justify-center items-center text-center">
              <div className="flex flex-col items-center justify-center gap-3 text-sm text-[var(--color-muted)]">
                <MapPin className="h-5 w-5 shrink-0 text-[var(--color-accent)] animate-pulse" />
                <div>
                  <strong className="block text-[var(--color-ink)]">The Portal HQ</strong>
                  {CONTACT.addressLine}<br />{CONTACT.city}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild><Link href="/portal-hq#proposal">Request Proposal</Link></Button>
                <Button variant="secondary" asChild><a href={CONTACT.googleMaps} target="_blank" rel="noreferrer">Directions</a></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="section container">
          <div className="space-y-7">
            <div className="eyebrow">// SPATIAL VARIATIONS // CHAMBER ALTERNATIVES</div>
            <div className="grid gap-5 md:grid-cols-2">
              {related.map((item) => (
                <Link key={item.href} href={item.href} className="panel-card group flex flex-col justify-center items-center text-center gap-4 p-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">{item.eyebrow}</p>
                    <h3 className="mt-2 font-display text-2xl font-bold">{item.title}</h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--color-accent)] transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PortalFooter />
    </div>
  );
}
