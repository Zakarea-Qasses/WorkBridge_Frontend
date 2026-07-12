import { apiRequest } from '@/app/api/client';

import type { PaginatedResponse, WalletTransaction, Wallet, WalletRequest } from '../../types';

export type { Wallet, WalletRequest, WalletTransaction } from '../../types';

export async function getMyWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/wallet');
  return response.wallet;
}

export async function getMyWalletRequests(page = 1) {
  const response = await apiRequest<{ status: boolean; requests: PaginatedResponse<WalletRequest> }>(
    `/wallet/requests?page=${page}`,
  );
  return response.requests;
}
