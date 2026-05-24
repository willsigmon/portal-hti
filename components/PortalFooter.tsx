import Link from "next/link";
import { CONTACT } from "@/lib/portal-content";

export function PortalFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-band)]/70 py-14 text-sm text-[var(--color-muted)]">
      <div className="container space-y-8">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-3">
            <img src="/portal-logo.png" alt="The Portal HQ" className="h-10 w-auto object-contain" />
            <p className="max-w-xl text-sm leading-relaxed">
              A flexible 5,000 sq ft Raleigh event venue for corporate retreats, live showcases, private celebrations, and community moments that need real production support.
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {CONTACT.addressLine} • {CONTACT.city}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-3 font-semibold text-[var(--color-ink)]">
            <Link href="/corporate" className="hover:text-[var(--color-accent)]">Corporate</Link>
            <Link href="/concerts" className="hover:text-[var(--color-accent)]">Concerts</Link>
            <Link href="/celebrations" className="hover:text-[var(--color-accent)]">Celebrations</Link>
            <Link href="/sip-and-sync" className="hover:text-[var(--color-accent)]">Sip &amp; Sync</Link>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-[var(--color-accent)]">Email Jake</a>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-[var(--color-border)] pt-7 text-xs sm:flex-row">
          <span>© {new Date().getFullYear()} The Portal HQ. Raleigh Event Venue.</span>
          <span>Custom proposal-first revamp — pricing intentionally removed.</span>
        </div>
      </div>
    </footer>
  );
}
