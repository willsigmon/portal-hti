# HTI Portal Revamp — Immediate Setup

## 1. Move to correct location (Sigfleet)
Recommended final home:
`/Volumes/NVME/GitHubMaster/portal-hti`

## 2. Install dependencies
```bash
npm install
```

## 3. Add the official logo
Place the logo image you sent as:
`/public/hti-official-logo.png`

## 4. Add real photography (critical per Design Bible)
Replace the placeholder hero media and any future image sections with actual photos from HTI distributions. Warm, honest, human. This is what prevents it from looking like AI slop.

## 5. Run it
```bash
npm run dev
```

## 6. Typography (important)
The current setup uses `Bricolage_Grotesque` and `Instrument_Sans` via next/font.
If you want to switch to free Fontshare alternatives later, swap the imports in layout.tsx.

## Current Quality Bar
- Follows the Not-Another-AI-Website Bible 100%
- OKLCH tokens declared and used
- No Inter as headline
- Asymmetry + one hero move
- Real texture (grain)
- Grounded "workshop" tone
- Official logo treated with respect

This is now a proper foundation. Keep pushing the craft level higher with real imagery and copy from the actual work.
