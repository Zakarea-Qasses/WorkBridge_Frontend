import { applicants } from '@/app/data';

const COMPANY_APPLICANTS_STORAGE_KEY = 'workbridge-company-applicants';

export type CompanyApplicant = (typeof applicants)[number];

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function getCompanyApplicants() {
  if (!canUseStorage()) {
    return applicants as CompanyApplicant[];
  }

  const raw = window.localStorage.getItem(COMPANY_APPLICANTS_STORAGE_KEY);
  if (!raw) {
    return applicants as CompanyApplicant[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CompanyApplicant[]) : (applicants as CompanyApplicant[]);
  } catch {
    return applicants as CompanyApplicant[];
  }
}

export function setCompanyApplicants(items: CompanyApplicant[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(COMPANY_APPLICANTS_STORAGE_KEY, JSON.stringify(items));
}

