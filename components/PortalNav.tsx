import Link from "next/link";
import { Button } from "@/components/Button";

const tabs = [
  { href: "/#gallery", label: "Gallery" },
  { href: "/#tour", label: "360° Tour" },
  { href: "/corporate", label: "Corporate" },
  { href: "/concerts", label: "Concerts" },
  { href: "/celebrations", label: "Celebrations" },
  { href: "/#faq", label: "FAQ" },
];

export function PortalNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[color-mix(in_oklch,var(--color-bg)_86%,transparent)] backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3" aria-label="The Portal HQ home">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/85 shadow-sm transition-transform group-hover:-rotate-2">
            <img src="/portal-logo.png" alt="" className="h-8 w-auto object-contain" />
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block font-display text-sm font-black tracking-[0.18em] text-[var(--color-ink)]">THE PORTAL</span>
            <span className="block pt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Raleigh Event Co.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]/72 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md lg:flex">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href} className="nav-tab">
              {tab.label}
            </Link>
          ))}
        </div>

        <Button size="default" variant="primary" asChild>
          <Link href="/#proposal">Request Proposal</Link>
        </Button>
      </div>
    </nav>
  );
}
