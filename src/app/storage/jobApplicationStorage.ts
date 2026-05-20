const APPLIED_JOBS_STORAGE_KEY = 'workbridge-applied-jobs';
const SAVED_JOBS_STORAGE_KEY = 'workbridge-saved-jobs';

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readIds(key: string) {
  if (!canUseStorage()) {
    return [] as number[];
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [] as number[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'number') : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: number[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(ids));
}

export function getAppliedJobIds() {
  return readIds(APPLIED_JOBS_STORAGE_KEY);
}

export function setAppliedJobIds(ids: number[]) {
  writeIds(APPLIED_JOBS_STORAGE_KEY, ids);
}

export function removeAppliedJobId(jobId: number) {
  const nextIds = getAppliedJobIds().filter((id) => id !== jobId);
  setAppliedJobIds(nextIds);
  return nextIds;
}

export function getSavedJobIds() {
  return readIds(SAVED_JOBS_STORAGE_KEY);
}

export function setSavedJobIds(ids: number[]) {
  writeIds(SAVED_JOBS_STORAGE_KEY, ids);
}




