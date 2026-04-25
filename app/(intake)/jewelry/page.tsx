'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TileSelect } from '@/components/ui/tile-select';
import { intakeNav, jewelryCopy, type JewelryLean } from '@/lib/copy/intake';
import { useIntake } from '@/lib/intake/store';

export default function JewelryPage() {
  const router = useRouter();
  const stored = useIntake((s) => s.jewelryLean);
  const setJewelryLean = useIntake((s) => s.setJewelryLean);
  const [value, setValue] = useState<JewelryLean | null>(stored ?? null);
  const ready = value !== null;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {jewelryCopy.stepLabel}
        </p>
        <h1 className="font-serif text-[clamp(1.875rem,6vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          {jewelryCopy.heading}
        </h1>
        <p className="text-base text-muted">{jewelryCopy.subhead}</p>
      </section>

      <TileSelect
        options={jewelryCopy.options}
        value={value}
        onChange={setValue}
      />

      <div className="pt-2">
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            if (!ready || value === null) return;
            setJewelryLean(value);
            router.push('/draping');
          }}
          className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-bindi px-7 py-5 text-lg font-medium text-cream shadow-[0_10px_30px_-12px_rgba(92,14,24,0.45)] transition-all duration-300 hover:bg-bindi-deep hover:shadow-[0_14px_34px_-10px_rgba(92,14,24,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-bindi"
        >
          <span>{intakeNav.continue}</span>
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
