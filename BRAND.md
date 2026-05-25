# Sip & Sync Social Hour — Brand Kit

Canonical brand documentation for the Sip & Sync Social Hour event landing page — a joint HTI × Portal HQ collaboration. Produced per the **sigdesigner** doctrine (§9 schema) and the "Not-Another-AI-Website" Design Bible.

Source of truth for tokens lives in `app/globals.css`. Source of truth for fonts lives in `app/layout.tsx`. This document mirrors what is shipped — when the code changes, update this file.

---

## 1. Identity

| Field | Value |
|---|---|
| **Project** | Sip & Sync Social Hour |
| **Partnership** | HTI (HUBZone Technology Initiative) × Portal HQ |
| **Date** | Thursday, June 11, 2026, 6:00 PM – 9:00 PM |
| **Location** | Portal HQ, 3801 Hillsborough St, Suite 113, Raleigh, NC 27607 |
| **Tagline** | "Old Laptops. New Opportunities." |
| **Admission** | $5.00 (includes craft drinks + networking) |
| **Pledge Goal** | 150 refurbished laptops (per `lib/sip-and-sync-config.ts → PLEDGE_GOAL`) |

### Coordinators

| Name | Role | Email |
|---|---|---|
| Will Sigmon | HTI — lead | wsigmon@hubzonetech.org |
| David Galindo | Coordinator | dgalindo@kurvpay.com |
| Jake Berlin | Portal HQ co-founder | jake@theportalhq.com |
| HTI Pickups | Free laptop pickup service | pickups@hubzonetech.org |

### Partner sites

- HTI — https://hubzonetech.org (501(c)(3) nonprofit)
- Portal HQ — https://theportalhq.com

---

## 2. Brand North Star

> **A warm industrial Raleigh event house turning a fun social hour into 150 refurbished laptops for NC families.**

Variant phrasing pulled from `globals.css` header: "a warm industrial Raleigh event house — production-capable, guest-friendly, and proposal-first." The Sip & Sync page narrows that to a single-night civic moment: editorial-modern night-sky on the page, brutalist Spread-the-Word break, real Portal HQ photography throughout.

---

## 3. Color Palette

All tokens are defined in OKLCH. Dark mode (default brand mood) and light mode are designed independently — light mode is **not** an inversion. Source: `app/globals.css` lines 10–86.

### Core tokens

| Name | Dark (default) | Light (`[data-theme="light"]`) | Usage |
|---|---|---|---|
| `--color-bg` | `oklch(0.10 0.045 252)` | `oklch(0.97 0.012 75)` | Page canvas — deep midnight navy / warm paper |
| `--color-bg-dark` | `oklch(0.06 0.035 252)` | `oklch(0.94 0.015 75)` | Photo wells, deep-space void / deeper paper |
| `--color-band` | `oklch(0.13 0.045 252)` | `oklch(0.95 0.013 75)` | Card body backgrounds |
| `--color-surface` | `oklch(0.16 0.05 252)` | `oklch(0.99 0.008 75)` | Lifted card surface |
| `--color-surface-dark` | `oklch(0.12 0.04 252)` | `oklch(0.93 0.015 75)` | Slightly recessed surface |
| `--color-panel` | `oklch(0.18 0.055 252)` | `oklch(0.98 0.01 75)` | Featured panel (3D tour, ticket form) |
| `--color-panel-strong` | `oklch(0.23 0.06 252)` | `oklch(0.95 0.013 75)` | Strongest lifted panel |
| `--color-ink` | `oklch(0.96 0.01 85)` | `oklch(0.22 0.025 252)` | Primary type — chalky linen / deep navy |
| `--color-muted` | `oklch(0.75 0.015 85)` | `oklch(0.45 0.018 252)` | Secondary type — limestone / grey-navy |
| `--color-accent` | `oklch(0.70 0.22 58)` ≈ **#F58420** | `oklch(0.68 0.20 58)` | **True brand vibrant orange — same orange as the H in the HTI logo.** Single accent across both modes. |
| `--color-violet` | `oklch(0.78 0.11 75)` | `oklch(0.48 0.10 75)` | Warm copper/bronze (replaces old purple — never indigo) |
| `--color-gold` | `oklch(0.85 0.11 88)` | `oklch(0.62 0.13 88)` | "Sip" wordmark + premium detail |
| `--color-signal` | `oklch(0.64 0.06 150)` | `oklch(0.50 0.10 150)` | "Local preview" status text (muted green, not Slack-green) |
| `--color-border` | `color-mix(in oklch, var(--color-ink) 8%, transparent)` | `color-mix(... 14% ...)` | Hairline dividers |
| `--color-border-strong` | `color-mix(... 14% ...)` | `color-mix(... 24% ...)` | Visible rules, double-rules |

