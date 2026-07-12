import { apiRequest } from '@/app/api/client';

import type { Wallet, WalletRequest } from '../../types';

export async function requestWalletDeposit(
  amount: number,
  payment_note?: string | null,
  deposit_receipt?: File | null,
  deposit_proof?: string | null,
) {
  const body = new FormData();
  body.append('amount', String(amount));
  if (payment_note) body.append('payment_note', payment_note);
  if (deposit_proof) body.append('deposit_proof', deposit_proof);
  if (deposit_receipt) body.append('deposit_receipt', deposit_receipt);

  const response = await apiRequest<{ status: boolean; message: string; request: WalletRequest }>(
    '/wallet/deposit-requests',
    { method: 'POST', body },
  );
  return response.request;
}
