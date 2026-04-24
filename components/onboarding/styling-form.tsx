'use client';

import { TileSelect } from '@/components/ui/tile-select';
import { navCopy, stylingCopy } from '@/lib/copy/onboarding';
import { useSession } from '@/lib/session/store';

interface StylingFormProps {
  onContinue: () => void;
}

export function StylingForm({ onContinue }: StylingFormProps) {
  const {
    blousePreference,
    drapeStyle,
    accessoriesVibe,
    setBlousePreference,
    setDrapeStyle,
    setAccessoriesVibe,
  } = useSession();

  const ready = !!blousePreference && !!drapeStyle && !!accessoriesVibe;

  return (
    <div className="flex flex-col gap-12 pb-16">
      <div>
        <h1 className="font-serif text-[clamp(2rem,7vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          {stylingCopy.heading}
        </h1>
        <p className="mt-2 text-base text-muted">{stylingCopy.subhead}</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-[clamp(1.5rem,4.5vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
          {stylingCopy.blouseHeading}
        </h2>
        <TileSelect
          options={stylingCopy.blouseOptions}
          value={blousePreference ?? null}
          onChange={setBlousePreference}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-[clamp(1.5rem,4.5vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
          {stylingCopy.drapeHeading}
        </h2>
        <TileSelect
          options={stylingCopy.drapeOptions}
          value={drapeStyle ?? null}
          onChange={setDrapeStyle}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-[clamp(1.5rem,4.5vw,2.25rem)] font-medium leading-tight tracking-tight text-ink">
          {stylingCopy.accessoriesHeading}
        </h2>
        <TileSelect
          options={stylingCopy.accessoriesOptions}
          value={accessoriesVibe ?? null}
          onChange={setAccessoriesVibe}
        />
      </section>

      <div className="pt-2">
        <button
          type="button"
          disabled={!ready}
          onClick={() => ready && onContinue()}
          className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-bindi px-7 py-5 text-lg font-medium text-cream shadow-[0_10px_30px_-12px_rgba(92,14,24,0.45)] transition-all duration-300 hover:bg-bindi-deep hover:shadow-[0_14px_34px_-10px_rgba(92,14,24,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-bindi"
        >
          <span>{navCopy.finish}</span>
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