### Aurora wash (dark mode only — hidden in light mode)

| Name | Value | Role |
|---|---|---|
| `--color-aurora-1` | `oklch(0.55 0.13 200)` | Cyan-teal wash (top-right of page) |
| `--color-aurora-2` | `oklch(0.45 0.18 290)` | Indigo-violet wash (bottom-left + top-left) |
| `--color-aurora-3` | `oklch(0.62 0.14 220)` | Soft cyan highlight (right-mid) |

The aurora is applied as four `radial-gradient` ellipses on `body` plus a drifting `body::after` layer (see §9 Motion). Sparse hand-placed "stars" are radial pinpoints at fixed coordinates — **not a noise field**.

### Palette strategy

- **60/30/10** — 60% midnight navy backgrounds, 30% panel surface gradations, 10% orange accent + gold/copper highlights.
- **Backgrounds never use pure #000 or pure #fff.** Dark mode is OKLCH navy at L≈0.10; light mode is OKLCH warm paper at L≈0.97.
- One unexpected accent: warm orange (58° hue) is the only chromatic punch. Aurora cyans/indigos are atmospheric, not interactive.

---

## 4. Typography

All fonts loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variables.

| Role | Font | Weights | CSS variable | Notes |
|---|---|---|---|---|
| Display | **Cormorant Garamond** | 300, 400, 500, 600, 700 (normal + italic) | `--font-display` | Editorial serif. Used for all `h1`–`h4`, `.display-xl`, `.display-lg`, the Sip & Sync wordmark, and the italic pull-quote tagline. |
| Body | **IBM Plex Sans** | 300, 400, 500, 600, 700 (normal + italic) | `--font-body` | Paragraphs, buttons, nav, form labels. Not Inter, not Geist. |
| Mono | **Space Mono** | 400, 700 | `--font-mono` | Eyebrows, numerals, "01 / 05" carousel pip, input fields, ticket codes. |

### Type scale (modular, fluid)

```css
.display-xl { font-size: clamp(4rem, 10vw, 8.75rem); line-height: 0.84; letter-spacing: -0.065em; font-weight: 800; }
.display-lg { font-size: clamp(2.7rem, 6vw, 5.25rem); line-height: 0.9;  letter-spacing: -0.055em; font-weight: 800; }
```

The hero wordmark overrides the class with `style={{ fontSize: "clamp(3.45rem, 10vw, 8.75rem)" }}` and `letter-spacing: -0.045em` to seat the layered Sip/&/Sync/Social-Hour stack.

### Typographic conventions

- `font-feature-settings: "ss01", "cv11", "tnum"` applied globally to `h1`–`h4` and `.display`
- Tabular numerals (`tabular-nums` Tailwind class, `tnum` OpenType) on every counter, ticket code, carousel index, time, and price
- Headlines tighten tracking to **−0.04em to −0.065em**
- All-caps eyebrows loosen to **0.18em–0.22em** in Space Mono
- Smart quotes and em-dashes in copy (e.g. "Old Laptops. New Opportunities.")
- Real italic Cormorant for the tagline pull-quote — not synthetic obliques

---

## 5. Logo & Favicon Paths

| Asset | Path | Notes |
|---|---|---|
| HTI logo (vector) | `<HTILogo />` from `components/HTILogo.tsx` | Preferred — scales cleanly, theme-aware |
| HTI logo (cropped raster) | `/public/hti-cropped.png` | Fallback / OG use |
| HTI logo (full raster) | `/public/hti-full-logo.png` | Full lockup |
| HTI logo (official) | `/public/hti-official-logo.png` | Official board-approved version |
| Portal HQ logo | `/public/portal-logo.png` | Used in nav + bento card + as current favicon |
| Favicon (current) | `/public/portal-logo.png` | Declared in `app/layout.tsx → metadata.icons.icon` |
| Sip & Sync flyer | `/public/sip_and_sync_flyer.png` | Downloadable promotional flyer |

