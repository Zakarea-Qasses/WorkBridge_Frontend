export interface WalletBalance {
  total: number;
  available: number;
  reserved: number;
}

export interface WalletTransaction {
  id: number;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  status: 'completed' | 'pending';
  date: string;
  time: string;
  escrowId?: number;
}

export interface SiteEscrow {
  id: number;
  projectTitle: string;
  clientName: string;
  providerName: string;
  amount: number;
  reservedAt: string;
  releaseOn: string;
  status: 'reserved' | 'released' | 'refunded' | 'disputed';
  resolvedAt?: string;
  resolution?: 'provider' | 'client';
}

export interface WalletData {
  version?: number;
  balance: WalletBalance;
  transactions: WalletTransaction[];
  escrows?: SiteEscrow[];
}

type WalletScope = 'user' | 'company' | 'site' | 'provider';

const WALLET_STORAGE_KEYS: Record<WalletScope, string> = {
  user: 'workbridge-wallet-user',
  company: 'workbridge-wallet-company',
  site: 'workbridge-wallet-site',
  provider: 'workbridge-wallet-provider',
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date) {
  return date.toTimeString().slice(0, 5);
}

function shiftDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function buildEscrowSeedDates(daysAgo: number, releaseAfterDays = 7) {
  const reservedAt = shiftDate(-daysAgo);
  const releaseOn = new Date(reservedAt);
  releaseOn.setDate(releaseOn.getDate() + releaseAfterDays);

  return {
    reservedAt: formatDate(reservedAt),
    releaseOn: formatDate(releaseOn),
  };
}

const seededEscrowDates = buildEscrowSeedDates(8);

const walletTextMap: Record<string, string> = {
  'تم استلام دفعة - مشروع تطوير موقع': 'Payment received - Website development project',
  'سحب أموال إلى الحساب البنكي': 'Withdrawal to bank account',
  'تم استلام دفعة - مشروع تصميم': 'Payment received - Design project',
  'عمولة المنصة (5%)': 'Platform commission (5%)',
  'حجز مبلغ لمشروع قيد التنفيذ': 'Amount reserved for a project in progress',
  'رصيد افتتاحي لمحفظة الشركة': 'Opening balance for the company wallet',
  'رصيد سابق لمقدم الخدمة': 'Previous balance for the service provider',
  'مبلغ محجوز من العميل للمشروع: تصميم هوية بصرية كاملة':
    'Amount reserved from the client for the project: Full brand identity design',
  'تصميم هوية بصرية كاملة': 'Full brand identity design',
  'أحمد محمد': 'Ahmad Mohammad',
  'فاطمة علي': 'Fatima Ali',
};

function translateWalletText(value: string) {
  let nextValue = value;

  Object.entries(walletTextMap).forEach(([arabic, english]) => {
    nextValue = nextValue.replaceAll(arabic, english);
  });

  return nextValue;
}

function normalizeTransaction(transaction: WalletTransaction): WalletTransaction {
  return {
    ...transaction,
    description: translateWalletText(transaction.description),
  };
}

function normalizeEscrow(escrow: SiteEscrow): SiteEscrow {
  return {
    ...escrow,
    projectTitle: translateWalletText(escrow.projectTitle),
    clientName: translateWalletText(escrow.clientName),
    providerName: translateWalletText(escrow.providerName),
  };
}

function normalizeWalletData(data: WalletData): WalletData {
  return {
    ...data,
    transactions: data.transactions.map(normalizeTransaction),
    escrows: data.escrows?.map(normalizeEscrow),
  };
}

