import { adminProjects, disputes } from '@/app/data';

const ADMIN_PROJECTS_STORAGE_KEY = 'workbridge-admin-projects';
const ADMIN_DISPUTES_STORAGE_KEY = 'workbridge-admin-disputes';

export type AdminProjectRecord = (typeof adminProjects)[number] & {
  processedAt?: string;
  actionLabel?: string;
};

export type AdminDisputeRecord = (typeof disputes)[number] & {
  decisionTitle?: string;
  decisionSummary?: string;
  resolvedAt?: string;
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readStorage<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getAdminProjectRecords() {
  return readStorage<AdminProjectRecord[]>(ADMIN_PROJECTS_STORAGE_KEY, adminProjects);
}

export function processAdminProject(itemId: number, actionLabel: string) {
  const current = getAdminProjectRecords();
  const next = current.map((item) =>
    item.id === itemId
      ? {
          ...item,
          status: 'مكتمل',
          processedAt: new Date().toLocaleDateString('ar-SY'),
          actionLabel,
        }
      : item,
  );

  writeStorage(ADMIN_PROJECTS_STORAGE_KEY, next);
  return next;
}

export function getAdminDisputeRecords() {
  return readStorage<AdminDisputeRecord[]>(ADMIN_DISPUTES_STORAGE_KEY, disputes);
}

export function saveAdminDisputeDecision(
  disputeId: number,
  decisionTitle: string,
  decisionSummary: string,
) {
  const current = getAdminDisputeRecords();
  const next = current.map((item) =>
    item.id === disputeId
      ? {
          ...item,
          status: 'مكتمل',
          decisionTitle,
          decisionSummary,
          resolvedAt: new Date().toLocaleDateString('ar-SY'),
          updatedAt: new Date().toLocaleDateString('ar-SY'),
        }
      : item,
  );

  writeStorage(ADMIN_DISPUTES_STORAGE_KEY, next);
  return next;
}
