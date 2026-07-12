import { apiRequest } from '@/app/api/client';

import type { CompanyDashboardResponse, Service, ServiceRequest, PaginatedResponse, Contract, JobPost, JobApplication, Wallet, CompanyProfile } from '../../types';

export type { CompanyDashboardResponse, CompanyProfile, Contract, JobApplication, JobPost, ServiceRequest } from '../../types';

export async function getCompany<T = CompanyProfile>() {
  const response = await apiRequest<{ company: T }>('/company');
  return response.company;
}

export async function getCompanyContractsPage(page = 1) {
  const response = await apiRequest<{ contracts: PaginatedResponse<Contract> }>(
    `/company/contracts?page=${page}`,
  );
  return response.contracts;
}

export function getCompanyDashboard() {
  return apiRequest<CompanyDashboardResponse>('/dashboard/company');
}

export async function getCompanyJobsPage(page = 1) {
  const response = await apiRequest<{
    jobs: PaginatedResponse<JobPost>;
  }>(`/company/jobs?page=${page}`);
  return response.jobs;
}

export async function getJobApplications(jobId: string | number) {
  const response = await apiRequest<{ applications: JobApplication[] }>(
    `/jobs/${jobId}/applications`,
  );
  return response.applications;
}

export async function getMyServiceRequestsPage(page = 1) {
  const response = await apiRequest<{
    requests: PaginatedResponse<ServiceRequest>;
  }>(`/service-requests/my?page=${page}`);
  return response.requests;
}

export async function getMyWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/wallet');
  return response.wallet;
}