### Follow-ups (P2)

- Ship a dedicated multi-size favicon set (`/favicon.ico`, `/icon.png` 32/192/512, `/apple-icon.png`) for the Sip & Sync sub-route. Today's reliance on a single PNG is functional but not crisp on Retina home-screen adds.
- Consider a co-branded HTI × Portal HQ favicon for the `/sip-and-sync` route specifically.

---

## 6. Photography Manifest

Photography direction: **Real Portal HQ interior photography — warm brick, neon, candle lighting, exposed industrial details. No stock imagery, no AI-rendered interiors.** All images live under `/public/venue/` (see `manifest.json` for the full inventory of 27 venue shots).

### Used on the Sip & Sync page

| Section | Asset | Role |
|---|---|---|
| Hero carousel | `/venue/venue-wood-entry.jpg` | Lobby with bar, gallery wall, neon Portal sign |
| Hero carousel | `/venue/venue-stage-lighting.jpg` | Stage under full production lighting |
| Hero carousel | `/venue/venue-mural-stage.jpg` | Stage with painted mural backdrop |
| Hero carousel | `/venue/venue-projection-wall.jpg` | Projection wall during a showcase |
| Hero carousel | `/venue/venue-lobby-wide.jpg` | Wide lobby with brick and warm lighting |
| Venue grid | `/venue/venue-daylight-floor.jpg` | Daylight gallery floor |
| Venue grid | `/venue/venue-evening-table.jpg` | Evening reception setup |
| Venue grid | `/venue/venue-stage-lighting.jpg` | Concert-grade lighting (wide span) |
| Quick-info card — When | `/venue/venue-evening-table.jpg` | Card backdrop |
| Quick-info card — Where | `/venue/venue-wood-entry.jpg` | Card backdrop |
| Quick-info card — Admission | `/venue/venue-bar-detail.jpg` | Card backdrop |
| Mission imagery | `/heartfelt_laptop.png` | NC student using a refurbished Chromebook |
| Downloadable flyer | `/sip_and_sync_flyer.png` | Print + share asset |
| OG / Twitter card | `/venue/venue-daylight-floor.jpg` | 1600×1067, declared in `app/layout.tsx` |

### Reserve assets (available, not yet used on Sip & Sync)

`venue-affair-card.jpg`, `venue-candle-room.jpg`, `venue-candle-tables.jpg`, `venue-custom-package.jpg`, `venue-dining-celebration.jpg`, `venue-executive-card.jpg`, `venue-exterior-patio.jpg`, `venue-food-spread.jpg`, `venue-hero-dark-dining.jpg`, `venue-live-performance.jpg`, `venue-lounge-corner.jpg`, `venue-lounge-view.jpg`, `venue-main-hall-daylight.jpg`, `venue-party-lights.jpg`, `venue-production-stage.jpg`, `venue-showcase-card.jpg`, `venue-social-card.jpg`, `venue-stage-wide.jpg`, `venue-table-detail.jpg`.

### Filter conventions applied in markup

- Hero carousel: `filter: contrast(1.04) saturate(0.98)` + Ken Burns scale 1.02 → 1.10
- Venue grid: `filter: contrast(1.02)` with 18s pan/zoom loop (`.kenburns-photo`)
- Mission image: `filter: contrast(1.02) saturate(0.96)`
- Card backdrops: gradient overlay `linear-gradient(180deg, color-mix(in oklch, var(--color-band) 92%, transparent) 0%, ... 82% ... 100%)` then `background-size: cover`

---

## 7. OG / Social Meta

Defined in `app/layout.tsx → metadata` (currently inherits the Portal HQ booking-site OG, not Sip-&-Sync-specific).

