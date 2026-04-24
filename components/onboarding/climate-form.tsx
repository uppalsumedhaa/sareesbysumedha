'use client';

import { useEffect } from 'react';
import { SegmentToggle } from '@/components/ui/segment-toggle';
import { climateCopy, navCopy } from '@/lib/copy/onboarding';
import { useSession } from '@/lib/session/store';

function nextMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface ClimateFormProps {
  onContinue: () => void;
}

export function ClimateForm({ onContinue }: ClimateFormProps) {
  const {
    location,
    eventMonth,
    venueType,
    duration,
    setLocation,
    setEventMonth,
    setVenueType,
    setDuration,
  } = useSession();

  useEffect(() => {
    if (!eventMonth) setEventMonth(nextMonth());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ready =
    !!location && location.trim().length > 0 &&
    !!eventMonth &&
    !!venueType &&
    !!duration;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <div>
        <h1 className="font-serif text-[clamp(1.875rem,6vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          {climateCopy.heading}
        </h1>
        <p className="mt-2 text-base text-muted">{climateCopy.subhead}</p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.22em] text-muted">
          {climateCopy.locationLabel}
        </span>
        <input
          type="text"
          value={location ?? ''}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={climateCopy.locationPlaceholder}
          className="rounded-xl border border-ink/15 bg-transparent px-4 py-3 text-base text-ink placeholder:text-ink/30 transition-colors focus:border-bindi focus:outline-none focus:ring-1 focus:ring-bindi"
          autoComplete="address-level2"
          spellCheck={false}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.22em] text-muted">
          {climateCopy.whenLabel}
        </span>
        <input
          type="month"
          value={eventMonth ?? ''}
          onChange={(e) => setEventMonth(e.target.value)}
          className="rounded-xl border border-ink/15 bg-transparent px-4 py-3 text-base text-ink transition-colors focus:border-bindi focus:outline-none focus:ring-1 focus:ring-bindi"
        />
      </label>

      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.22em] text-muted">
          {climateCopy.venueLabel}
        </span>
        <SegmentToggle
          options={climateCopy.venueOptions}
          value={venueType ?? null}
          onChange={setVenueType}
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.22em] text-muted">
          {climateCopy.durationLabel}
        </span>
        <SegmentToggle
          options={climateCopy.durationOptions}
          value={duration ?? null}
          onChange={setDuration}
        />
      </div>

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
