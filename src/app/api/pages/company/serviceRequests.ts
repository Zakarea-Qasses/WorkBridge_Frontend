import { apiRequest } from '@/app/api/client';

import type { Service, ServiceRequest, PaginatedResponse } from '../../types';

export type { PaginatedResponse, ServiceRequest } from '../../types';

export async function getMyServiceRequestsPage(page = 1) {
  const response = await apiRequest<{
    requests: PaginatedResponse<ServiceRequest>;
  }>(`/service-requests/my?page=${page}`);
  return response.requests;
}
