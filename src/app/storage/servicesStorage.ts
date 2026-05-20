export interface ServiceItem {
  id: number;
  title: string;
  category: string;
  price: string;
  delivery: string;
  rating: number;
  provider: string;
  providerId: number;
  description: string;
  status: 'نشط' | 'قيد المراجعة' | 'موقوف';
  orders: number;
}

const SERVICES_STORAGE_KEY = 'workbridge-services';

const serviceTextMap: Record<string, string> = {
  'تصميم واجهة هبوط احترافية': 'Professional landing page design',
  'تطوير لوحة تحكم React': 'React dashboard development',
  'كتابة محتوى صفحات الخدمات': 'Service page content writing',
  'فاطمة علي': 'Fatima Ali',
  'أحمد محمد': 'Ahmad Mohammad',
  'نورة حسن': 'Noura Hassan',
  'تصميم صفحة هبوط متجاوبة مع ملف Figma وتسليم منظم للأصول.':
    'Responsive landing page design with a Figma file and organized asset delivery.',
  'تطوير لوحة تحكم متكاملة مع جداول وفلاتر ومخططات جاهزة.':
    'Full dashboard development with tables, filters, and ready-to-use charts.',
  'كتابة محتوى تسويقي عربي واضح ومحسن لمحركات البحث.':
    'Clear marketing content writing optimized for search engines.',
};

function translateServiceText(value: string) {
  return serviceTextMap[value] ?? value;
}

function normalizeService(service: ServiceItem): ServiceItem {
  return {
    ...service,
    title: translateServiceText(service.title),
    provider: translateServiceText(service.provider),
    description: translateServiceText(service.description),
  };
}

const defaultServices: ServiceItem[] = [
  {
    id: 1,
    title: 'تصميم واجهة هبوط احترافية',
    category: 'تصميم',
    price: '$250',
    delivery: '3 أيام',
    rating: 4.9,
    provider: 'فاطمة علي',
    providerId: 2,
    description: 'تصميم صفحة هبوط متجاوبة مع ملف Figma وتسليم منظم للأصول.',
    status: 'نشط',
    orders: 18,
  },
  {
    id: 2,
    title: 'تطوير لوحة تحكم React',
    category: 'برمجة وتطوير',
    price: '$900',
    delivery: '7 أيام',
    rating: 4.8,
    provider: 'أحمد محمد',
    providerId: 1,
    description: 'تطوير لوحة تحكم متكاملة مع جداول وفلاتر ومخططات جاهزة.',
    status: 'نشط',
    orders: 12,
  },
  {
    id: 3,
    title: 'كتابة محتوى صفحات الخدمات',
    category: 'كتابة وترجمة',
    price: '$120',
    delivery: '2 يوم',
    rating: 4.7,
    provider: 'نورة حسن',
    providerId: 4,
    description: 'كتابة محتوى تسويقي عربي واضح ومحسن لمحركات البحث.',
    status: 'قيد المراجعة',
    orders: 25,
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}

function persistServices(services: ServiceItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
}

export function getServices() {
  if (!canUseStorage()) {
    return defaultServices.map(normalizeService);
  }

  const raw = window.localStorage.getItem(SERVICES_STORAGE_KEY);
  if (!raw) {
    const normalizedDefaults = defaultServices.map(normalizeService);
    persistServices(normalizedDefaults);
    return normalizedDefaults;
  }

  try {
    const parsed = JSON.parse(raw) as ServiceItem[];
    if (!Array.isArray(parsed)) {
      const normalizedDefaults = defaultServices.map(normalizeService);
      persistServices(normalizedDefaults);
      return normalizedDefaults;
    }

    const normalized = parsed.map(normalizeService);
    persistServices(normalized);
    return normalized;
  } catch {
    const normalizedDefaults = defaultServices.map(normalizeService);
    persistServices(normalizedDefaults);
    return normalizedDefaults;
  }
}

export function getServiceById(id: number) {
  return getServices().find((service) => service.id === id) ?? null;
}

export function createService(
  service: Omit<ServiceItem, 'id' | 'rating' | 'orders' | 'status'>,
) {
  const current = getServices();
  const next: ServiceItem[] = [
    {
      ...service,
      id: Date.now(),
      rating: 0,
      orders: 0,
      status: 'قيد المراجعة',
    },
    ...current,
  ];
  persistServices(next);
  return next;
}

export function updateServiceStatus(id: number, status: ServiceItem['status']) {
  const current = getServices();
  const next = current.map((service) => (service.id === id ? { ...service, status } : service));
  persistServices(next);
  return next;
}

export function deleteService(id: number) {
  const current = getServices();
  const next = current.filter((service) => service.id !== id);
  persistServices(next);
  return next;
}




