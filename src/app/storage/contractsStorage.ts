export interface ContractRecord {
  id: number;
  postId: number;
  postTitle: string;
  postType: 'Project' | 'Service' | 'Job';
  clientId: number;
  clientName: string;
  freelancerId: number;
  freelancerName: string;
  companyId?: number;
  companyName?: string;
  amount: number;
  commission: number;
  finalAmount: number;
  status: 'Awaiting Start' | 'In Progress' | 'Awaiting Delivery' | 'Completed';
  createdAt: string;
}

const CONTRACTS_STORAGE_KEY = 'workbridge-contracts';

const contractTextMap: Record<string, string> = {
  'إعادة تصميم تجربة تطبيق مصرفي': 'Redesign a banking app experience',
  'تطوير صفحة هبوط لحملة إعلانية': 'Develop a landing page for an ad campaign',
  'أحمد محمد': 'Ahmad Mohammad',
  'فاطمة علي': 'Fatima Ali',
  'خالد سعيد': 'Khaled Saeed',
  'شركة التقنية المتقدمة': 'Advanced Tech Company',
  'مشروع': 'Project',
  'خدمة': 'Service',
  'وظيفة': 'Job',
  'بانتظار البدء': 'Awaiting Start',
  'قيد التنفيذ': 'In Progress',
  'بانتظار التسليم': 'Awaiting Delivery',
  'مكتمل': 'Completed',
};

function translateContractText(value: string) {
  return contractTextMap[value] ?? value;
}

function normalizeContract(contract: ContractRecord): ContractRecord {
  return {
    ...contract,
    postTitle: translateContractText(contract.postTitle),
    postType: translateContractText(contract.postType) as ContractRecord['postType'],
    clientName: translateContractText(contract.clientName),
    freelancerName: translateContractText(contract.freelancerName),
    companyName: contract.companyName ? translateContractText(contract.companyName) : undefined,
    status: translateContractText(contract.status) as ContractRecord['status'],
  };
}

const defaultContracts: ContractRecord[] = [
  {
    id: 9001,
    postId: 301,
    postTitle: 'Redesign a banking app experience',
    postType: 'Project',
    clientId: 1,
    clientName: 'Ahmad Mohammad',
    freelancerId: 2,
    freelancerName: 'Fatima Ali',
    amount: 1800,
    commission: 180,
    finalAmount: 1620,
    status: 'In Progress',
    createdAt: '2026-04-03',
  },
  {
    id: 9002,
    postId: 302,
    postTitle: 'Develop a landing page for an ad campaign',
    postType: 'Service',
    clientId: 1,
    clientName: 'Ahmad Mohammad',
    freelancerId: 3,
    freelancerName: 'Khaled Saeed',
    amount: 650,
    commission: 65,
    finalAmount: 585,
    status: 'Awaiting Delivery',
    createdAt: '2026-04-08',
  },
  {
    id: 9003,
    postId: 401,
    postTitle: 'Senior Frontend Engineer',
    postType: 'Job',
    clientId: 100,
    clientName: 'Advanced Tech Company',
    freelancerId: 1,
    freelancerName: 'Ahmad Mohammad',
    companyId: 1,
    companyName: 'Advanced Tech Company',
    amount: 2200,
    commission: 220,
    finalAmount: 1980,
    status: 'Awaiting Start',
    createdAt: '2026-04-10',
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}

function persistContracts(contracts: ContractRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(contracts));
}

export function getContracts() {
  if (!canUseStorage()) {
    return defaultContracts.map(normalizeContract);
  }

  const raw = window.localStorage.getItem(CONTRACTS_STORAGE_KEY);
  if (!raw) {
    const normalizedDefaults = defaultContracts.map(normalizeContract);
    persistContracts(normalizedDefaults);
    return normalizedDefaults;
  }

  try {
    const parsed = JSON.parse(raw) as ContractRecord[];
    if (!Array.isArray(parsed)) {
      const normalizedDefaults = defaultContracts.map(normalizeContract);
      persistContracts(normalizedDefaults);
      return normalizedDefaults;
    }

    const normalized = parsed.map(normalizeContract);
    persistContracts(normalized);
    return normalized;
  } catch {
    const normalizedDefaults = defaultContracts.map(normalizeContract);
    persistContracts(normalizedDefaults);
    return normalizedDefaults;
  }
}

export function getContractsForUser(userId: number) {
  return getContracts().filter(
    (contract) => contract.clientId === userId || contract.freelancerId === userId,
  );
}

export function getContractsForCompany(companyId: number) {
  return getContracts().filter((contract) => contract.companyId === companyId);
}

export function updateContractStatus(contractId: number, status: ContractRecord['status']) {
  const current = getContracts();
  const next = current.map((contract) =>
    contract.id === contractId ? { ...contract, status } : contract,
  );

  persistContracts(next);
  return next;
}

export function createContract(
  contract: Omit<ContractRecord, 'id' | 'createdAt'>,
) {
  const current = getContracts();
  const nextContract: ContractRecord = {
    ...contract,
    id: Date.now(),
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const next = [normalizeContract(nextContract), ...current];
  persistContracts(next);
  return nextContract;
}
