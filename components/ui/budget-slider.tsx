'use client';

import {
  BUDGET_MAX,
  BUDGET_MIN,
  formatRupees,
  getBudgetBand,
} from '@/lib/session/budget';
import { budgetCopy } from '@/lib/copy/onboarding';

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

export function BudgetSlider({
  value,
  onChange,
  step = 500,
}: BudgetSliderProps) {
  const band = getBudgetBand(value);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-serif text-5xl font-medium text-ink sm:text-6xl">
          {formatRupees(value)}
        </span>
        <span className="text-[11px] uppercase tracking-[0.24em] text-bindi">
          {budgetCopy.bandLabels[band]}
        </span>
      </div>
      <input
        type="range"
        min={BUDGET_MIN}
        max={BUDGET_MAX}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="zarf-range w-full"
        aria-label="budget"
      />
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span>{formatRupees(BUDGET_MIN)}</span>
        <span className="italic text-muted/80">{budgetCopy.hint}</span>
        <span>{formatRupees(BUDGET_MAX)}+</span>
      </div>
    </div>
  );
}