| Field | Value |
|---|---|
| `metadataBase` | `https://theportalhq.com` |
| Default title | `The Portal HQ — Raleigh Event Venue` |
| Description | "Book The Portal HQ, a flexible 5,000 sq ft Raleigh event venue..." |
| OG image | `/venue/venue-daylight-floor.jpg` (1600 × 1067) |
| OG type | `website` |
| Twitter card | `summary_large_image` |
| Twitter image | `/venue/venue-daylight-floor.jpg` |
| Robots | `index: true, follow: true` |

### Follow-ups (P2)

- Ship a dedicated Sip & Sync OG image (1200 × 630): editorial layout with the Sip & Sync wordmark, June 11 date, "150 laptops" target, and a Portal HQ interior photo. Route to **bannerbear** (templated) or **higgsfield** (cinematic still) per the skill registry.
- Add route-level metadata override in `app/sip-and-sync/page.tsx` (or a route-level `layout.tsx`) so the social card reflects the event, not the venue.

---

## 8. Voice & Tone

**Voice:** warm, direct, civically minded, slightly editorial. Plain English. No corporate hedging. Specific over abstract.

### Do

- "Come join us in Raleigh for a fun social hour."
- "Bring an old laptop to help NC families get online."
- "Old Laptops. New Opportunities."
- "Reserve Spot" / "Donate Laptop" / "Pledge a Laptop"
- "Help us reach our collaborative event goal of **150 pledged laptops**."
- Use real proper nouns: **Raleigh, NC, HTI, Portal HQ, North Carolina, Hillsborough Street**.
- Use specific numbers: **150 laptops, $5 admission, 5,000 sq ft, 150+ parking spaces, 12 Gobo lights**.
- Cite the standard: "DoD 5220.22-M wipe" — earns trust with technical donors.
- Acknowledge the human: "a NC student" / "school-age children in North Carolina."

### Don't

- AI-template language: "Empower communities by leveraging…", "Synergize impact…"
- Generic corporate: "Solutions for the future," "Innovate, inspire, ignite."
- Passive constructions when an actor is available.
- Hedge language: "We hope you might consider possibly…"
- Crypto-bro hype: "🚀 Don't miss this once-in-a-lifetime opportunity!!!"
- Emoji in body copy (this is an editorial event site, not a Discord announcement).
- Vague geography: "the local community," "your area." Say **Raleigh** or **North Carolina**.

### Voice in numbers

The page leans on numerals heavily — **150 laptops**, **$5.00**, **5,000 sq ft**, **150+ spaces**, **12 Gobo lights**, **3 coordinators**, **3 hours (6–9 PM)**, **June 11**. Always set in `tabular-nums` so they line up vertically in tables and cards.

---

## 9. Motion Tokens

All motion uses a single spring curve and is gated by `prefers-reduced-motion: reduce`. Source: `app/globals.css`.

| Token | Value | Use |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default ease for all hover, fade, and entrance transitions |
| Spring-bounce ease | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Ampersand twist + pledge count tick (deliberate overshoot) |

### Named animations

| Animation | Duration | Loop | Notes |
|---|---|---|---|
| `auroraDrift` | 80s | `ease-in-out infinite alternate` | 5-keyframe translate3d path on the aurora `body::after` wash |
| `kenburnsCarousel` | 1.6s | `forwards` | Scale 1.02 → 1.10 with -1.2% / -0.8% drift on active hero photo |
| `kenburnsPan` | 18s | `ease-in-out infinite alternate` | Slow pan/zoom on venue grid photos. `.kenburns-photo-delayed` offsets -9s for asymmetry |
| `fadeInUp` | 0.9s | `forwards` | Hero element entrance. Staggered via `.delay-100`–`.delay-500` |
| `sipSyncSlideIn` | 0.9s @ 0.05s delay | `forwards` | "Sip" glides from the left |
| `sipSyncSyncIn` | 1.0s @ 0.35s delay | `forwards` | "Sync" sweeps in from the right at 1.04× overshoot |
| `sipSyncAmpTwist` | 1.1s @ 0.55s delay (overshoot ease) | `forwards` | "&" pivots in from -180° rotation |
| `sipSyncSocialRise` | 0.85s @ 0.75s delay | `forwards` | "Social Hour" rises to tuck beneath the layered Sync |
| `pledgeCountTick` | 0.6s (overshoot ease) | one-shot per count change | Numbers pop on update |
| `pledgeShimmer` | 3.6s | `linear infinite` | Moving highlight across the progress bar fill |
| `spin-slow` | 80s | `linear infinite` | Cosmic portal halo rotation |
| `seal-spin` | 45s | `linear infinite` | Tax-receipt circular medallion rotation |
| Hero carousel rotation | 1.5s interval (JS) | continuous, pauses on hover | Cross-fade 500ms, respects `prefers-reduced-motion` |

