export const WALLET_PAYMENT_METHODS = [
  { value: 'sham_cash', labelAr: 'شام كاش', labelEn: 'Sham Cash' },
  { value: 'al_haram', labelAr: 'الهرم', labelEn: 'Al Haram' },
  { value: 'syriatel_cash', labelAr: 'سيرياتل كاش', labelEn: 'Syriatel Cash' },
] as const;

export type WalletPaymentMethod = (typeof WALLET_PAYMENT_METHODS)[number]['value'];

export const DEFAULT_WALLET_PAYMENT_METHOD: WalletPaymentMethod = 'sham_cash';

export function getWalletPaymentMethodLabel(method: WalletPaymentMethod, isEnglish = false) {
  const selectedMethod =
    WALLET_PAYMENT_METHODS.find((paymentMethod) => paymentMethod.value === method) || WALLET_PAYMENT_METHODS[0];

  return isEnglish ? selectedMethod.labelEn : selectedMethod.labelAr;
}

export function buildWalletRequestText(method: WalletPaymentMethod, note: string, isEnglish = false) {
  const methodLabel = getWalletPaymentMethodLabel(method, isEnglish);
  const trimmedNote = note.trim();
  const methodLine = isEnglish ? `Payment method: ${methodLabel}` : `طريقة العملية: ${methodLabel}`;

  return trimmedNote ? `${methodLine}\n${trimmedNote}` : methodLine;
}
