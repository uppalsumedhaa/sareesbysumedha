'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { intakeNav, whereCopy } from '@/lib/copy/intake';
import { useIntake } from '@/lib/intake/store';

export default function WherePage() {
  const router = useRouter();
  const useCase = useIntake((s) => s.useCase);
  const storedCity = useIntake((s) => s.city);
  const storedMonth = useIntake((s) => s.month);
  const setLocation = useIntake((s) => s.setLocation);
  const monthLabel = useCase
    ? whereCopy.monthLabelByUseCase[useCase]
    : whereCopy.monthLabelByUseCase.default;

  const [city, setCity] = useState(storedCity ?? '');
  const [month, setMonth] = useState<number | null>(storedMonth ?? null);
  const ready = city.trim().length >= 2 && month !== null;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {whereCopy.stepLabel}
        </p>
        <h1 className="font-serif text-[clamp(1.875rem,6vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          {whereCopy.heading}
        </h1>
        <p className="text-base text-muted">{whereCopy.subhead}</p>
      </section>

      <section className="flex flex-col gap-3">
        <label htmlFor="city" className="text-sm text-ink/80">
          {whereCopy.cityLabel}
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={whereCopy.cityPlaceholder}
          autoComplete="address-level2"
          autoCapitalize="off"
          spellCheck={false}
          className="rounded-2xl border border-ink/15 bg-white px-5 py-4 text-base text-ink placeholder:text-muted/70 transition-colors duration-200 focus:border-bindi focus:outline-none focus:ring-1 focus:ring-bindi"
        />
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-sm text-ink/80">{monthLabel}</p>
        <div
          role="radiogroup"
          aria-label={monthLabel}
          className="grid grid-cols-4 gap-2 sm:grid-cols-6"
        >
          {whereCopy.monthOptions.map((m) => {
            const selected = month === m.value;
            return (
              <button
                key={m.value}
                role="radio"
                aria-checked={selected}
                type="button"
                onClick={() => setMonth(m.value)}
                className={[
                  'rounded-xl border px-2 py-2.5 text-sm transition-all duration-200',
                  selected
                    ? 'border-bindi bg-bindi/[0.04] text-ink ring-1 ring-bindi shadow-[0_4px_16px_-8px_rgba(142,25,41,0.25)]'
                    : 'border-ink/15 text-ink hover:border-ink/40 hover:bg-ink/[0.02]',
                ].join(' ')}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="pt-2">
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            if (!ready || month === null) return;
            setLocation(city.trim(), month);
            router.push('/time-of-day');
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