### Reduced-motion contract

Inside `@media (prefers-reduced-motion: reduce)`:
- All animation durations forced to `0.001ms`
- Aurora drift, Ken Burns, sip-sync wordmark entrance, pledge tick, pledge shimmer all disabled (`animation: none`)
- Carousel rotation interval is skipped in the `useEffect`
- Theme toggle transform on hover removed

---

## 10. Texture

Single global texture: a **tactile paper-grain SVG noise overlay** applied via `body::before`.

```css
body::before {
  opacity: 0.18;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,...feTurbulence baseFrequency='0.72' numOctaves='3'...");
}
```

- Dark mode: 18% opacity, soft-light blend → reads as light surface noise
- Light mode: opacity bumped to 32%, multiply blend → reads as paper fiber, not bloom

`.grain` utility class is available for component-level reuse (28% opacity), but the global body texture covers the page by default.

**Forbidden alternates:** no glassmorphism `backdrop-blur` cards over the hero, no gradient-blob backgrounds, no scan lines or glitch overlays (this is editorial-modern, not cyberpunk).

---

## 11. Component Inventory

Shipped components in `components/`:

| Component | File | Role |
|---|---|---|
| `Button` | `Button.tsx` | Primary (orange fill) + Secondary (ghost) CTA. `asChild` slot pattern. `size: default | lg`. |
| `PledgeForm` | `PledgeForm.tsx` | Dual-mode form — `mode="ticket"` (admission pass with PayPal handoff) + `mode="pledge"` (laptop count + pickup/dropoff). Writes to `localStorage` (`ss_pledges`, `ss_event_ticket`) and dispatches `pledgeSync` / `ticketSync` events. |
| `HTILogo` | `HTILogo.tsx` | Vector HTI lockup — theme-aware, scales cleanly. |
| `AmbientSpotlight` | `AmbientSpotlight.tsx` | Mouse-follow cursor light, global. |
| `ThemeToggle` | `ThemeToggle.tsx` | Light/dark switcher — writes `ss_theme` to localStorage. Default is dark; light is opt-in. |
| `Toast` | `Toast.tsx` | Lightweight notification system. Used for "Event link copied", "Live laptop progress drive updated", waypoint nav, etc. Exposes `ToastRef.show()`. |
| `PortalNav` | (in-page nav) | Sticky glassmorphic top bar with HTI + Portal lockup, anchor pills, "Active Pass" badge when ticket exists, "Get Tickets" CTA. |
| `PortalFooter` | (in-page footer) | Coordinator cards, partner links, copyright. |
| Hero carousel | (inline in `page.tsx`) | 5-photo cross-fade with Ken Burns scale, hover-pause, indicator pips, 01/05 counter. |

### Page-level architecture

- Sticky nav (z-50, `backdrop-blur-md`)
- Hero (asymmetric 7/5 grid: wordmark + tagline + CTAs on left, photo carousel + "See in 3D!" CTA on right)
- Quick-info grid (3 cards: When, Where, Admission — each with photo backdrop)
- The Collaboration (bento — HTI card, Portal card, Mission wide-span)
- Venue Spotlight + 360° walkthrough iframe + waypoint switcher
- Tickets & Donations (tax-receipt medallion + PledgeForm in ticket mode)
- Laptop Pledge Drive (Live tracker + PledgeForm in pledge mode)
- **Spread the Word** brutalist panel (full-bleed, breaks the editorial tone intentionally)
- Coordinators (3 cards)
- Footer

---

## 12. Forbidden Patterns (per Design Bible §11 / sigdesigner doctrine)

Explicit do-not-use list for this brand:

