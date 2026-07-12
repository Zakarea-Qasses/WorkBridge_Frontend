import { apiRequest } from '@/app/api/client';

import type { PaginatedResponse, Conversation, Contract } from '../../types';

export type { Contract, PaginatedResponse } from '../../types';

export function cancelContract(id: number) {
  return apiRequest(`/contracts/${id}/cancel`, { method: 'POST' });
}

export function completeContract(id: number) {
  return apiRequest(`/contracts/${id}/complete`, { method: 'POST' });
}

export async function getCompanyContractsPage(page = 1) {
  const response = await apiRequest<{ contracts: PaginatedResponse<Contract> }>(
    `/company/contracts?page=${page}`,
  );
  return response.contracts;
}

export function startContract(id: number) {
  return apiRequest(`/contracts/${id}/start`, { method: 'POST' });
}

export async function startConversation(userId: number) {
  const response = await apiRequest<{ message: string; conversation: Conversation }>(
    '/conversations/start',
    { method: 'POST', body: { user_id: userId } },
  );
  return response.conversation;
}
