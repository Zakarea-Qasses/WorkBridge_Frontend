import { apiRequest } from '@/app/api/client';

import type { PaginatedResponse, Conversation, Contract, Report } from '../../types';

export type { Contract } from '../../types';

function unwrapList<T>(value: T[] | PaginatedResponse<T>) {
  return Array.isArray(value) ? value : value.data;
}

export function cancelContract(id: number) {
  return apiRequest(`/contracts/${id}/cancel`, { method: 'POST' });
}

export function completeContract(id: number) {
  return apiRequest(`/contracts/${id}/complete`, { method: 'POST' });
}

export async function getCompanyContracts() {
  const response = await apiRequest<{ contracts: Contract[] | PaginatedResponse<Contract> }>(
    '/company/contracts',
  );
  return unwrapList(response.contracts);
}

export async function getContracts() {
  const response = await apiRequest<{ contracts: Contract[] | PaginatedResponse<Contract> }>(
    '/contracts',
  );
  return unwrapList(response.contracts);
}

export function startContract(id: number) {
  return apiRequest(`/contracts/${id}/start`, { method: 'POST' });
}

export async function createContractDispute(
  contractId: number,
  payload: { description: string; attachments: File[] },
) {
  const formData = new FormData();
  formData.append('target_type', 'contract');
  formData.append('target_id', String(contractId));
  formData.append('contract_id', String(contractId));
  formData.append('category', 'dispute');
  formData.append('priority', 'high');
  formData.append('title', `Contract #${contractId} dispute`);
  formData.append('description', payload.description);
  payload.attachments.forEach((file) => formData.append('attachments[]', file));

  const response = await apiRequest<{ message: string; report: Report }>('/reports', {
    method: 'POST',
    body: formData,
  });
  return response.report;
}

export async function startConversation(userId: number) {
  const response = await apiRequest<{ message: string; conversation: Conversation }>(
    '/conversations/start',
    { method: 'POST', body: { user_id: userId } },
  );
  return response.conversation;
}