const defaultWalletDataByScope: Record<WalletScope, WalletData> = {
  user: {
    version: 2,
    balance: {
      total: 15750,
      available: 12500,
      reserved: 3250,
    },
    transactions: [
      {
        id: 1,
        type: 'credit',
        description: 'Payment received - Website development project',
        amount: 12000,
        status: 'completed',
        date: '2026-02-25',
        time: '14:30',
      },
      {
        id: 2,
        type: 'debit',
        description: 'Withdrawal to bank account',
        amount: -5000,
        status: 'completed',
        date: '2026-02-24',
        time: '10:15',
      },
      {
        id: 3,
        type: 'credit',
        description: 'Payment received - Design project',
        amount: 8500,
        status: 'completed',
        date: '2026-02-22',
        time: '16:45',
      },
      {
        id: 4,
        type: 'debit',
        description: 'Platform commission (5%)',
        amount: -600,
        status: 'completed',
        date: '2026-02-22',
        time: '16:45',
      },
      {
        id: 5,
        type: 'debit',
        description: 'Amount reserved for a project in progress',
        amount: -3250,
        status: 'pending',
        date: seededEscrowDates.reservedAt,
        time: '09:00',
        escrowId: 7001,
      },
    ],
  },
  company: {
    version: 2,
    balance: {
      total: 1000,
      available: 1000,
      reserved: 0,
    },
    transactions: [
      {
        id: 101,
        type: 'credit',
        description: 'Opening balance for the company wallet',
        amount: 1000,
        status: 'completed',
        date: '2026-03-29',
        time: '10:00',
      },
    ],
  },
  provider: {
    version: 1,
    balance: {
      total: 4200,
      available: 4200,
      reserved: 0,
    },
    transactions: [
      {
        id: 201,
        type: 'credit',
        description: 'Previous balance for the service provider',
        amount: 4200,
        status: 'completed',
        date: '2026-03-20',
        time: '12:00',
      },
    ],
  },
  site: {
    version: 2,
    balance: {
      total: 3250,
      available: 0,
      reserved: 3250,
    },
    transactions: [
      {
        id: 301,
        type: 'credit',
        description: 'Amount reserved from the client for the project: Full brand identity design',
        amount: 3250,
        status: 'pending',
        date: seededEscrowDates.reservedAt,
        time: '09:00',
        escrowId: 7001,
      },
    ],
    escrows: [
      {
        id: 7001,
        projectTitle: 'Full brand identity design',
        clientName: 'Ahmad Mohammad',
        providerName: 'Fatima Ali',
        amount: 3250,
        reservedAt: seededEscrowDates.reservedAt,
        releaseOn: seededEscrowDates.releaseOn,
        status: 'reserved',
      },
    ],
  },
};

function persistWalletData(scope: WalletScope, data: WalletData) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(WALLET_STORAGE_KEYS[scope], JSON.stringify(data));
}

function getCurrentDateTime() {
  const now = new Date();
  return { date: formatDate(now), time: formatTime(now) };
}

function createTransaction(
  type: WalletTransaction['type'],
  description: string,
  amount: number,
  status: WalletTransaction['status'] = 'completed',
  escrowId?: number,
): WalletTransaction {
  const { date, time } = getCurrentDateTime();

  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    type,
    description,
    amount,
    status,
    date,
    time,
    escrowId,
  };
}

function cloneDefaultWallet(scope: WalletScope) {
  return JSON.parse(JSON.stringify(defaultWalletDataByScope[scope])) as WalletData;
}

export function getWalletData(scope: WalletScope = 'user') {
  const defaultWalletData = normalizeWalletData(cloneDefaultWallet(scope));

  if (!canUseStorage()) {
    return defaultWalletData;
  }

  const raw = window.localStorage.getItem(WALLET_STORAGE_KEYS[scope]);
  if (!raw) {
    persistWalletData(scope, defaultWalletData);
    return defaultWalletData;
  }

  try {
    const parsed = JSON.parse(raw) as WalletData;

    if (!parsed?.balance || !Array.isArray(parsed.transactions)) {
      persistWalletData(scope, defaultWalletData);
      return defaultWalletData;
    }

    if (parsed.version !== defaultWalletData.version) {
      persistWalletData(scope, defaultWalletData);
      return defaultWalletData;
    }

    const normalized = normalizeWalletData(parsed);
    persistWalletData(scope, normalized);
    return normalized;
  } catch {
    persistWalletData(scope, defaultWalletData);
    return defaultWalletData;
  }
}

function persistMultiple(updates: Partial<Record<WalletScope, WalletData>>) {
  (Object.keys(updates) as WalletScope[]).forEach((scope) => {
    const data = updates[scope];
    if (data) {
      persistWalletData(scope, data);
    }
  });
}

function updateTransactionStatuses(
  transactions: WalletTransaction[],
  escrowId: number,
  status: WalletTransaction['status'],
) {
  return transactions.map((transaction) =>
    transaction.escrowId === escrowId ? { ...transaction, status } : transaction,
  );
}

function isReleaseDue(releaseOn: string) {
  return new Date(releaseOn) <= new Date();
}

function findEscrow(siteWallet: WalletData, escrowId: number) {
  return siteWallet.escrows?.find((escrow) => escrow.id === escrowId) ?? null;
}

