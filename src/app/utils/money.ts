export function sanitizeMoneyInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole, ...decimalParts] = cleaned.split('.');
  const decimal = decimalParts.join('').slice(0, 2);

  if (decimalParts.length > 0) {
    return `${whole}.${decimal}`;
  }

  return whole;
}

export function parsePositiveMoney(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function formatUsd(value: number | string | null | undefined, locale: 'en' | 'ar') {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return locale === 'en' ? 'Unavailable' : 'غير متاح';
  }

  return `$${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
