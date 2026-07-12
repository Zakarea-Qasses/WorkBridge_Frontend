import { apiRequest } from '@/app/api/client';

import type { WalletTransaction, Wallet, AdminEarningsResponse } from '../../types';

export type { Wallet, WalletTransaction } from '../../types';

export async function getAdminEarnings() {
  return apiRequest<AdminEarningsResponse>('/admin/earnings');
}

export async function getAdminTransactionsWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/admin/transactions');
  return response.wallet;
}

export async function getAdminWallets() {
  const response = await apiRequest<{ status: boolean; wallets: Wallet[] }>('/admin/wallets');
  return response.wallets;
}

export async function getEscrowTransactionsWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/admin/escrow/transactions');
  return response.wallet;
}