export function submitWalletTopUp(amount: number, method: string, scope: WalletScope = 'user') {
  const wallet = getWalletData(scope);
  const nextWallet: WalletData = {
    ...wallet,
    balance: {
      ...wallet.balance,
      total: wallet.balance.total + amount,
      available: wallet.balance.available + amount,
    },
    transactions: [createTransaction('credit', `Wallet top-up via ${method}`, amount), ...wallet.transactions],
  };

  persistWalletData(scope, nextWallet);
  return nextWallet;
}

export function submitWalletWithdrawal(amount: number, method: string, scope: WalletScope = 'user') {
  const wallet = getWalletData(scope);
  const nextWallet: WalletData = {
    ...wallet,
    balance: {
      ...wallet.balance,
      total: wallet.balance.total - amount,
      available: wallet.balance.available - amount,
    },
    transactions: [createTransaction('debit', `Withdraw funds via ${method}`, -amount), ...wallet.transactions],
  };

  persistWalletData(scope, nextWallet);
  return nextWallet;
}

export function reserveProjectPayment(amount: number, projectTitle: string, providerName: string) {
  const clientWallet = getWalletData('user');

  if (amount <= 0) {
    return { ok: false as const, message: 'The reservation amount is invalid.' };
  }

  if (amount > clientWallet.balance.available) {
    return {
      ok: false as const,
      message: 'The available balance in the client wallet is not sufficient to complete the reservation.',
    };
  }

  const escrowId = Date.now();
  const reservedAt = new Date();
  const releaseOn = new Date(reservedAt);
  releaseOn.setDate(releaseOn.getDate() + 7);

  const escrow: SiteEscrow = {
    id: escrowId,
    projectTitle,
    clientName: 'Ahmad Mohammad',
    providerName,
    amount,
    reservedAt: formatDate(reservedAt),
    releaseOn: formatDate(releaseOn),
    status: 'reserved',
  };

  const nextClientWallet: WalletData = {
    ...clientWallet,
    balance: {
      ...clientWallet.balance,
      available: clientWallet.balance.available - amount,
      reserved: clientWallet.balance.reserved + amount,
    },
    transactions: [
      createTransaction(
        'debit',
        `Reserved amount for project: ${projectTitle} with ${providerName}`,
        -amount,
        'pending',
        escrowId,
      ),
      ...clientWallet.transactions,
    ],
  };

  const siteWallet = getWalletData('site');
  const nextSiteWallet: WalletData = {
    ...siteWallet,
    balance: {
      total: siteWallet.balance.total + amount,
      available: siteWallet.balance.available,
      reserved: siteWallet.balance.reserved + amount,
    },
    transactions: [
      createTransaction(
        'credit',
        `Amount reserved from the client for the project: ${projectTitle}`,
        amount,
        'pending',
        escrowId,
      ),
      ...siteWallet.transactions,
    ],
    escrows: [escrow, ...(siteWallet.escrows ?? [])],
  };

  persistMultiple({
    user: nextClientWallet,
    site: nextSiteWallet,
  });

  return {
    ok: true as const,
    message: `The amount was successfully reserved in the site wallet and will remain reserved until ${escrow.releaseOn}.`,
  };
}

export function releaseEscrowToProvider(escrowId: number, options?: { force?: boolean }) {
  const clientWallet = getWalletData('user');
  const siteWallet = getWalletData('site');
  const providerWallet = getWalletData('provider');
  const escrow = findEscrow(siteWallet, escrowId);

  if (!escrow) {
    return { ok: false as const, message: 'The requested escrow transaction could not be found.' };
  }

  if (escrow.status === 'released') {
    return { ok: false as const, message: 'This amount has already been transferred.' };
  }

  if (escrow.status === 'refunded') {
    return { ok: false as const, message: 'This amount has already been refunded to the client.' };
  }

  if (!options?.force && !isReleaseDue(escrow.releaseOn)) {
    return {
      ok: false as const,
      message: `This amount cannot be transferred before ${escrow.releaseOn} according to platform policy.`,
    };
  }

  const { date, time } = getCurrentDateTime();

  const nextClientWallet: WalletData = {
    ...clientWallet,
    balance: {
      ...clientWallet.balance,
      total: clientWallet.balance.total - escrow.amount,
      reserved: Math.max(clientWallet.balance.reserved - escrow.amount, 0),
    },
    transactions: [
      createTransaction(
        'debit',
        `Final amount transferred to the service provider: ${escrow.projectTitle}`,
        -escrow.amount,
        'completed',
        escrowId,
      ),
      ...updateTransactionStatuses(clientWallet.transactions, escrowId, 'completed'),
    ],
  };

  const nextProviderWallet: WalletData = {
    ...providerWallet,
    balance: {
      total: providerWallet.balance.total + escrow.amount,
      available: providerWallet.balance.available + escrow.amount,
      reserved: providerWallet.balance.reserved,
    },
    transactions: [
      createTransaction(
        'credit',
        `Project payment received: ${escrow.projectTitle}`,
        escrow.amount,
        'completed',
        escrowId,
      ),
      ...providerWallet.transactions,
    ],
  };

  const nextSiteWallet: WalletData = {
    ...siteWallet,
    balance: {
      total: Math.max(siteWallet.balance.total - escrow.amount, 0),
      available: siteWallet.balance.available,
      reserved: Math.max(siteWallet.balance.reserved - escrow.amount, 0),
    },
    transactions: [
      createTransaction(
        'debit',
        `Amount transferred to the service provider: ${escrow.projectTitle}`,
        -escrow.amount,
        'completed',
        escrowId,
      ),
      ...updateTransactionStatuses(siteWallet.transactions, escrowId, 'completed'),
    ],
    escrows: (siteWallet.escrows ?? []).map((item) =>
      item.id === escrowId
        ? { ...item, status: 'released', resolvedAt: date, resolution: 'provider' }
        : item,
    ),
  };

  persistMultiple({
    user: nextClientWallet,
    provider: nextProviderWallet,
    site: nextSiteWallet,
  });

  return {
    ok: true as const,
    message: `The amount was transferred to the service provider on ${date} at ${time}.`,
  };
}

