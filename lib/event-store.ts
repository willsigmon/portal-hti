import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  EVENT_PLEDGE_GOAL,
  type CheckInStatus,
  type EventAuditLog,
  type EventPledge,
  type EventStoreSnapshot,
  type EventSummary,
  type EventTicket,
  type PaymentStatus,
  type PledgeStatus,
  type PublicPledge,
  type PublicTicket,
} from "./event-types";

interface EventStoreFile {
  version: 1;
  tickets: EventTicket[];
  pledges: EventPledge[];
  auditLog: EventAuditLog[];
}

type TicketInput = {
  guestName: string;
  guestEmail: string;
  qty: number;
  donation: number;
  notes?: string;
};

type PledgeInput = {
  quantity: number;
  brand?: string;
  condition: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  notes?: string;
};

const TICKET_PRICE = 5;
const STORE_PATH = process.env.EVENT_STORE_FILE || path.join(process.cwd(), "data", "event-store.json");

let memoryStore: EventStoreFile | null = null;

const nowIso = () => new Date().toISOString();

function initialStore(): EventStoreFile {
  return {
    version: 1,
    tickets: [],
    pledges: [],
    auditLog: [],
  };
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(numeric)));
}

function clampMoney(value: unknown, min = 0, max = 10000) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.min(max, Math.max(min, Math.round(numeric * 100) / 100));
}

function cleanString(value: unknown, fallback = "", max = 240) {
  const text = typeof value === "string" ? value.trim() : "";
  return (text || fallback).slice(0, max);
}

function cleanEmail(value: unknown) {
  return cleanString(value, "", 180).toLowerCase();
}

function createId(prefix: string, bytes = 4) {
  return `${prefix}-${randomBytes(bytes).toString("hex").toUpperCase()}`;
}

function createTicketCode(existing: Set<string>) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `SS-${randomBytes(3).toString("hex").toUpperCase()}`;
    if (!existing.has(code)) return code;
  }
  return createId("SS", 5);
}

function addAudit(store: EventStoreFile, event: Omit<EventAuditLog, "id" | "createdAt">) {
  store.auditLog.unshift({
    id: createId("EVT", 5),
    createdAt: nowIso(),
    ...event,
  });
  store.auditLog = store.auditLog.slice(0, 250);
}

function normalizeStore(raw: unknown): EventStoreFile {
  const maybe = raw as Partial<EventStoreFile> | null;
  if (!maybe || !Array.isArray(maybe.tickets) || !Array.isArray(maybe.pledges)) return initialStore();
  return {
    version: 1,
    tickets: maybe.tickets,
    pledges: maybe.pledges,
    auditLog: Array.isArray(maybe.auditLog) ? maybe.auditLog : [],
  };
}

async function readStore(): Promise<EventStoreFile> {
  if (memoryStore) return structuredClone(memoryStore);

  try {
    const text = await fs.readFile(STORE_PATH, "utf8");
    memoryStore = normalizeStore(JSON.parse(text));
  } catch {
    memoryStore = initialStore();
  }

  return structuredClone(memoryStore);
}

