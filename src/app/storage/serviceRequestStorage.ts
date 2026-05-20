export interface ServiceRequestItem {
  id: number;
  serviceId: number;
  serviceTitle: string;
  provider: string;
  providerId: number;
  client: string;
  clientId: number;
  price: string;
  requestTitle: string;
  details: string;
  references: string;
  deadline: string;
  status: 'بانتظار المراجعة' | 'مقبول' | 'مرفوض' | 'مؤجل';
  createdAt: string;
}

const SERVICE_REQUESTS_STORAGE_KEY = 'workbridge-service-requests';

const serviceRequestTextMap: Record<string, string> = {
  'تطوير لوحة تحكم React': 'React dashboard development',
  'أحمد محمد': 'Ahmad Mohammad',
  'شركة التقنية المتقدمة': 'Advanced Tech Company',
  'تخصيص لوحة تحكم لمتابعة المبيعات': 'Customize a dashboard for sales tracking',
  'نحتاج إلى لوحة تقارير ومخططات للمبيعات مع فلترة حسب التاريخ والمنتج.':
    'We need a reporting dashboard with sales charts and filters by date and product.',
};

function translateServiceRequestText(value: string) {
  return serviceRequestTextMap[value] ?? value;
}

function normalizeServiceRequest(request: ServiceRequestItem): ServiceRequestItem {
  return {
    ...request,
    serviceTitle: translateServiceRequestText(request.serviceTitle),
    provider: translateServiceRequestText(request.provider),
    client: translateServiceRequestText(request.client),
    requestTitle: translateServiceRequestText(request.requestTitle),
    details: translateServiceRequestText(request.details),
  };
}

const defaultRequests: ServiceRequestItem[] = [
  {
    id: 9001,
    serviceId: 2,
    serviceTitle: 'تطوير لوحة تحكم React',
    provider: 'أحمد محمد',
    providerId: 1,
    client: 'شركة التقنية المتقدمة',
    clientId: 101,
    price: '$900',
    requestTitle: 'تخصيص لوحة تحكم لمتابعة المبيعات',
    details: 'نحتاج إلى لوحة تقارير ومخططات للمبيعات مع فلترة حسب التاريخ والمنتج.',
    references: 'https://example.com/dashboard-reference',
    deadline: 'خلال 7 أيام',
    status: 'بانتظار المراجعة',
    createdAt: '2026-04-04',
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}

function persistRequests(items: ServiceRequestItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SERVICE_REQUESTS_STORAGE_KEY, JSON.stringify(items));
}

export function getServiceRequests() {
  if (!canUseStorage()) {
    return defaultRequests.map(normalizeServiceRequest);
  }

  const raw = window.localStorage.getItem(SERVICE_REQUESTS_STORAGE_KEY);
  if (!raw) {
    const normalizedDefaults = defaultRequests.map(normalizeServiceRequest);
    persistRequests(normalizedDefaults);
    return normalizedDefaults;
  }

  try {
    const parsed = JSON.parse(raw) as ServiceRequestItem[];
    if (!Array.isArray(parsed)) {
      const normalizedDefaults = defaultRequests.map(normalizeServiceRequest);
      persistRequests(normalizedDefaults);
      return normalizedDefaults;
    }

    const normalized = parsed.map(normalizeServiceRequest);
    persistRequests(normalized);
    return normalized;
  } catch {
    const normalizedDefaults = defaultRequests.map(normalizeServiceRequest);
    persistRequests(normalizedDefaults);
    return normalizedDefaults;
  }
}

export function createServiceRequest(
  request: Omit<ServiceRequestItem, 'id' | 'status' | 'createdAt'>,
) {
  const current = getServiceRequests();
  const nextItems: ServiceRequestItem[] = [
    {
      ...request,
      id: Date.now(),
      status: 'بانتظار المراجعة',
      createdAt: new Date().toISOString().slice(0, 10),
    },
    ...current,
  ];

  persistRequests(nextItems);
  return nextItems;
}

export function updateServiceRequestStatus(
  id: number,
  status: ServiceRequestItem['status'],
) {
  const current = getServiceRequests();
  const nextItems = current.map((item) => (item.id === id ? { ...item, status } : item));
  persistRequests(nextItems);
  return nextItems;
}
