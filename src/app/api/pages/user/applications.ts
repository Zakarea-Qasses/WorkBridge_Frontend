import { apiRequest } from '@/app/api/client';

import type { Service, ServiceRequest, PaginatedResponse, Contract, ProjectApplication } from '../../types';

export type { ProjectApplication, ServiceRequest } from '../../types';

function unwrapList<T>(value: T[] | PaginatedResponse<T>) {
  return Array.isArray(value) ? value : value.data;
}

export async function acceptProjectApplication(id: string | number) {
  const response = await apiRequest<{
    message: string;
    application: ProjectApplication;
    contract?: Contract;
  }>(`/applications/${id}/accept`, { method: 'POST' });
  return response.application;
}

export async function getMyProjectApplications(page = 1) {
  const response = await apiRequest<{ applications: PaginatedResponse<ProjectApplication> }>(
    `/applications/my?page=${page}`,
  );
  return response.applications;
}

export async function getMyServiceRequests() {
  const response = await apiRequest<{
    requests: ServiceRequest[] | PaginatedResponse<ServiceRequest>;
  }>('/service-requests/my');
  return unwrapList(response.requests);
}

export async function getReceivedProjectApplications(page = 1) {
  const response = await apiRequest<{ applications: PaginatedResponse<ProjectApplication> }>(
    `/applications/received?page=${page}`,
  );
  return response.applications;
}

export async function rejectProjectApplication(id: string | number) {
  const response = await apiRequest<{
    message: string;
    application: ProjectApplication;
  }>(`/applications/${id}/reject`, { method: 'POST' });
  return response.application;
}
