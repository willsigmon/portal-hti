import { Accessibility, BadgeCheck, Car, MapPin, Route } from "lucide-react";
import { Button } from "@/components/Button";
import { CONTACT } from "@/lib/portal-content";

const arrivalFacts = [
  {
    icon: Accessibility,
    stat: "100%",
    label: "Guest-minded access",
    text: "Virtually all customer-facing areas in the venue are accessible, from arrival through the main event floor.",
  },
  {
    icon: Car,
    stat: "Plenty",
    label: "On-site parking",
    text: "Parking is plentiful and free, which keeps Hillsborough Street events easy for guests, vendors, families, and teams.",
  },
  {
    icon: Route,
    stat: "Easy",
    label: "Arrival flow",
    text: "The exterior entry, patio, check-in path, and room layout are built for straightforward guest movement.",
  },
];

export function AccessParkingSection({ compact = false }: { compact?: boolean }) {
  return (
    <section id="access-parking" className={compact ? "surface-band section-tight" : "section container"}>
      <div className={compact ? "container" : undefined}>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.35fr] lg:items-stretch">
          <div className="panel-card-strong spotlight-card overflow-hidden p-7 md:p-9">
            <div className="eyebrow">
              <BadgeCheck className="h-3.5 w-3.5" /> Access & parking
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold leading-none tracking-tight text-[var(--color-ink)] md:text-5xl">
              Easy to enter. <span className="font-normal italic text-[var(--color-accent)]">Easy to park.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[var(--color-muted)]">
              Portal HQ should feel low-friction before the event even starts: accessible guest areas, clear arrival, and plentiful parking directly on-site.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <a href={CONTACT.googleMaps} target="_blank" rel="noreferrer">
                  Get directions <MapPin className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="secondary" asChild>
                <a href="#proposal">Ask about your layout</a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {arrivalFacts.map((fact) => {
              const Icon = fact.icon;
              return (
                <article key={fact.label} className="panel-card spotlight-card flex min-h-[240px] flex-col justify-between p-6">
                  <div>
                    <Icon className="h-7 w-7 text-[var(--color-accent)]" aria-hidden="true" />
                    <div className="mt-8 font-mono text-4xl font-bold leading-none tracking-tight text-[var(--color-ink)]">
                      {fact.stat}
                    </div>
                    <h3 className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                      {fact.label}
                    </h3>
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-[var(--color-muted)]">{fact.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