- Inter, Geist, or system-ui as a headline font (Cormorant Garamond is mandatory for display)
- Generic purple/blue gradient blob hero backgrounds — replaced by the aurora wash with sparse hand-placed stars
- Default Lucide icons at default stroke weight on the hero — all hero/info-card glyphs are custom inline SVG at `strokeWidth="1.5"`–`"2.4"`
- Cinema-trailer cosmic starfield (deprecated and removed earlier in the build — see prior commit history)
- Glassmorphism (`backdrop-blur`) cards over the hero photo
- Free / Pro / Enterprise pricing card layout — this is a $5 single-tier event, not a SaaS
- Pure `#000` or pure `#fff` backgrounds (OKLCH navy / warm paper only)
- Rounded-2xl-everything with shadow-lg on every card (radius tokens are deliberately small: `--radius-sm: 2px`, `--radius-md: 4px`, `--radius-lg: 6px`)
- "Trusted by" grayscale logo strip
- "Build/Ship/Create [X] in seconds" hero copy
- Emoji in body copy or headlines
- AI-generated venue imagery (real Portal HQ photography only)
- Cold corporate filler ("Empower," "Synergize," "Leverage")

---

## 13. Sigdesigner 5-Part Output Contract

Per `~/.grok/design-bible.md`, every design ships with the 5-part contract. This is that contract for Sip & Sync.

### 1. Brand North Star (one sentence)

> A warm industrial Raleigh event house turning a fun social hour into 150 refurbished laptops for NC families.

### 2. Two reference sites

