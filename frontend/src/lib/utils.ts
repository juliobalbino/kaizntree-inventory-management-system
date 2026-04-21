export function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const PHONE_REGEX = /^\d{2} \d{5}-\d{4}$/;

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').substring(0, 11);
  const matched = digits.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  if (!matched) return digits;

  const [, area, main, rest] = matched;
  let result = area;
  if (main) result += ` ${main}`;
  if (rest) result += `-${rest}`;
  return result;
}

export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '');
}
