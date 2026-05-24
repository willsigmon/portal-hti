import Link from "next/link";
import { ArrowRight, Check, MapPin, Star } from "lucide-react";
import { AccessParkingSection } from "@/components/AccessParkingSection";
import { Button } from "@/components/Button";
import { PortalNav } from "@/components/PortalNav";
import { PortalFooter } from "@/components/PortalFooter";
import { CONTACT, EVENT_TYPES, FEATURE_CARDS, PHOTOS, PLAN_STEPS, REVIEWS } from "@/lib/portal-content";

type EventType = (typeof EVENT_TYPES)[number];

export function VenueLandingPage({ eventType }: { eventType: EventType }) {
  const Icon = eventType.icon;
  const related = EVENT_TYPES.filter((item) => item.id !== eventType.id);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-white grain">
      <PortalNav />

      <main>
        <section className="container grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:items-center">
          <div className="space-y-7 lg:col-span-7">
            <div className="eyebrow"><Icon className="h-3.5 w-3.5" /> {eventType.eyebrow}</div>
            <h1 className="display-xl max-w-[10ch] uppercase tracking-[-0.055em]">{eventType.seoTitle.replace(" in Raleigh, NC", "")}</h1>
            <p className="max-w-2xl border-l-2 border-[var(--color-accent)]/50 pl-5 font-display text-2xl font-semibold leading-tight text-[var(--color-muted)]">
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
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/68 p-4 text-sm text-white backdrop-blur-md">
                <strong className="block font-display text-lg">No fixed package pressure.</strong>
                <span className="text-white/76">Use this page to scope the room, then get the right proposal for the actual event.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-band section-tight">
          <div className="container grid gap-8 lg:grid-cols-3">
            {eventType.inclusions.map((item) => (
              <div key={item} className="panel-card spotlight-card p-6">
                <Check className="mb-5 h-5 w-5 text-[var(--color-accent)]" />
                <p className="text-sm font-semibold leading-relaxed text-[var(--color-ink)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <AccessParkingSection compact />

        <section className="section container">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 lg:col-span-5">
              <div className="eyebrow">How it works</div>
              <h2 className="display-lg max-w-[10ch]">A clearer path than packages.</h2>
              <p className="text-base leading-relaxed text-[var(--color-muted)]">
                Jake wants pricing removed from the public page because the best use of Portal HQ is consultative: the room changes based on layout, production, staff, and guest flow.
              </p>
            </div>
            <div className="grid gap-5 lg:col-span-7">
              {PLAN_STEPS.map((step, index) => (
                <div key={step.title} className="panel-card grid gap-5 p-6 sm:grid-cols-[4rem_1fr]">
                  <div className="font-display text-5xl font-black text-[var(--color-accent)]/70">0{index + 1}</div>
                  <div>
                    <h3 className="font-display text-2xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-band section">
          <div className="container space-y-10">
            <div className="max-w-3xl space-y-3">
              <div className="eyebrow">Room Proof</div>
              <h2 className="display-lg">The room can shift without losing polish.</h2>
            </div>
            <div className="grid auto-rows-[220px] gap-4 md:grid-cols-4">
              {[eventType.photo, PHOTOS.entry, PHOTOS.stage, PHOTOS.dining, PHOTOS.exterior].map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={`${eventType.shortTitle} venue proof ${index + 1}`}
                  className={`h-full w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] object-cover ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section container">
          <div className="grid gap-8 md:grid-cols-3">
            {FEATURE_CARDS.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <div key={feature.title} className="panel-card spotlight-card p-7">
                  <FeatureIcon className="mb-6 h-6 w-6 text-[var(--color-accent)]" />
                  <h3 className="font-display text-2xl font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="surface-band section-tight">
          <div className="container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <div className="eyebrow"><Star className="h-3.5 w-3.5" /> Five-star social proof</div>
              <blockquote className="font-display text-3xl font-semibold leading-tight tracking-tight text-[var(--color-ink)] md:text-4xl">
                “{REVIEWS[1].text}”
              </blockquote>
              <p className="text-sm font-semibold text-[var(--color-muted)]">— {REVIEWS[1].author}, {REVIEWS[1].role}</p>
            </div>
            <div className="panel-card p-7">
              <div className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]" />
                <div>
                  <strong className="block text-[var(--color-ink)]">The Portal HQ</strong>
                  {CONTACT.addressLine}<br />{CONTACT.city}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild><Link href="/portal-hq#proposal">Request Proposal</Link></Button>
                <Button variant="secondary" asChild><a href={CONTACT.googleMaps} target="_blank" rel="noreferrer">Directions</a></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="section container">
          <div className="space-y-7">
            <div className="eyebrow">More ways to use the room</div>
            <div className="grid gap-5 md:grid-cols-2">
              {related.map((item) => (
                <Link key={item.href} href={item.href} className="panel-card group flex items-center justify-between gap-5 p-6">
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
