import { apiRequest } from '@/app/api/client';

import type { Service, ServiceRequest, PaginatedResponse, Conversation, Contract } from '../../types';

export type { ServiceRequest } from '../../types';

function unwrapList<T>(value: T[] | PaginatedResponse<T>) {
  return Array.isArray(value) ? value : value.data;
}

export function acceptServiceRequest(id: string | number) {
  return apiRequest<{
    message: string;
    service_request: ServiceRequest;
    contract: Contract;
    rejected_request_ids: number[];
  }>(`/service-requests/${id}/accept`, { method: 'POST' });
}

export async function getMyServiceRequests() {
  const response = await apiRequest<{
    requests: ServiceRequest[] | PaginatedResponse<ServiceRequest>;
  }>('/service-requests/my');
  return unwrapList(response.requests);
}

export async function getReceivedServiceRequests() {
  const response = await apiRequest<{
    requests: ServiceRequest[] | PaginatedResponse<ServiceRequest>;
  }>('/service-requests/received');
  return unwrapList(response.requests);
}

export function rejectServiceRequest(id: string | number) {
  return apiRequest(`/service-requests/${id}/reject`, { method: 'POST' });
}

export async function startConversation(userId: number) {
  const response = await apiRequest<{ message: string; conversation: Conversation }>(
    '/conversations/start',
    { method: 'POST', body: { user_id: userId } },
  );
  return response.conversation;
}
