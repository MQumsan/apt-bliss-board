export const CURRENCY = 'OMR';
export const CURRENCY_AR = 'ر.ع.';

export function formatCurrency(amount: number, lang: 'en' | 'ar' = 'en'): string {
  return `${amount.toLocaleString('en', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${lang === 'ar' ? CURRENCY_AR : CURRENCY}`;
}
