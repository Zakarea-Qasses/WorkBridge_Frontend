import { apiRequest } from '@/app/api/client';

import type { WalletTransaction, Wallet } from '../../types';

export type { Wallet, WalletTransaction } from '../../types';

export async function getAdminTransactionsWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/admin/transactions');
  return response.wallet;
}

export async function getEscrowTransactionsWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/admin/escrow/transactions');
  return response.wallet;
}
