import type { EventSummary, PublicPledge, PublicTicket } from '../../../lib/event-types';

const configuredBase =
  process.env.EXPO_PUBLIC_EVENT_API_URL ||
  process.env.EXPO_PUBLIC_EVENT_WEB_URL ||
  'https://portal-hti.vercel.app';

export const EVENT_API_BASE_URL = configuredBase.replace(/\/$/, '');
export const EVENT_WEB_BASE_URL = (process.env.EXPO_PUBLIC_EVENT_WEB_URL || EVENT_API_BASE_URL).replace(/\/$/, '');

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${EVENT_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }
  return payload as T;
}

export async function fetchEventSummary(): Promise<EventSummary> {
  const payload = await requestJson<{ summary: EventSummary }>('/api/event/summary');
  return payload.summary;
}

export async function createEventPledge(input: {
  quantity: string | number;
  brand?: string;
  condition: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  notes?: string;
}): Promise<PublicPledge> {
  const payload = await requestJson<{ pledge: PublicPledge }>('/api/event/pledges', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return payload.pledge;
}

export async function fetchTicket(code: string, token?: string): Promise<PublicTicket> {
  const params = token ? `?token=${encodeURIComponent(token)}` : '';
  const payload = await requestJson<{ ticket: PublicTicket }>(`/api/event/tickets/${encodeURIComponent(code)}${params}`);
  return payload.ticket;
}

export function parseTicketQr(data: string): { code: string; token?: string } | null {
  if (!data) return null;
  if (data.startsWith('SS-')) return { code: data.trim().toUpperCase() };

  try {
    const url = new URL(data);
    const code = url.searchParams.get('verify') || url.searchParams.get('code');
    const token = url.searchParams.get('token') || undefined;
    if (!code) return null;
    return { code: code.trim().toUpperCase(), token };
  } catch {
    return null;
  }
}