1. **Type Wolf — PP Editorial New use cases** (https://www.typewolf.com/site-of-the-day) — editorial display-serif sites with asymmetric grids, generous leading, photography-first hero moves.
2. **Awwwards SOTD — editorial-modern dark sites** (https://www.awwwards.com/) — specifically the cohort using warm-on-dark palettes, large kinetic typography, and real-photo carousels (e.g. Local Project, Active Theory event microsites).

Both inform: layered display typography over real interior photography, single-accent restraint, premium spring motion, no AI gradients.

### 3. Design Token JSON

```json
{
  "typography": {
    "display": "Cormorant Garamond (Google Fonts via next/font)",
    "body":    "IBM Plex Sans (Google Fonts via next/font)",
    "mono":    "Space Mono (Google Fonts via next/font)",
    "scale":   "Fluid clamp(): display-xl clamp(4rem,10vw,8.75rem) lh 0.84 ls -0.065em; display-lg clamp(2.7rem,6vw,5.25rem) lh 0.9 ls -0.055em",
    "features": "ss01, cv11, tnum on h1-h4 and .display"
  },
  "color": {
    "model": "OKLCH",
    "palette_strategy": "60/30/10 — 60% midnight navy backgrounds, 30% panel gradations, 10% orange accent + gold/copper highlights. Aurora cyans/indigos are atmospheric, not interactive.",
    "tokens": {
      "bg":      "oklch(0.10 0.045 252)",
      "surface": "oklch(0.16 0.05 252)",
      "panel":   "oklch(0.18 0.055 252)",
      "ink":     "oklch(0.96 0.01 85)",
      "muted":   "oklch(0.75 0.015 85)",
      "accent":  "oklch(0.70 0.22 58)",
      "gold":    "oklch(0.85 0.11 88)",
      "violet_copper": "oklch(0.78 0.11 75)",
      "signal":  "oklch(0.64 0.06 150)",
      "aurora_1_cyan_teal":     "oklch(0.55 0.13 200)",
      "aurora_2_indigo_violet": "oklch(0.45 0.18 290)",
      "aurora_3_soft_cyan":     "oklch(0.62 0.14 220)"
    },
    "light_mode_overrides": {
      "bg":     "oklch(0.97 0.012 75) — warm paper",
      "ink":    "oklch(0.22 0.025 252) — deep navy (not pure black)",
      "muted":  "oklch(0.45 0.018 252)",
      "accent": "oklch(0.68 0.20 58) — copper-orange, drier for paper"
    }
  },
  "spacing": "8pt-derived custom scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px tokens (--spacing-4 through --spacing-96). Section padding clamp(4rem, 8vw, 8rem).",
  "radius":  "Deliberate flat — small radii only: --radius-sm 2px / --radius-md 4px / --radius-lg 6px. NO rounded-2xl-everything.",
  "motion":  "Default ease cubic-bezier(0.16, 1, 0.3, 1) (--ease-spring). Overshoot ease cubic-bezier(0.34, 1.56, 0.64, 1) for ampersand + pledge tick. Aurora drift 80s, Ken Burns 1.6s (carousel) + 18s (grid), wordmark entrance 0.9s staggered. All gated by prefers-reduced-motion.",
  "texture": "Single global SVG paper-grain at body::before. Opacity 0.18 soft-light on dark, 0.32 multiply on light."
}
```

### 4. Code

Code lives at:

- **Page:** `app/sip-and-sync/page.tsx`
- **Tokens + global CSS:** `app/globals.css`
- **Layout + fonts + OG meta:** `app/layout.tsx`
- **Config (pledge goal, PayPal URL):** `lib/sip-and-sync-config.ts`
- **Components:** `components/` (Button, PledgeForm, HTILogo, AmbientSpotlight, ThemeToggle, Toast)
- **Build history:** commits `195bc4f` → `4f9d064` (readability → animated logo → wordmark layering → hero overhaul → carousel + aurora + ticket overhaul → round-3 polish).

### 5. Why this doesn't look AI-generated

1. **Cormorant Garamond at clamp(3.45rem, 10vw, 8.75rem) for the wordmark** — not Inter, not Geist — plus a custom layered "Sync" overlapping "Social Hour" typographic move with staggered slide/twist entrance animations (Sip from left, Sync from right at 1.04× overshoot, "&" pivoting from -180°, "Social Hour" rising to tuck beneath). This is a hand-set editorial composition, not a stacked Tailwind heading.
2. **Aurora ambient drift over real Portal HQ photography** — a 5-keyframe `translate3d` over 80 seconds on three layered OKLCH gradient washes (cyan-teal / indigo-violet / soft-cyan), with sparse hand-placed star pinpoints at fixed coordinates, then a global paper-grain SVG at soft-light blend. Not the AI-default purple gradient blob, not glassmorphism, not a noise field.
3. **A brutalist full-bleed "Spread the Word" panel intentionally breaking the editorial-modern tone**, plus real Portal HQ interior photography in the hero carousel (5 photos, Ken Burns + cross-fade), the venue grid (3 photos, 18s pan loop), and the quick-info card backdrops (gradient-veiled cover images of evening tables, wood entry, and bar detail). Only this specific HTI × Portal HQ Raleigh collaboration could describe itself this way — the building, the partners, the laptops, the $5 ticket, the 150 number, the June 11 date are all real and specific.

---

## Source verification

Everything in this document was verified against live source files:

- ✅ Color tokens — `app/globals.css` lines 10–86 (dark) + lines 66–86 (light mode override)
- ✅ Fonts — `app/layout.tsx` lines 13–34 (Cormorant Garamond / IBM Plex Sans / Space Mono via `next/font/google`)
- ✅ Pledge goal — `lib/sip-and-sync-config.ts` (`PLEDGE_GOAL = 150`)
- ✅ Coordinator emails — `app/sip-and-sync/page.tsx` lines 1143, 1172, 1199 + `pickups@hubzonetech.org` line 977
- ✅ Photo paths — verified against `public/venue/` directory listing (28 files including `manifest.json`)
- ✅ OG meta — `app/layout.tsx` lines 36–67
- ✅ Motion tokens — `globals.css` lines 53, 148–168, 597–785

### Unverified / follow-ups

- **Light-mode color values** in §3 reflect the values currently in `globals.css`. If "Agent B" updates these, this document needs a sync pass.
- **Sip & Sync-specific OG meta** is not yet declared at the route level — the page inherits Portal HQ's venue-wide OG card. Listed as P2 in §7.
- **Dedicated favicon set** for the sub-route is not yet shipped. Listed as P2 in §5.
- The exact hex equivalent of `oklch(0.70 0.22 58)` is approximate (≈ `#F58420`) and should be confirmed against the HTI logo source file before going to print.
