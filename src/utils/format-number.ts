// src/lib/format.ts
export function formatRON(value: number): string {
  if (value == null || isNaN(value as any)) return '0 RON';

  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
