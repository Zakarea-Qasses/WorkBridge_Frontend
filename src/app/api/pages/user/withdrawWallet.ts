import { apiRequest } from '@/app/api/client';

import type { Wallet, WalletRequest } from '../../types';

export async function getMyWallet() {
  const response = await apiRequest<{ status: boolean; wallet: Wallet }>('/wallet');
  return response.wallet;
}

export async function requestWalletWithdraw(amount: number, withdrawal_details: string) {
  const response = await apiRequest<{ status: boolean; message: string; request: WalletRequest }>(
    '/wallet/withdraw-requests',
    { method: 'POST', body: { amount, withdrawal_details } },
  );
  return response.request;
}
