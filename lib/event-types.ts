export const EVENT_PLEDGE_GOAL = 150;

export type PaymentStatus = "pending" | "pending_review" | "paid" | "refunded" | "void";
export type CheckInStatus = "not_checked_in" | "checked_in" | "blocked";
export type PledgeStatus =
  | "new"
  | "contacted"
  | "scheduled"
  | "received"
  | "wiped"
  | "distributed"
  | "cancelled";

export interface EventTicket {
  code: string;
  token: string;
  guestName: string;
  guestEmail: string;
  qty: number;
  donation: number;
  ticketTotal: number;
  totalDue: number;
  paymentStatus: PaymentStatus;
  paymentProvider?: "paypal" | "stripe" | "cash" | "manual";
  paymentReference?: string;
  paymentConfirmedAt?: string;
  checkedInAt?: string;
  checkInStatus: CheckInStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventPledge {
  id: string;
  quantity: number;
  brand: string;
  condition: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  notes?: string;
  status: PledgeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventAuditLog {
  id: string;
  type:
    | "ticket_created"
    | "ticket_payment_review_requested"
    | "ticket_payment_marked_paid"
    | "ticket_checked_in"
    | "ticket_check_in_blocked"
    | "pledge_created"
    | "pledge_updated";
  message: string;
  ticketCode?: string;
  pledgeId?: string;
  createdAt: string;
}

export interface EventSummary {
  goal: number;
  pledgedDevices: number;
  receivedDevices: number;
  stillNeeded: number;
  progress: number;
  ticketsReserved: number;
  paidTickets: number;
  checkedInGuests: number;
  donationIntent: number;
  ticketRevenueIntent: number;
  latestActivity: EventAuditLog[];
}

export interface PublicTicket {
  code: string;
  token?: string;
  guestName: string;
  guestEmail?: string;
  qty: number;
  donation: number;
  ticketTotal: number;
  totalDue: number;
  paymentStatus: PaymentStatus;
  paymentProvider?: EventTicket["paymentProvider"];
  paymentReference?: string;
  paymentConfirmedAt?: string;
  checkedInAt?: string;
  checkInStatus: CheckInStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicPledge {
  id: string;
  quantity: number;
  brand: string;
  condition: string;
  donorName: string;
  status: PledgeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventStoreSnapshot {
  summary: EventSummary;
  tickets: PublicTicket[];
  pledges: EventPledge[];
}
