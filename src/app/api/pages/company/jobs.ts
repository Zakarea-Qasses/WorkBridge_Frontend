import { apiRequest } from '@/app/api/client';

import type { LocationOption, PaginatedResponse, JobPost, JobPayload } from '../../types';

export type { JobPayload, JobPost, LocationOption, PaginatedResponse } from '../../types';

export async function activateJob(id: string | number) {
  const response = await apiRequest<{ message: string; job: JobPost }>(`/jobs/${id}/activate`, {
    method: 'POST',
  });
  return response.job;
}

export async function createJob(payload: JobPayload) {
  const response = await apiRequest<{ message: string; job: JobPost }>('/jobs', {
    method: 'POST',
    body: payload,
  });
  return response.job;
}

export function deleteJob(id: string | number) {
  return apiRequest(`/jobs/${id}`, { method: 'DELETE' });
}

export function getCitiesByGovernorate(governorateId: string | number) {
  return apiRequest<LocationOption[]>(`/governorates/${governorateId}/cities`);
}

export async function getCompanyJobsPage(page = 1) {
  const response = await apiRequest<{
    jobs: PaginatedResponse<JobPost>;
  }>(`/company/jobs?page=${page}`);
  return response.jobs;
}

export function getGovernorates() {
  return apiRequest<LocationOption[]>('/governorates');
}

export async function getJob(id: string | number) {
  const response = await apiRequest<{ job: JobPost }>(`/jobs/${id}`);
  return response.job;
}

export async function pauseJob(id: string | number) {
  const response = await apiRequest<{ message: string; job: JobPost }>(`/jobs/${id}/pause`, {
    method: 'POST',
  });
  return response.job;
}

export async function updateJob(id: string | number, payload: Partial<JobPayload>) {
  const response = await apiRequest<{ message: string; job: JobPost }>(`/jobs/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return response.job;
}
