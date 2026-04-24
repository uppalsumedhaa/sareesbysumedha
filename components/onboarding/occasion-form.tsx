'use client';

import { useEffect } from 'react';
import { TileSelect } from '@/components/ui/tile-select';
import { BudgetSlider } from '@/components/ui/budget-slider';
import {
  budgetCopy,
  navCopy,
  occasionCopy,
  reuseCopy,
  weddingRoleCopy,
} from '@/lib/copy/onboarding';
import { useSession } from '@/lib/session/store';
import type { Occasion } from '@/lib/session/types';

const DEFAULT_BUDGET = 8000;

function isWedding(o: Occasion | undefined): boolean {
  return o === 'wedding';
}

interface OccasionFormProps {
  onContinue: () => void;
}

export function OccasionForm({ onContinue }: OccasionFormProps) {
  const {
    occasion,
    weddingRole,
    reuseIntent,
    budget,
    setOccasion,
    setWeddingRole,
    setReuseIntent,
    setBudget,
  } = useSession();

  useEffect(() => {
    if (budget === undefined) {
      setBudget(DEFAULT_BUDGET);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weddingSelected = isWedding(occasion);
  const ready =
    !!occasion &&
    !!reuseIntent &&
    budget !== undefined &&
    (!weddingSelected || !!weddingRole);

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Q1 — occasion */}
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.875rem,6vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
            {occasionCopy.heading}
          </h1>
          <p className="mt-2 text-base text-muted">{occasionCopy.subhead}</p>
        </div>
        <TileSelect
          options={occasionCopy.options}
          value={occasion ?? null}
          onChange={setOccasion}
        />
      </section>

      {/* Q2 — wedding role (conditional) */}
      {weddingSelected && (
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-[clamp(1.5rem,4.5vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
            {weddingRoleCopy.heading}
          </h2>
          <TileSelect
            options={weddingRoleCopy.options}
            value={weddingRole ?? null}
            onChange={setWeddingRole}
            columns={2}
          />
        </section>
      )}

      {/* Q3 — reuse intent */}
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-[clamp(1.5rem,4.5vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
          {reuseCopy.heading}
        </h2>
        <TileSelect
          options={reuseCopy.options}
          value={reuseIntent ?? null}
          onChange={setReuseIntent}
        />
      </section>

      {/* Q4 — budget */}
      <section className="flex flex-col gap-5">
        <h2 className="font-serif text-[clamp(1.5rem,4.5vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
          {budgetCopy.heading}
        </h2>
        <BudgetSlider
          value={budget ?? DEFAULT_BUDGET}
          onChange={setBudget}
        />
      </section>

      {/* Continue */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!ready}
          onClick={() => ready && onContinue()}
          className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-bindi px-7 py-5 text-lg font-medium text-cream shadow-[0_10px_30px_-12px_rgba(92,14,24,0.45)] transition-all duration-300 hover:bg-bindi-deep hover:shadow-[0_14px_34px_-10px_rgba(92,14,24,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-bindi"
        >
          <span>{navCopy.continue}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-disabled:group-hover:translate-x-0"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
