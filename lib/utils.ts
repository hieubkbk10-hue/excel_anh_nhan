import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: "compact",
    compactDisplay: "short"
  }).format(amount).replace('₫', '').trim() + ' tỷ';
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatInBillions(amount: number): string {
  const value = amount / 1_000_000_000;
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ' tỷ';
}

const GROUP_ORDER = ['ITO', 'UNI', 'G2B'];

export function sortGroups(a: string, b: string): number {
  const ia = GROUP_ORDER.indexOf(a);
  const ib = GROUP_ORDER.indexOf(b);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return a.localeCompare(b, 'vi-VN');
}