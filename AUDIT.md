# WSADA Hard-Contract Audit — `sip-and-sync` branch

**Audit target:** `app/sip-and-sync/page.tsx` (1,306 lines) + supporting components & tokens
**Mode:** Read-only source inspection. Dev server not exercised; no screenshots.
**Date:** 2026-05-25
**Auditor:** WSADA (Will Sigmon Autonomous Design Agent)

---

## 1. Summary

### Verdict
**WSADA-PASS WITH P1 FIXES REQUIRED.** The page clears the anti-AI-slop bar comfortably and the brand voice is specific, not template. However, it ships at least one WCAG 2.2 AA **contrast failure** (orange accent on dark bg used for body-size text), one **missing accessible name** (modal close × button), and a cluster of **inline literals / inline `<style>` blocks** that should be promoted to `globals.css` before this is treated as a production token system.

### Top 3 critical findings (P0 — blocker)
1. **Modal close `×` button has no accessible name** (`page.tsx:1250-1255`). Screen reader users get "button" only. WCAG 4.1.2 + 2.2 fail.
2. **Hero `<h1>` line-height bug** — inline `style={{ lineHeight: 1.5 }}` at `page.tsx:244` collides with the `display-xl` class line-height of 0.84. The 1.5 is way too tall for a clamp(3.45rem, 10vw, 8.75rem) display heading; the Sip/&/Sync stacking layout assumes tight leading. Visual layout almost certainly diverges from intent on wide screens.
3. **Orange accent body text on `--color-band` background fails AA at body size** — accent (~L 0.70) on band (~L 0.13) is roughly 3.5:1. Used for "Live Progress", section eyebrows, the small "Add to Calendar / Open Maps / Secure Passes" footer labels — all body-size, all currently failing 4.5:1.

### Top 3 quick wins
1. Add `aria-label="Close"` (or visible label) to the modal × button — one line.
2. Strip the inline `style={{ lineHeight: 1.5 }}` on the hero `<h1>` and let `display-xl` win.
3. Promote the two inline `<style>{`...`}</style>` blocks (`page.tsx:199`, `page.tsx:1006`) into `globals.css` — both define keyframes that belong with the rest of the animation system.

---

## 2. Contrast Matrix

Approximate ratios computed from OKLCH lightness (L) using `(L1 + 0.05) / (L2 + 0.05)` as a stand-in for WCAG relative luminance. This is an APCA-style approximation — directional, not pixel-precise. Anything within ~10% of a threshold gets flagged regardless.