export function refundEscrowToClient(escrowId: number) {
  const clientWallet = getWalletData('user');
  const siteWallet = getWalletData('site');
  const escrow = findEscrow(siteWallet, escrowId);

  if (!escrow) {
    return { ok: false as const, message: 'The requested escrow transaction could not be found.' };
  }

  if (escrow.status === 'released') {
    return { ok: false as const, message: 'The amount has already been transferred to the service provider.' };
  }

  if (escrow.status === 'refunded') {
    return { ok: false as const, message: 'This amount has already been refunded to the client.' };
  }

  const { date, time } = getCurrentDateTime();

  const nextClientWallet: WalletData = {
    ...clientWallet,
    balance: {
      ...clientWallet.balance,
      available: clientWallet.balance.available + escrow.amount,
      reserved: Math.max(clientWallet.balance.reserved - escrow.amount, 0),
    },
    transactions: [
      createTransaction(
        'credit',
        `Project amount refunded to the client: ${escrow.projectTitle}`,
        escrow.amount,
        'completed',
        escrowId,
      ),
      ...updateTransactionStatuses(clientWallet.transactions, escrowId, 'completed'),
    ],
  };

  const nextSiteWallet: WalletData = {
    ...siteWallet,
    balance: {
      total: Math.max(siteWallet.balance.total - escrow.amount, 0),
      available: siteWallet.balance.available,
      reserved: Math.max(siteWallet.balance.reserved - escrow.amount, 0),
    },
    transactions: [
      createTransaction(
        'debit',
        `Amount refunded to the client: ${escrow.projectTitle}`,
        -escrow.amount,
        'completed',
        escrowId,
      ),
      ...updateTransactionStatuses(siteWallet.transactions, escrowId, 'completed'),
    ],
    escrows: (siteWallet.escrows ?? []).map((item) =>
      item.id === escrowId
        ? { ...item, status: 'refunded', resolvedAt: date, resolution: 'client' }
        : item,
    ),
  };

  persistMultiple({
    user: nextClientWallet,
    site: nextSiteWallet,
  });

  return {
    ok: true as const,
    message: `The amount was refunded to the client on ${date} at ${time}.`,
  };
}

export function markEscrowAsDisputed(escrowId: number) {
  const siteWallet = getWalletData('site');
  const escrow = findEscrow(siteWallet, escrowId);

  if (!escrow) {
    return { ok: false as const, message: 'The requested escrow transaction could not be found.' };
  }

  if (escrow.status !== 'reserved') {
    return { ok: false as const, message: 'A dispute can only be opened for amounts that are currently reserved.' };
  }

  const nextSiteWallet: WalletData = {
    ...siteWallet,
    escrows: (siteWallet.escrows ?? []).map((item) =>
      item.id === escrowId ? { ...item, status: 'disputed' } : item,
    ),
  };

  persistWalletData('site', nextSiteWallet);

  return {
    ok: true as const,
    message: 'A dispute has been opened for this transaction, and the amount will remain reserved until the admin decision.',
  };
}

export function getSiteEscrows() {
  return getWalletData('site').escrows ?? [];
}
