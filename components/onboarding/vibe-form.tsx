'use client';

import { TileSelect } from '@/components/ui/tile-select';
import {
  moodTiles,
  navCopy,
  vetoColors,
  vibeCopy,
} from '@/lib/copy/onboarding';
import { MAX_MOODS, useSession } from '@/lib/session/store';
import type { Mood, VetoColor } from '@/lib/session/types';

interface VibeFormProps {
  onContinue: () => void;
}

export function VibeForm({ onContinue }: VibeFormProps) {
  const {
    moods,
    tradContempLevel,
    colorVetoes,
    toggleMood,
    setTradContempLevel,
    toggleColorVeto,
  } = useSession();

  const selectedMoods = moods ?? [];
  const selectedVetoes = colorVetoes ?? [];
  const atMoodCap = selectedMoods.length >= MAX_MOODS;

  const ready = selectedMoods.length >= 1 && !!tradContempLevel;

  return (
    <div className="flex flex-col gap-14 pb-16">
      {/* Page heading */}
      <div>
        <h1 className="font-serif text-[clamp(2rem,7vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          {vibeCopy.heading}
        </h1>
        <p className="mt-2 text-base text-muted">{vibeCopy.subhead}</p>
      </div>

      {/* Mood grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.22em] text-muted">
            {vibeCopy.moodSectionLabel}
          </span>
          <span className="text-xs tabular-nums text-muted/70">
            {selectedMoods.length} {vibeCopy.moodCountSuffix}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {moodTiles.map((tile) => {
            const selected = selectedMoods.includes(tile.value);
            const muted = atMoodCap && !selected;
            return (
              <button
                key={tile.value}
                type="button"
                onClick={() => toggleMood(tile.value)}
                aria-pressed={selected}
                disabled={muted}
                className={[
                  'group relative aspect-square overflow-hidden rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                  selected
                    ? 'scale-100 ring-2 ring-bindi ring-offset-2 ring-offset-cream'
                    : muted
                      ? 'opacity-35'
                      : 'hover:scale-[0.98]',
                ].join(' ')}
                style={{ background: tile.bg }}
              >
                <span
                  className={[
                    'absolute inset-0 flex items-end justify-start p-4 text-left font-serif text-lg leading-tight tracking-tight',
                    tile.fg === 'cream' ? 'text-cream' : 'text-ink',
                  ].join(' ')}
                >
                  {tile.label}
                </span>
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-bindi text-cream shadow-[0_2px_6px_rgba(92,14,24,0.4)]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Trad-contemp */}
      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-[clamp(1.5rem,4.5vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
          {vibeCopy.tradContempHeading}
        </h2>
        <TileSelect
          options={vibeCopy.tradContempOptions}
          value={tradContempLevel ?? null}
          onChange={setTradContempLevel}
        />
      </section>

      {/* Color vetoes */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-[clamp(1.5rem,4.5vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
            {vibeCopy.colorHeading}
          </h2>
          <p className="mt-1 text-sm text-muted">{vibeCopy.colorSubhead}</p>
        </div>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
          {vetoColors.map((c) => {
            const vetoed = selectedVetoes.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => toggleColorVeto(c.value)}
                aria-label={`veto ${c.label}`}
                aria-pressed={vetoed}
                className={[
                  'relative aspect-square rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                  vetoed
                    ? 'ring-2 ring-bindi ring-offset-2 ring-offset-cream'
                    : 'hover:scale-105',
                  c.value === 'white' ? 'border border-ink/15' : '',
                ].join(' ')}
                style={{ backgroundColor: c.hex }}
              >
                {vetoed && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={c.value === 'white' || c.value === 'yellow' ? '#1C1412' : '#F0E3C4'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
