'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { budgetCopy } from '@/lib/copy/intake';
import { useIntake } from '@/lib/intake/store';

const inrFormat = new Intl.NumberFormat('en-IN');

export default function BudgetPage() {
  const router = useRouter();
  const stored = useIntake((s) => s.budgetInr);
  const setBudget = useIntake((s) => s.setBudget);
  const [value, setValue] = useState<number>(stored ?? budgetCopy.default);

  const { min, max, step } = budgetCopy;
  const percent = ((value - min) / (max - min)) * 100;
  const trackBg = `linear-gradient(to right, rgb(142, 25, 41) 0%, rgb(142, 25, 41) ${percent}%, rgba(28, 20, 18, 0.12) ${percent}%, rgba(28, 20, 18, 0.12) 100%)`;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {budgetCopy.stepLabel}
        </p>
        <h1 className="font-serif text-[clamp(1.875rem,6vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          {budgetCopy.heading}
        </h1>
        <p className="text-base text-muted">{budgetCopy.subhead}</p>
      </section>

      <section className="flex flex-col items-center gap-6 py-4">
        <div className="flex items-baseline gap-1 font-serif text-bindi">
          <span className="text-2xl">₹</span>
          <span className="text-5xl font-medium tracking-tight">
            {inrFormat.format(value)}
          </span>
          {value >= max && <span className="text-2xl">+</span>}
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label={budgetCopy.heading}
          style={{ background: trackBg }}
          className="h-2 w-full appearance-none rounded-full outline-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-cream
            [&::-webkit-slider-thumb]:bg-bindi
            [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(142,25,41,0.4)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-cream
            [&::-moz-range-thumb]:bg-bindi
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(142,25,41,0.4)]"
        />

        <div className="flex w-full justify-between text-xs text-muted">
          <span>₹{inrFormat.format(min)}</span>
          <span>₹{inrFormat.format(max)}+</span>
        </div>
      </section>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            setBudget(value);
            router.push('/dev/results');
          }}
          className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-bindi px-7 py-5 text-lg font-medium text-cream shadow-[0_10px_30px_-12px_rgba(92,14,24,0.45)] transition-all duration-300 hover:bg-bindi-deep hover:shadow-[0_14px_34px_-10px_rgba(92,14,24,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <span>{budgetCopy.submitCta}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