async function writeStore(store: EventStoreFile) {
  memoryStore = structuredClone(store);

  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    const tempPath = `${STORE_PATH}.${process.pid}.tmp`;
    await fs.writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`);
    await fs.rename(tempPath, STORE_PATH);
  } catch {
    // Serverless/readonly environments still keep this usable during a warm
    // runtime. A real deployment should set EVENT_STORE_FILE to durable storage
    // or replace this module with Supabase/Neon.
  }
}

export function toPublicTicket(ticket: EventTicket, includePrivate = false): PublicTicket {
  return {
    code: ticket.code,
    token: includePrivate ? ticket.token : undefined,
    guestName: ticket.guestName,
    guestEmail: includePrivate ? ticket.guestEmail : undefined,
    qty: ticket.qty,
    donation: ticket.donation,
    ticketTotal: ticket.ticketTotal,
    totalDue: ticket.totalDue,
    paymentStatus: ticket.paymentStatus,
    paymentProvider: ticket.paymentProvider,
    paymentReference: includePrivate ? ticket.paymentReference : undefined,
    paymentConfirmedAt: ticket.paymentConfirmedAt,
    checkedInAt: ticket.checkedInAt,
    checkInStatus: ticket.checkInStatus,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

export function toPublicPledge(pledge: EventPledge): PublicPledge {
  return {
    id: pledge.id,
    quantity: pledge.quantity,
    brand: pledge.brand,
    condition: pledge.condition,
    donorName: pledge.donorName,
    status: pledge.status,
    createdAt: pledge.createdAt,
    updatedAt: pledge.updatedAt,
  };
}

export function summarizeStore(store: EventStoreFile): EventSummary {
  const pledgedDevices = store.pledges
    .filter((pledge) => pledge.status !== "cancelled")
    .reduce((sum, pledge) => sum + pledge.quantity, 0);
  const receivedDevices = store.pledges
    .filter((pledge) => ["received", "wiped", "distributed"].includes(pledge.status))
    .reduce((sum, pledge) => sum + pledge.quantity, 0);
  const activeTickets = store.tickets.filter((ticket) => ticket.paymentStatus !== "void");
  const paidTickets = activeTickets.filter((ticket) => ticket.paymentStatus === "paid");

  return {
    goal: EVENT_PLEDGE_GOAL,
    pledgedDevices,
    receivedDevices,
    stillNeeded: Math.max(EVENT_PLEDGE_GOAL - pledgedDevices, 0),
    progress: Math.min(100, Math.round((pledgedDevices / EVENT_PLEDGE_GOAL) * 100)),
    ticketsReserved: activeTickets.reduce((sum, ticket) => sum + ticket.qty, 0),
    paidTickets: paidTickets.reduce((sum, ticket) => sum + ticket.qty, 0),
    checkedInGuests: activeTickets
      .filter((ticket) => ticket.checkInStatus === "checked_in")
      .reduce((sum, ticket) => sum + ticket.qty, 0),
    donationIntent: activeTickets.reduce((sum, ticket) => sum + ticket.donation, 0),
    ticketRevenueIntent: activeTickets.reduce((sum, ticket) => sum + ticket.ticketTotal, 0),
    latestActivity: store.auditLog.slice(0, 12),
  };
}

export async function getPublicSummary(): Promise<{ summary: EventSummary; pledges: PublicPledge[] }> {
  const store = await readStore();
  return {
    summary: summarizeStore(store),
    pledges: store.pledges.slice(0, 50).map(toPublicPledge),
  };
}

export async function getAdminSnapshot(): Promise<EventStoreSnapshot> {
  const store = await readStore();
  return {
    summary: summarizeStore(store),
    tickets: store.tickets.map((ticket) => toPublicTicket(ticket, true)),
    pledges: store.pledges,
  };
}

export async function createTicket(input: TicketInput) {
  const store = await readStore();
  const createdAt = nowIso();
  const qty = clampInt(input.qty, 1, 20, 1);
  const donation = clampMoney(input.donation, 0, 10000);
  const ticketTotal = qty * TICKET_PRICE;
  const ticket: EventTicket = {
    code: createTicketCode(new Set(store.tickets.map((item) => item.code))),
    token: randomBytes(12).toString("base64url"),
    guestName: cleanString(input.guestName, "Event Guest", 120),
    guestEmail: cleanEmail(input.guestEmail),
    qty,
    donation,
    ticketTotal,
    totalDue: ticketTotal + donation,
    paymentStatus: "pending",
    checkInStatus: "not_checked_in",
    notes: cleanString(input.notes, "", 500) || undefined,
    createdAt,
    updatedAt: createdAt,
  };

  store.tickets.unshift(ticket);
  addAudit(store, {
    type: "ticket_created",
    ticketCode: ticket.code,
    message: `${ticket.guestName} reserved ${ticket.qty} Sip & Sync pass${ticket.qty === 1 ? "" : "es"}.`,
  });
  await writeStore(store);
  return ticket;
}

export async function getTicket(code: string, token?: string) {
  const store = await readStore();
  const ticket = store.tickets.find((item) => item.code.toUpperCase() === code.toUpperCase());
  if (!ticket) return null;
  return {
    ticket,
    authorized: Boolean(token && token === ticket.token),
  };
}

export async function requestPaymentReview(code: string, token: string, reference?: string) {
  const store = await readStore();
  const ticket = store.tickets.find((item) => item.code.toUpperCase() === code.toUpperCase());
  if (!ticket || ticket.token !== token) return null;

  ticket.paymentStatus = ticket.paymentStatus === "paid" ? "paid" : "pending_review";
  ticket.paymentReference = cleanString(reference, ticket.paymentReference || "", 120) || undefined;
  ticket.paymentProvider = ticket.paymentProvider || "paypal";
  ticket.updatedAt = nowIso();
  addAudit(store, {
    type: "ticket_payment_review_requested",
    ticketCode: ticket.code,
    message: `${ticket.guestName} requested payment review for ${ticket.code}.`,
  });
  await writeStore(store);
  return ticket;
}

export async function adminUpdateTicket(
  code: string,
  patch: Partial<Pick<EventTicket, "paymentStatus" | "paymentProvider" | "paymentReference" | "notes" | "checkInStatus">>,
) {
  const store = await readStore();
  const ticket = store.tickets.find((item) => item.code.toUpperCase() === code.toUpperCase());
  if (!ticket) return null;

  if (patch.paymentStatus) {
    ticket.paymentStatus = patch.paymentStatus as PaymentStatus;
    if (ticket.paymentStatus === "paid" && !ticket.paymentConfirmedAt) {
      ticket.paymentConfirmedAt = nowIso();
    }
  }
  if (patch.paymentProvider) ticket.paymentProvider = patch.paymentProvider;
  if (typeof patch.paymentReference === "string") ticket.paymentReference = cleanString(patch.paymentReference, "", 120);
  if (typeof patch.notes === "string") ticket.notes = cleanString(patch.notes, "", 500);
  if (patch.checkInStatus) {
    ticket.checkInStatus = patch.checkInStatus as CheckInStatus;
    ticket.checkedInAt = patch.checkInStatus === "checked_in" ? ticket.checkedInAt || nowIso() : undefined;
  }
  ticket.updatedAt = nowIso();

  addAudit(store, {
    type: "ticket_payment_marked_paid",
    ticketCode: ticket.code,
    message:
      ticket.paymentStatus === "paid"
        ? `${ticket.code} marked paid by event operations.`
        : `${ticket.code} updated to ${ticket.paymentStatus}.`,
  });
  await writeStore(store);
  return ticket;
}

export async function checkInTicket(code: string, token?: string, force = false) {
  const store = await readStore();
  const ticket = store.tickets.find((item) => item.code.toUpperCase() === code.toUpperCase());
  if (!ticket) {
    return { ok: false, reason: "not_found" as const, ticket: null };
  }

  if (!force && ticket.token !== token) {
    addAudit(store, {
      type: "ticket_check_in_blocked",
      ticketCode: ticket.code,
      message: `Blocked check-in attempt for ${ticket.code}: invalid QR token.`,
    });
    await writeStore(store);
    return { ok: false, reason: "invalid_token" as const, ticket };
  }

  if (!force && ticket.paymentStatus !== "paid") {
    ticket.checkInStatus = "blocked";
    ticket.updatedAt = nowIso();
    addAudit(store, {
      type: "ticket_check_in_blocked",
      ticketCode: ticket.code,
      message: `Blocked check-in for ${ticket.code}: payment status is ${ticket.paymentStatus}.`,
    });
    await writeStore(store);
    return { ok: false, reason: "payment_required" as const, ticket };
  }

  ticket.checkInStatus = "checked_in";
  ticket.checkedInAt = ticket.checkedInAt || nowIso();
  ticket.updatedAt = nowIso();
  addAudit(store, {
    type: "ticket_checked_in",
    ticketCode: ticket.code,
    message: `${ticket.guestName} checked in with ${ticket.qty} pass${ticket.qty === 1 ? "" : "es"}.`,
  });
  await writeStore(store);
  return { ok: true, reason: "checked_in" as const, ticket };
}

export async function createPledge(input: PledgeInput) {
  const store = await readStore();
  const createdAt = nowIso();
  const pledge: EventPledge = {
    id: createId("PLG", 4),
    quantity: clampInt(input.quantity, 1, 500, 1),
    brand: cleanString(input.brand, "Laptop Device", 160),
    condition: cleanString(input.condition, "unspecified", 80),
    donorName: cleanString(input.donorName, "Anonymous", 120),
    donorEmail: cleanEmail(input.donorEmail),
    donorPhone: cleanString(input.donorPhone, "", 60) || undefined,
    notes: cleanString(input.notes, "", 500) || undefined,
    status: "new",
    createdAt,
    updatedAt: createdAt,
  };

  store.pledges.unshift(pledge);
  addAudit(store, {
    type: "pledge_created",
    pledgeId: pledge.id,
    message: `${pledge.donorName} pledged ${pledge.quantity} laptop${pledge.quantity === 1 ? "" : "s"}.`,
  });
  await writeStore(store);
  return pledge;
}

export async function adminUpdatePledge(id: string, patch: Partial<Pick<EventPledge, "status" | "notes" | "donorPhone">>) {
  const store = await readStore();
  const pledge = store.pledges.find((item) => item.id === id);
  if (!pledge) return null;

  if (patch.status) pledge.status = patch.status as PledgeStatus;
  if (typeof patch.notes === "string") pledge.notes = cleanString(patch.notes, "", 500);
  if (typeof patch.donorPhone === "string") pledge.donorPhone = cleanString(patch.donorPhone, "", 60) || undefined;
  pledge.updatedAt = nowIso();

  addAudit(store, {
    type: "pledge_updated",
    pledgeId: pledge.id,
    message: `${pledge.id} updated to ${pledge.status}.`,
  });
  await writeStore(store);
  return pledge;
}

export function isLocalAdminAllowed(request: Request) {
  const adminKey = process.env.EVENT_ADMIN_KEY;
  if (!adminKey && process.env.NODE_ENV !== "production") return true;
  const url = new URL(request.url);
  const candidate = request.headers.get("x-admin-key") || url.searchParams.get("key");
  return Boolean(adminKey && candidate === adminKey);
}