| FG token | FG L | BG token | BG L | Approx ratio | AA normal (≥4.5) | AA large (≥3) | Notes |
|---|---|---|---|---|---|---|---|
| `--color-ink` (0.96) | 0.96 | `--color-bg` (0.10) | 0.10 | **6.73** | PASS | PASS | Hero body copy — clean. |
| `--color-ink` (0.96) | 0.96 | `--color-band` (0.13) | 0.13 | **5.61** | PASS | PASS | Bento cards & coordinator cards. |
| `--color-ink` (0.96) | 0.96 | `--color-surface` (0.16) | 0.16 | **4.81** | PASS | PASS | Stat blocks (5,000 sqft, etc.). Margin is thin. |
| `--color-ink` (0.96) | 0.96 | `--color-panel` (0.18) | 0.18 | **4.43** | **FAIL** | PASS | Pledge/ticket form container and PledgeForm large headings — *borderline*. Display sizes pass at large; small ink text inside the panel is at risk. |
| `--color-muted` (0.75) | 0.75 | `--color-bg` (0.10) | 0.10 | **5.33** | PASS | PASS | Hero deck copy. |
| `--color-muted` (0.75) | 0.75 | `--color-band` (0.13) | 0.13 | **4.44** | **FAIL (−1.3%)** | PASS | Bento card body paragraphs use this. Effectively WCAG fail at body size. |
| `--color-muted` (0.75) | 0.75 | `--color-surface` (0.16) | 0.16 | **3.81** | **FAIL** | PASS | "Spaces on site", "Flexible creative hub" sublabels in stat blocks. |
| `--color-muted` (0.75) | 0.75 | `--color-panel` (0.18) | 0.18 | **3.48** | **FAIL** | PASS | Form labels (mono uppercase) inside the panel cards. **Worst muted pair in use.** |
| `--color-accent` (0.70) | 0.70 | `--color-bg` (0.10) | 0.10 | **5.00** | PASS | PASS | Hero "Sync" wordmark — passes (it's display-size anyway). |
| `--color-accent` (0.70) | 0.70 | `--color-band` (0.13) | 0.13 | **4.17** | **FAIL** | PASS | Section eyebrows ("Why we're gathering", "Reserve Admission Passes", "Drive Metrics", "Get in Touch"), bento "Visit hubzonetech.org →" links, coordinator email links, "Add to Calendar" footer labels. **Pervasive.** |
| `--color-accent` (0.70) | 0.70 | `--color-surface` (0.16) | 0.16 | **3.57** | **FAIL** | PASS | "Live Progress" eyebrow inside the pledge tracker card. |
| `--color-accent` (0.70) | 0.70 | `--color-panel` (0.18) | 0.18 | **3.26** | **FAIL** | PASS | The "Interactive 360°" pill (`page.tsx:691`), "Invoice Breakdown" eyebrow inside PledgeForm. **Worst accent pair in use.** |
| `--color-accent` (0.70) | 0.70 | white (1.00) | 1.00 | **0.71** (inverted to 1/x = 1.40) | n/a | n/a | Not used as text — only as background under white. Compute below. |
| white (1.00) | 1.00 | `--color-accent` (0.70) | 0.70 | **1.40** | **FAIL** | **FAIL** | **The CTA button.** `bg-[var(--color-accent)] text-white` (Button.tsx primary, "See in 3D!", "Spread the Word" CTAs, floating Active Pass pill). At L 0.70 vs L 1.00, contrast ratio is ~1.4:1 — well below the 3:1 needed for UI controls. **This is the highest-traffic visual element on the page and it does not meet AA.** |
| `--color-gold` (0.85) | 0.85 | `--color-bg` (0.10) | 0.10 | **6.00** | PASS | PASS | "Sip" wordmark — fine. |
| `--color-signal` (0.64) | 0.64 | `--color-bg` (0.10) | 0.10 | **4.60** | PASS (thin) | PASS | "Remaining" counter & success banners. |
| `--color-signal` (0.64) | 0.64 | `--color-band` (0.13) | 0.13 | **3.84** | **FAIL** | PASS | "Local preview" pill on the pledge tracker (`page.tsx:868`). |
| white on `--color-bg-dark` (0.06) | 1.00 | 0.06 | | **8.96** | PASS | PASS | "Copy Event URL" button on Spread the Word — fine. |
| `text-white/85` on `--color-accent` 92% black overlay | ~0.85 | ~0.45 | | ~1.8 | **FAIL** | **FAIL** | Spread the Word body paragraph (`page.tsx:1094`). 85%-white over a dark-orange/black gradient is at risk depending on stop. |

### Contrast verdict
- Headline / hero scale: **pass everywhere.**
- Body-size `--color-muted` and `--color-accent` on `band`/`surface`/`panel`: **systemic AA fail at small text sizes.** This is the single biggest a11y debt on the page.
- The **white-on-accent CTA** is the highest-stakes failure because (a) it's the primary action, and (b) every page has it.

**Recommended remediation:** Either darken the accent for text-on-band use (target L ~0.62 for accent-as-text, e.g. `--color-accent-text: oklch(0.62 0.22 58)`), or lighten the accent button background while darkening the text (e.g. dark-ink on accent). The current orange is gorgeous as a hero accent but is being asked to do too much.

---

## 3. Accessibility Surface Inventory

Legend: ✅ pass · ⚠ partial · ❌ fail.

| Element | Loc | Accessible name | Focus-visible | Touch ≥44px | Keyboard reachable | Notes |
|---|---|---|---|---|---|---|
| Portal logo `<img>` | 209 | ✅ alt="Portal HQ" | n/a (not interactive) | n/a | n/a | Decorative + branding; alt is appropriate. |
| HTILogo `<img>` (HTILogo.tsx) | 211 | ✅ alt="HUBZone Technology Initiative" | n/a | n/a | n/a | Good. |
| Nav anchors (4) | 215-218 | ✅ text | ⚠ relies on default browser ring (outline-color set globally to accent, but `nav-tab` uses `rounded-full` w/o explicit `:focus-visible`) | ❌ padding `py-1.5 px-3.5` = ~28×30px — **under 44×44 and arguably under 24×24 once font + line-height stripped**. P1. | ✅ | Anchor tags, standard tab order. |
| "Active Pass" pill | 223-230 | ✅ text "Active Pass" | ⚠ no explicit `:focus-visible` styles | ⚠ ~30px tall (py-1.5) | ✅ | |
| "Get Tickets" button (primary) | 231-233 | ✅ text | ⚠ Button component uses `cva` but no `focus-visible:ring` declared (Button.tsx). Relies on browser default. P1. | ✅ h-11 = 44px | ✅ | |
| Hero `<h1>` Sip & Sync wordmark | 242-252 | n/a (not interactive) | n/a | n/a | n/a | But: the `-` ligature uses `&` HTML entity correctly; line-height inline override conflicts with class (see P0). |
| Carousel pager dots | 305-313 | ✅ aria-label={`Show photo ${idx+1}`} + aria-current | ⚠ no `:focus-visible` style; the only difference between active/inactive is width + bg, which is a state diff (good for `aria-current`) but no keyboard-focus indicator. | ❌ h-1.5 = 6px tall, w-1.5 to w-6 = 6-24px wide. **Way under 24×24 floor.** Even with WCAG 2.2 24px minimum exception, these fail. P1. | ✅ | |
| Carousel `<region>` | 284-286 | ✅ role="region" aria-label | n/a | n/a | n/a | Good. |
| "See in 3D!" anchor | 321-337 | ✅ text "See in 3D!" | ⚠ no explicit focus state (relies on outline-color global) | ✅ py-4 px-9 ≥ 44px | ✅ | Decorative SVG correctly `aria-hidden`. |
| Quick-info cards When/Where/Admission (3 anchors) | 344-462 | ✅ contains heading text | ⚠ on hover translates -2px; no focus-visible analog. P2. | ✅ min-h-[340px] | ✅ | Decorative SVGs all `aria-hidden`. |
| Bento card "Visit hubzonetech.org →" | 523-530 | ✅ text | ⚠ no focus-visible | ✅ | ✅ | |
| Bento card "Visit theportalhq.com →" | 574-581 | ✅ text | ⚠ same | ✅ | ✅ | |
| Tour waypoint buttons (3) | 730-751 | ✅ text content | ⚠ active state uses bg tint; no explicit focus-visible | ✅ py-4 px-5 | ✅ | |
| "Open full tour" anchor | 697-704 | ✅ text | ⚠ no focus-visible | ✅ min-h-11 | ✅ | |
| `<iframe>` virtual tour | 710-722 | ✅ title="Sip & Sync Portal HQ Virtual Tour" | n/a | n/a | n/a | Good. |
| `<iframe>` map | 919-928 | ✅ title + aria-label | n/a | n/a | n/a | Redundant `aria-label` when `title` is present is harmless but noisy. P3. |
| PledgeForm qty − / + buttons | 413-432 | ❌ **buttons contain only "−" and "+" glyphs, no aria-label.** Screen reader announces "minus button"/"plus button" only because of unicode parsing; with text-only content this is ambiguous. P1. | ⚠ no focus-visible | ⚠ h-9 w-9 = 36×36, under 44 and right at 24×24 (passes WCAG 2.2 24px floor but tight) | ✅ | |
| Donation preset chips (4) | 454-468 | ✅ text "$25"/"$50"/etc. | ⚠ active uses bg-accent; no `aria-pressed`. **Toggle group should announce pressed state.** P1. | ✅ py-2 | ✅ | |
| Donation range slider | 473-481 | ❌ no `<label>` wrapping it, no `aria-label`. The visible "Donation Slider" caption (line 484) is sibling text, not associated. P1. | n/a | ✅ | ✅ | min/max/step are set — good. |
| Donation number input | 487-493 | ⚠ has no `<label>` association. The `$` prefix is a `<span>` sibling. **Add `aria-label="Donation amount in dollars"`.** P1. | ✅ default | ✅ | ✅ | |
| Guest Name / Email inputs | 514-533 | ✅ wrapped in `<label>` with visible text. | ✅ input-field has `:focus` border-bottom-color change. | ✅ | ✅ | Good pattern — persistent labels above inputs. |
| Laptop quantity/brand/name/email/phone/notes inputs | 654-748 | ✅ all label-wrapped. | ✅ | ✅ | ✅ | |
| Condition `<select>` | 679-690 | ✅ label-wrapped. | ✅ | ✅ | ✅ | Good. |
| "Pledge Device Now" submit | 753-755 | ✅ text | ⚠ no focus-visible | ✅ Button size=lg = 50px | ✅ | |
| "Register & Get Ticket" submit | 578-580 | ✅ text | ⚠ same | ✅ | ✅ | |
| Copy Event URL button | 1101-1107 | ✅ text + Share2 icon | ⚠ no focus-visible | ✅ py-3.5 | ✅ | |
| Download Flyer anchor | 1108-1115 | ✅ text | ⚠ same | ✅ | ✅ | Has download attr — good. |
| Coordinator email links (3) | 1140-1145, 1169-1174, 1196-1201 | ✅ contains email address as visible text | ⚠ underline-on-hover only; no focus-visible diff | ✅ | ✅ | |
| Floating Active Pass pill | 1232-1239 | ✅ text "Active Ticket for {name}" | ⚠ no focus-visible | ✅ py-3 px-5 | ✅ | |
| Modal close × button | **1250-1255** | ❌ **NO accessible name.** `&times;` glyph only, no aria-label. **WCAG 4.1.2 fail. P0.** | ⚠ no focus-visible | ⚠ no explicit dimensions — defaults to text size. Likely under 24×24. P1. | ✅ keyboard focusable | First focusable inside modal — also needs **focus trap** + `Escape` to close + `aria-modal="true"` + `role="dialog"` on the modal container. Currently none of these are present. P1. |
| Modal "Proceed to Entrance" button | 1294-1296 | ✅ text | ⚠ no focus-visible | ✅ Button size=lg | ✅ | |
| All decorative SVG icons | various | ✅ all `aria-hidden="true"` applied consistently | n/a | n/a | n/a | Pattern is good across the file. |
| Live region for toast | Toast.tsx:28-40 | ❌ Toast has no `role="status"` or `aria-live="polite"`. Screen reader users will miss "Event link copied", "Live laptop progress drive updated", etc. P1. | n/a | n/a | n/a | |

### Other a11y findings
- **Heading hierarchy:** H1 (hero) → H2 (each section: Collaboration, Venue, Tickets, Pledge Tracker, Connect) → H3 (bento card titles, "Close the Digital Divide", "Explore Before You Arrive") → H4 (Spread the Word, coordinator names, PledgeForm step headings) → H5 (Secure Ticket Payment Gateway, Ticket Activated). **Sequential and clean.** ✅
- **Landmarks:** `<nav>` ✅ at 206, `<section>` ✅ for all major blocks, `<footer>` ✅ at 1209. **`<main>` is missing** — the entire page content sits inside a `<div>` at 198 with no `<main>` wrapper. P1.
- **`lang="en"`** set on `<html>` in layout.tsx:70. ✅
- **`prefers-reduced-motion`:** Honored in globals.css for aurora, ken burns, wordmark animation, pledge tracker, mega-wave; honored in page.tsx:130 for carousel auto-rotate. ✅ One miss: the "Spread the Word" `.mega-wave` rule has its own reduced-motion guard inside the inline `<style>` at 1015-1017 — works but should live in globals.css.
- **200% zoom:** Most layout is fluid (`clamp`, `max-w`, grid). One risk: `display-xl` already at `clamp(2.7rem,12vw,3.2rem)` at the 480px breakpoint with `whitespace-nowrap` on the "Sip&Sync" inline-flex container (`sip-sync-logo` class includes `white-space: nowrap`). At 200% zoom on a 360px-physical viewport, the wordmark may overflow. P2 — needs device check.
- **Form inputs have persistent labels** (not placeholder-only). ✅ Good.
- **All meaningful `<img>` have alt text** (verified). ✅
- **Smart punctuation:** mixed — `&amp;` HTML entity used in JSX (correct), real em-dash `—` in copy at lines 259, 376, 504, 555, etc. (good), but ASCII hyphen used in `'Old Laptops. New Opportunities.'` quote marks at line 255 (using `"`) and the `'` in `we'll` (line 973) etc. These are TypeScript string ASCII apostrophes — they render as curly via browser. Acceptable. The em-dashes are real. ✅

---

## 4. Anti-AI-Slop 10-Point Checklist

| # | Check | Verdict | Evidence |
|---|---|---|---|
| 1 | Headline vague AI-template? ("Build / Ship / Create X in seconds") | **PASS** | `page.tsx:247-252` Sip & Sync wordmark + `:254-256` "Old Laptops. New Opportunities." + `:258-260` specific Raleigh framing. Brand-specific, not template. |
| 2 | Fake dashboard / chart as hero decoration? | **PASS** | Hero is a real venue photo carousel (`page.tsx:287-296`) of actual Portal HQ rooms with Ken Burns animation. Not a fake Stripe-clone dashboard. |
| 3 | Gradient blobs in hero without brand justification? | **PASS** | The aurora background (`globals.css:68-102`) is brand-justified — Portal HQ "deep midnight navy" canvas, animated, tied to a stated brand North Star at the top of globals.css. Not the default purple/indigo AI blob. |
| 4 | Three equal-weight cards with generic icons + lorem? | **PARTIAL PASS** | The When/Where/Admission grid (`page.tsx:342-463`) is a 3-up, but: (a) each card is full-bleed with a different venue photo backgrounded behind a gradient, (b) icons are custom hand-drawn SVG inline (not lucide), (c) cards link to real destinations (Google Calendar template, Google Maps, #tickets anchor). The density and per-card asymmetry of the venue photo prevents it reading as the generic AI 3-up. Not a slop violation. |
| 5 | Purple/blue glow effect applied everywhere? | **PASS** | The accent glow is *orange* (`--color-accent` oklch 0.70 0.22 58), and the spotlight cursor follow uses the same orange. The "spread the word" panel uses an orange→black gradient. Aurora is cool navy but is the *background*, not a glow on every card. Restraint is real. |
| 6 | Same button style for primary + secondary? | **PASS** | Primary = solid orange with shadow halo (Button.tsx:11). Secondary = outline only (Button.tsx:12). Ghost variant also present. Distinct visual weights. The "See in 3D!" anchor is a third bespoke style (large pill with shimmer sweep, line 321). The "Spread the Word" CTAs use a fourth bespoke pair (white pill + outlined pill on dark gradient, lines 1101-1115). **Density variation is *too* generous in places — see Token Hardening §5.** |
| 7 | Generic AI illustrations / stock avatars? | **PASS** | Real venue photography (`/venue/venue-*.jpg`), real HTI/Portal brand logos. The `/heartfelt_laptop.png` at line 609 is presumably a real photo of a student (alt confirms intent). No Midjourney/stock. |
| 8 | Brand-specific copy? | **PASS** | Copy names specific people (Will Sigmon, David Galindo, Jake Berlin), specific addresses (3801 Hillsborough St, Suite 113), specific spec (DoD 5220.22-M wipe, 5,000 sq ft, 12 Gobo lights, 150+ parking, $5 admission), specific dates (June 11, 2026, 6-9PM), real partner names (Portal HQ, HUBZone Technology Initiative). Could NOT be any company. |
| 9 | Real component states (hover/focus/active/disabled/error/loading)? | **PARTIAL FAIL** | Hover states: extensive ✅. Active state: Button has `active:scale-[0.985]` ✅. **Focus-visible: missing across nav-tab, Button, anchors.** Disabled: Button has `disabled:opacity-60` ✅. **Error: PledgeForm has zero error UI** — required fields rely on browser-default validation popup only. **Loading: ticket QR fetch shows no loading state.** P1. |
| 10 | Density variation across sections, not all evenly-spaced cards? | **PASS** | Hero is 7/5 asymmetric. Collaboration bento is 2-col + a wide 12-col "Mission" panel (7+5 inner split). Venue Spotlight is 5/6 split with an asymmetric photo grid (2x small + 1 wide). Pledge tracker is 5/7. Spread the Word is 3/6/3. Coordinators is 3-col but distinct from the bento above. **Density is genuinely varied.** ✅ |

**Anti-slop score: 9.5 / 10 PASS.** The single half-deduction is item #9 — focus-visible states are systematically missing, which is both a slop tell *and* an a11y fail.

---

## 5. Token Hardening — Inline Literals to Extract

### Inline `<style>{`...`}</style>` blocks in JSX (P1 — move to globals.css)
- `page.tsx:199-204` — `@keyframes seal-spin` (rotation for the tax-receipt medallion). Belongs in globals.css next to `@keyframes spin-slow` (which already exists at 468-475 and does the exact same thing, just 80s vs 45s — **consolidate**).
- `page.tsx:1006-1029` — `@keyframes mega-wave-ring`, `.mega-wave`, `@keyframes spread-grain`, `.spread-grain-layer`. ~24 lines of CSS inline in a TSX component. Move to globals.css.

### Inline RGBA / hex literals that should be tokens
| File:line | Value | Suggested token |
|---|---|---|
| page.tsx:687 | `shadow-[0_20px_60px_rgba(0,0,0,0.35),...]` | `--shadow-card-deep` |
| page.tsx:720 | `background: "#000"` (iframe fallback) | `var(--color-bg-dark)` |
| page.tsx:832 | `shadow-[0_0_50px_rgba(0,0,0,0.25)]` | `--shadow-panel-glow` |
| page.tsx:895 | `shadow-[0_0_12px_rgba(245,132,32,0.5)]` | `0 0 12px color-mix(in oklch, var(--color-accent) 50%, transparent)` (already imitating accent — promote to a real token expression) |
| page.tsx:982 | `shadow-[0_0_50px_rgba(0,0,0,0.25)]` | duplicate of :832 — `--shadow-panel-glow` |
| page.tsx:1031 | `shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)]` | `--shadow-marquee` |
| page.tsx:1073 | `drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]` | `--shadow-icon-glow` |
| page.tsx:1092 | `drop-shadow-[0_2px_0_rgba(255,255,255,0.35)]` | one-off — fine inline if commented |
| Button.tsx:11 | `shadow-orange-500/10` (Tailwind palette literal — orange-500) | Replace with accent-mix; you've otherwise banned the default Tailwind palette. P1. |
| Button.tsx:11 | `hover:shadow-[0_0_20px_color-mix(in_oklch,var(--color-accent)_40%,transparent)]` | OK — already token-based. |
| page.tsx:462 (and 350,392,432 — quick-info card `linear-gradient(...)`+`url(...)` inline `style` prop) | inline `style` repeats 3x with only the image URL differing | Extract to `.quick-info-card { background-image: linear-gradient(...) }` + per-card modifier. P2. |

### Inline `oklch(...)` literals
**None found in page.tsx.** All `oklch()` usage goes through `color-mix(in oklch, var(--color-*), ...)` — clean.

### Pixel values that should use spacing tokens
- Hero `<h1>` `style={{ fontSize: "clamp(3.45rem, 10vw, 8.75rem)", lineHeight: 1.5 }}` (page.tsx:244) — duplicates `display-xl` clamp and overrides line-height incorrectly. **Drop the inline.** P0.
- `style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)" }}` on Spread the Word headline (page.tsx:1090) — should be a `display-md` utility added to globals.css.
- `style={{ marginTop: "-0.7em" }}` on "Social Hour" (page.tsx:251) — magic negative margin; fine but document why.
- `style={{ height: "clamp(360px, 62vh, 680px)" }}` on tour iframe (page.tsx:718) — acceptable bespoke.

### Repeated bespoke `shadow-[...]` declarations (3+ uses → token)
Pattern `shadow-[0_0_50px_rgba(0,0,0,0.25)]` appears at lines 832 and 982 (2x — borderline). Pattern `shadow-[0_0_18px_color-mix(in_oklch,var(--color-accent)_45%,transparent)]` appears 3x inside PledgeForm.tsx (lines 394, 440, 503 — the step number badges). **Promote to `--shadow-step-badge`** in globals.css.

---

## 6. Performance + Lint Findings

- **`<img>` instead of `next/image`:** all venue photos, logos, and the QR code use plain `<img>` (page.tsx:209, 211, 287, 547, 608, 1128, etc.). Next.js linter will warn. Migrating to `next/image` would give automatic responsive srcset + lazy loading + LQIP. Big win for a hero-heavy event page. P1.
- **Hero carousel preload:** `loading={idx === 0 ? "eager" : "lazy"}` (page.tsx:293) — ✅ first image eager, rest lazy. Correct.
- **Hero carousel `key`** at line 289 includes `${heroIdx}` in every photo's key — this **forces a full unmount/remount of every `<img>` on every rotation tick (every 1.5s)**, which defeats the browser cache for already-loaded photos and re-triggers the Ken Burns animation on the wrong elements. **The `key` should be `photo.src` only**, not `${photo.src}-${...}-${heroIdx}`. P1 — perf + visual bug.
- **Carousel interval = 1500ms** (page.tsx:133). That's *fast* for a 5-photo carousel with a 1.6s Ken Burns animation. The Ken Burns will be cut off before completing. Consider 4500-6000ms. P2.
- **Cormorant Garamond loaded with 5 weights × 2 styles = 10 font files** (layout.tsx:6-12). Skim of usage: the page uses `font-display` mostly at `font-bold` / `font-extrabold` / `font-semibold`, occasionally italic in the pull-quote (line 254 `italic`). **Weights actually rendered:** 600, 700, 800 + one italic. **Trim to weights `["600","700","800"]` + `style:["italic"]` only on 600 if italic is only used once.** Could cut font payload by ~60%. P1.
- **IBM Plex Sans:** 5 weights × 2 styles. Similar audit — likely only 400, 500, 600, 700 used. P2.
- **Space Mono:** 400, 700 only — fine.
- **Inline `<style>` blocks** (page.tsx:199, 1006) inject CSS *per render*. With `"use client"`, React will re-render but the `<style>` tag content is static so it's not catastrophic — but it bypasses CSS extraction and prevents the styles from being deduped. P1.
- **`localStorage` reads in render-time paths** — `PledgeForm.tsx:39-53` reads localStorage inside a `useEffect` ✅. `page.tsx:81-125` same ✅. Good.
- **No console.log in committed code** — verified clean. ✅
- **`scroll-behavior: smooth` global** (globals.css:61) — interacts with `prefers-reduced-motion` rule at globals.css:441-448 which sets `scroll-behavior: auto !important`. Good. ✅
- **Smart quotes / em-dashes:** real em-dashes (`—`) throughout (lines 259, 504, 555, 619, 647 etc.). Real ellipsis (`…`) — not seen; could be added where appropriate. ASCII single-quotes used inside JS strings (e.g. `we'll`, line 973) — these render as ASCII straight quotes in the DOM. Browser does NOT auto-curl them. **Minor typographic miss.** P2 — promote to real `'` / `'` or use `&rsquo;`.

---

## 7. Prioritized Fix List

### P0 — Blocker (fix before delivery)
1. **page.tsx:1250-1255** — Add `aria-label="Close"` to modal × button. Add `role="dialog"` `aria-modal="true"` `aria-labelledby` to modal container (line 1246) pointing to the `<h3>` at 1264.
2. **page.tsx:244** — Remove inline `style={{ fontSize: ..., lineHeight: 1.5 }}` on hero `<h1>`. Let `display-xl` class own the type ramp. The 1.5 leading is breaking the Sip/&/Sync stacked-layer composition.
3. **globals.css color contract** — Either (a) introduce `--color-accent-text: oklch(0.62 0.22 58)` (or similar) for accent used *as small text*, OR (b) darken `--color-accent` itself. Current 0.70 L fails AA at body sizes against every dark surface. White-on-accent CTA also fails AA at 3:1 minimum. This is the single largest a11y debt.
4. **Button.tsx (primary variant)** — White text on the current accent fails AA 3:1. Either (a) deepen accent for the button background, or (b) switch CTA text color to `var(--color-bg-dark)` so it's dark-on-bright (the Spread the Word "Copy Event URL" already does this — line 1103 — and it works). The dark-on-orange variant is the cleaner fix.

### P1 — Must-fix (ship-blockers for WSADA Hard Contract)
5. **page.tsx:289** — Fix carousel image `key` prop: use `key={photo.src}` only. Current key forces remount on every tick.
6. **page.tsx:206-235** — Wrap the page content in `<main>` after `<nav>` and before `<footer>`. Currently no `<main>` landmark.
7. **page.tsx:413-432** — Add `aria-label="Decrease ticket quantity"` / `"Increase ticket quantity"` to the qty − / + buttons in PledgeForm.
8. **PledgeForm.tsx:454-468** — Add `aria-pressed={donationPreset === preset}` to donation chip buttons; wrap the chip row in `role="group" aria-label="Donation preset amount"`.
9. **PledgeForm.tsx:473-481** — Add `aria-label="Donation amount slider"` to the range input.
10. **PledgeForm.tsx:487-493** — Add `aria-label="Donation amount in dollars"` to the dollar number input.
11. **Toast.tsx:28** — Add `role="status" aria-live="polite" aria-atomic="true"` to the toast container.
12. **Button.tsx + .nav-tab + all hover-only anchors** — Add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]` (or equivalent ring) as a baseline. Browser default outline is hidden by Tailwind preflight.
13. **page.tsx:305-313** — Carousel dots: bump to ≥24×24 hit target while keeping visual size small (use `before:` pseudo-element to expand click area, keep the visible pill at h-1.5).
14. **page.tsx:1245** — Modal needs Escape-to-close handler + initial focus moved to close button + focus trap (focus must not escape modal while open).
15. **page.tsx:199-204** — Move `seal-spin` keyframe to globals.css. Consolidate with existing `spin-slow` if practical.
16. **page.tsx:1006-1029** — Move `mega-wave` + `spread-grain` styles to globals.css.
17. **layout.tsx:6-12** — Trim Cormorant Garamond weights to actually-used set (likely 600/700/800 + one italic).
18. **page.tsx:209, 547, 608, 1128, 1155, 1157, 1184, 1215, 287-296 carousel images** — Migrate from `<img>` to `next/image` for srcset + lazy hints + LQIP.
19. **PledgeForm error states** — All required fields rely on browser-default validation. Add visible inline error messages tied to inputs via `aria-describedby` and `aria-invalid`.
20. **Button.tsx:11** — Remove `shadow-orange-500/10` (Tailwind palette literal); replace with accent-mix shadow.

### P2 — Polish
21. **page.tsx:133** — Bump carousel interval to ~4500-6000ms so Ken Burns can complete.
22. **page.tsx:868** — `--color-signal` on `--color-band` is borderline (3.84). Either bump signal lightness slightly or move it onto a darker bg.
23. **page.tsx quick-info cards** (lines 344-462) — Three near-identical 100-line blocks differing only by icon SVG + image URL + label text. Extract to a `<QuickInfoCard>` component to enforce density consistency.
24. **page.tsx:1015** — `prefers-reduced-motion` for `.mega-wave` is declared inline; once moved to globals.css, dedupe with the global reduced-motion block at lines 441-448.
25. **page.tsx 200% zoom** — Verify Sip&Sync inline-flex wordmark behavior at 360px viewport × 200% zoom. May need to break onto two lines below a threshold.
26. **Curly punctuation pass** — Promote ASCII `'` apostrophes inside JSX text to real `'` (line 973 `we'll`, line 902-906 `Be the first to pledge a laptop...`, etc.).
27. **page.tsx:927** — Redundant `title` + `aria-label` on iframe. Drop the `aria-label`.
28. **page.tsx:198** — `selection:bg-[var(--color-accent)] selection:text-white` duplicates the global `::selection` rule in globals.css:160-163. Drop.

### P3 — Nice-to-have
29. **Easter egg / 404 / console.log Konami** — Design Bible §8 calls for a moment of delight beyond the standard. None present. Skip if shipping fast.
30. **Add `<JsonLd>` event schema** (Event type with location, organizer, offers $5) — `components/JsonLd.tsx` already exists; wire it in.

---

## Verdict
**WSADA-PASS with P0/P1 remediation required.**

The page demonstrates real design literacy: specific brand voice, asymmetric layouts, custom hand-drawn SVG iconography, real photography, restrained motion that respects `prefers-reduced-motion`, deliberate token expressions via `color-mix(in oklch, ...)`, and density variation across sections. The anti-AI-slop checklist passes 9.5/10.

The blocker is the **contrast contract**: the accent orange at L 0.70 is doing too many jobs (display headline, body-size eyebrows, primary CTA background under white text) and fails WCAG 2.2 AA in the body-size and white-on-accent roles. Plus the modal a11y and the line-height inline override are quick-win blockers.

Once P0 + the focus-visible/landmark/aria-label cluster of P1s land, this is shippable and genuinely premium.
