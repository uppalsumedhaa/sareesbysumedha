import type { BudgetBand } from './types';

export const BUDGET_MIN = 1000;
export const BUDGET_MAX = 200000;

export function getBudgetBand(value: number): BudgetBand {
  if (value <= 5000) return 'everyday';
  if (value <= 15000) return 'mid';
  if (value <= 50000) return 'premium';
  return 'heirloom';
}

export function formatRupees(value: number): string {
  if (value >= 100000) {
    const lakhs = value / 100000;
    const rounded = Number.isInteger(lakhs) ? lakhs.toFixed(0) : lakhs.toFixed(1);
    return `₹${rounded}L`;
  }
  if (value >= 1000) {
    return `₹${Math.round(value / 1000)}K`;
  }
  return `₹${value}`;
}
