import { apiRequest } from '@/app/api/client';

import type { PaginatedResponse, Wallet, WalletRequestType, WalletRequestStatus, WalletRequest } from '../../types';

export type { WalletRequest, WalletRequestStatus, WalletRequestType } from '../../types';

export async function approveWalletRequest(id: string | number, admin_note?: string | null) {
  const response = await apiRequest<{ status: boolean; message: string; request: WalletRequest }>(
    `/admin/wallet-requests/${id}/approve`,
    { method: 'POST', body: { admin_note } },
  );
  return response.request;
}

export async function getAdminWalletRequests(params?: {
  page?: number;
  type?: WalletRequestType | '';
  status?: WalletRequestStatus | '';
  search?: string;
}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const response = await apiRequest<{ status: boolean; requests: PaginatedResponse<WalletRequest> }>(
    `/admin/wallet-requests${query.toString() ? `?${query.toString()}` : ''}`,
  );
  return response.requests;
}

export async function rejectWalletRequest(id: string | number, admin_note?: string | null) {
  const response = await apiRequest<{ status: boolean; message: string; request: WalletRequest }>(
    `/admin/wallet-requests/${id}/reject`,
    { method: 'POST', body: { admin_note } },
  );
  return response.request;
}
