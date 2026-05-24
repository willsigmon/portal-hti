# HTI Portal

Canonical repo for the HTI Portal web experience, the Portal HQ companion mobile app, and the preserved legacy static site.

## Structure

- `app/`, `components/`, `lib/`, `public/` — production Next.js web app imported from `portal-hti-revamp`; `/` serves the Sip & Sync campaign, `/portal-hq` preserves the broader Portal HQ booking page, and `/corporate`, `/concerts`, `/celebrations` keep the venue landing slices.
- `mobile/` — Expo/React Native companion app imported from `portal-hti-mobile`.
- `legacy-static/` — the previous static portal site, retained for reference and rollback context.
- `docs/revamp-gobble-extract/` and `docs/revamp-gobble-zip-full/` — captured revamp research/extraction artifacts.
- `README.revamp.md` and `SETUP.revamp.md` — original revamp handoff notes.

## Web app

```bash
npm install
npm run dev
npm run build
```

## Mobile app

```bash
cd mobile
npm install
npm start
```

Root convenience scripts are also available:

```bash
npm run mobile
npm run mobile:ios
npm run mobile:android
npm run mobile:web
```

## Notes

- The Next.js app is intentionally kept at the repository root so the existing `portal-hti` deployment can stay simple.
- The mobile app keeps its own dependency lockfile under `mobile/` to avoid coupling Expo package versions to the web build.
- `legacy-static/` should be treated as archived source, not the active deployment target.
