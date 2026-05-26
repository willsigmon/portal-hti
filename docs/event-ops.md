# Sip & Sync Event Operations

This repo now has an operational spine for the Sip & Sync event instead of browser-only demo state.

## What is live in code

- Public campaign page uses `/api/event/summary` for pledge/ticket telemetry.
- Ticket reservations are created through `/api/event/tickets`.
- Payment review requests are attached to a specific ticket.
- Paid QR check-in is validated through `/api/event/check-in`.
- Admin/iPad console lives at `/admin` and `/ops`.
- Laptop pledges are created through `/api/event/pledges` and managed in the admin console.
- Expo companion app uses the same API contract through `mobile/src/lib/event-api.ts`.

## Local storage

By default, server data is written to:

```bash
data/event-store.json
```

`data/` is ignored by git so QA entries do not ship.

For deployment, set:

```bash
EVENT_STORE_FILE=/path/to/durable/event-store.json
EVENT_ADMIN_KEY=long-random-admin-key
EVENT_WEBHOOK_SECRET=long-random-webhook-secret
NEXT_PUBLIC_PAYPAL_DONATE_URL=https://www.paypal.com/donate/?hosted_button_id=...
```

On Vercel/serverless, `EVENT_STORE_FILE` is not durable unless backed by mounted persistent storage. The clean production upgrade is to swap `lib/event-store.ts` for Supabase/Neon while keeping the API route contracts stable.

## Payment flow

1. Guest reserves a pass.
2. Guest pays through PayPal and includes their ticket code in the payment note.
3. Guest taps “I Sent PayPal Payment.”
4. Admin console shows `pending_review`.
5. Staff marks the pass `paid`.
6. QR code can check in successfully.

The public page no longer self-activates tickets.

## iPad and watch companion direction

- iPad MVP: `/admin`/`/ops` is the staff companion console for check-in, payment review, pledge queue, and live metrics.
- Watch MVP: the `latestActivity` feed is the notification source. Native haptic notifications can subscribe to the same event stream later without changing ticket/pledge APIs.
