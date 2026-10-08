import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateId(prefix: string = "id"): string {
  const randomPart = Math.random().toString(36).substring(2, 9);
  const timestampPart = Date.now().toString(36);
  return `${prefix}_${timestampPart}${randomPart}`;
}
