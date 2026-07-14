import { apiRequest } from '@/app/api/client';

import type { WalletTransaction, Wallet } from '../../types';
import type { WalletPaymentMethod } from '@/app/utils/walletPaymentMethods';

export type { Wallet, WalletTransaction } from '../../types';

export async function getAdminTransactionsWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/admin/transactions');
  return response.wallet;
}

export async function getEscrowTransactionsWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/admin/escrow/transactions');
  return response.wallet;
}

export async function withdrawAdminEarnings(payload: {
  amount: number;
  payment_method: WalletPaymentMethod;
  recipient_account: string;
}) {
  return apiRequest<{
    status: boolean;
    message: string;
    transaction: WalletTransaction;
  }>('/admin/earnings/withdraw', {
    method: 'POST',
    body: payload,
  });
}
