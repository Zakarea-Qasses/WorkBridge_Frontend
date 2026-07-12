import { apiRequest } from '@/app/api/client';

import type { Service, ServiceRequest, PaginatedResponse } from '../../types';

export type { Service, ServiceRequest } from '../../types';

function unwrapList<T>(value: T[] | PaginatedResponse<T>) {
  return Array.isArray(value) ? value : value.data;
}

export async function getMyServiceRequests() {
  const response = await apiRequest<{
    requests: ServiceRequest[] | PaginatedResponse<ServiceRequest>;
  }>('/service-requests/my');
  return unwrapList(response.requests);
}

export async function getService(id: string | number) {
  const response = await apiRequest<{ service: Service }>(`/services/${id}`);
  return response.service;
}

export function requestService(
  serviceId: string | number,
  payload: { title: string; description: string; references?: string | null; delivery_days: number },
) {
  return apiRequest<{ message: string; service_request: ServiceRequest }>(
    `/services/${serviceId}/requests`,
    { method: 'POST', body: payload },
  );
}
