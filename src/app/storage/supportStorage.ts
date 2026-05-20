export interface SupportAttachment {
  name: string;
  type: string;
  size: number;
}

export interface SupportTicket {
  id: number;
  category: 'Support' | 'Complaint' | 'Dispute';
  status: 'New' | 'Under Review' | 'Closed';
  subject: string;
  description: string;
  createdAt: string;
  attachments: SupportAttachment[];
}

const SUPPORT_STORAGE_KEY = 'workbridge-support-tickets';

const defaultTickets: SupportTicket[] = [
  {
    id: 1,
    subject: 'Question about payment status',
    category: 'Support',
    status: 'Under Review',
    description: 'I need to know why the payment status in the wallet has not updated yet.',
    createdAt: '2026-03-28',
    attachments: [],
  },
  {
    id: 2,
    subject: 'Report about a delayed project',
    category: 'Complaint',
    status: 'New',
    description: 'The project passed the delivery deadline and I did not receive any update from the other party.',
    createdAt: '2026-03-29',
    attachments: [],
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}

function normalizeSupportTicket(ticket: SupportTicket): SupportTicket {
  return {
    ...ticket,
    category:
      ticket.category === 'دعم'
        ? 'Support'
        : ticket.category === 'شكوى'
          ? 'Complaint'
          : ticket.category === 'نزاع'
            ? 'Dispute'
            : ticket.category,
    status:
      ticket.status === 'جديد'
        ? 'New'
        : ticket.status === 'قيد المراجعة'
          ? 'Under Review'
          : ticket.status === 'مغلق'
            ? 'Closed'
            : ticket.status,
    attachments: Array.isArray(ticket.attachments) ? ticket.attachments : [],
  };
}

function persistTickets(tickets: SupportTicket[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(tickets));
}

export function getSupportTickets() {
  if (!canUseStorage()) {
    return defaultTickets.map(normalizeSupportTicket);
  }

  const raw = window.localStorage.getItem(SUPPORT_STORAGE_KEY);
  if (!raw) {
    const normalizedDefaults = defaultTickets.map(normalizeSupportTicket);
    persistTickets(normalizedDefaults);
    return normalizedDefaults;
  }

  try {
    const parsed = JSON.parse(raw) as SupportTicket[];
    if (!Array.isArray(parsed)) {
      const normalizedDefaults = defaultTickets.map(normalizeSupportTicket);
      persistTickets(normalizedDefaults);
      return normalizedDefaults;
    }

    const normalized = parsed.map(normalizeSupportTicket);
    persistTickets(normalized);
    return normalized;
  } catch {
    const normalizedDefaults = defaultTickets.map(normalizeSupportTicket);
    persistTickets(normalizedDefaults);
    return normalizedDefaults;
  }
}

export function createSupportTicket(
  ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>,
) {
  const current = getSupportTickets();
  const next: SupportTicket[] = [
    {
      ...ticket,
      attachments: ticket.attachments ?? [],
      id: Date.now(),
      status: 'New',
      createdAt: new Date().toISOString().slice(0, 10),
    },
    ...current,
  ];
  persistTickets(next);
  return next;
}

export function updateSupportTicketStatus(id: number, status: SupportTicket['status']) {
  const current = getSupportTickets();
  const next = current.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket));
  persistTickets(next);
  return next;
}
