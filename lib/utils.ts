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
      style: 'decimal',
    }).format(amount);
  }