'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatRupees, getBudgetBand } from '@/lib/session/budget';
import {
  budgetCopy,
  climateCopy,
  moodTiles,
  occasionCopy,
  reuseCopy,
  resultsCopy,
  stylingCopy,
  vetoColors,
  vibeCopy,
  weddingRoleCopy,
} from '@/lib/copy/onboarding';
import { useSession } from '@/lib/session/store';

function formatMonth(yyyymm: string | undefined): string | undefined {
  if (!yyyymm) return undefined;
  const [y, m] = yyyymm.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toLowerCase();
}

function labelFrom<V extends string>(
  options: ReadonlyArray<{ value: V; label: string }>,
  value: V | undefined,
): string | undefined {
  if (!value) return undefined;
  return options.find((o) => o.value === value)?.label;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-t border-ink/10 py-4 sm:grid-cols-[8rem_1fr]">
      <dt className="text-xs uppercase tracking-[0.22em] text-muted">
        {label}
      </dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

export function SessionSummary() {
  // Zustand's persist middleware rehydrates from localStorage on the client.
  // Wait for hydration before rendering so we don't flash the SSR empty state.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const session = useSession();
  const {
    occasion,
    weddingRole,
    reuseIntent,
    budget,
    location,
    eventMonth,
    venueType,
    duration,
    moods,
    tradContempLevel,
    colorVetoes,
    undertone,
    suggestedPalette,
    blousePreference,
    drapeStyle,
    accessoriesVibe,
    reset,
  } = session;

  if (!hydrated) {
    return <div className="h-[60vh]" />;
  }

  const isEmpty =
    !occasion &&
    !reuseIntent &&
    budget === undefined &&
    !location &&
    !moods?.length &&
    !blousePreference;

  if (isEmpty) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <h1 className="font-serif text-[clamp(2rem,7vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          {resultsCopy.emptyHeading}
        </h1>
        <p className="text-base text-muted sm:text-lg">
          {resultsCopy.emptyBody}
        </p>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-bindi px-7 py-5 text-lg font-medium text-cream shadow-[0_10px_30px_-12px_rgba(92,14,24,0.45)] transition-all duration-300 hover:bg-bindi-deep hover:shadow-[0_14px_34px_-10px_rgba(92,14,24,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:w-auto sm:self-start"
        >
          {resultsCopy.emptyCta}
        </Link>
      </div>
    );
  }

  const occasionLabel = labelFrom(occasionCopy.options, occasion);
  const roleLabel = labelFrom(weddingRoleCopy.options, weddingRole);
  const reuseLabel = labelFrom(reuseCopy.options, reuseIntent);
  const venueLabel = labelFrom(climateCopy.venueOptions, venueType);
  const durationLabel = labelFrom(climateCopy.durationOptions, duration);
  const tradContempLabel = labelFrom(
    vibeCopy.tradContempOptions,
    tradContempLevel,
  );
  const blouseLabel = labelFrom(stylingCopy.blouseOptions, blousePreference);
  const drapeLabel = labelFrom(stylingCopy.drapeOptions, drapeStyle);
  const accessoriesLabel = labelFrom(
    stylingCopy.accessoriesOptions,
    accessoriesVibe,
  );
  const moodLabels = (moods ?? [])
    .map((m) => moodTiles.find((t) => t.value === m)?.label)
    .filter(Boolean) as string[];
  const vetoLabels = (colorVetoes ?? [])
    .map((c) => vetoColors.find((v) => v.value === c))
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-10 pb-16">
      <div>
        <h1 className="font-serif text-[clamp(2rem,7vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          {resultsCopy.heading}
        </h1>
        <p className="mt-3 text-base text-muted sm:text-lg">
          {resultsCopy.subhead}
        </p>
      </div>

      <dl className="flex flex-col">
        {occasionLabel && (
          <Row label="for">
            {occasionLabel}
            {roleLabel ? `, as the ${roleLabel}` : ''}
          </Row>
        )}
        {reuseLabel && <Row label="reuse">{reuseLabel}</Row>}
        {budget !== undefined && (
          <Row label="budget">
            {formatRupees(budget)}{' '}
            <span className="ml-2 text-xs uppercase tracking-[0.22em] text-muted">
              {budgetCopy.bandLabels[getBudgetBand(budget)]}
            </span>
          </Row>
        )}
        {(location || eventMonth) && (
          <Row label="where / when">
            {[location?.trim(), formatMonth(eventMonth)]
              .filter(Boolean)
              .join(', ')}
          </Row>
        )}
        {(venueLabel || durationLabel) && (
          <Row label="venue">
            {[venueLabel, durationLabel].filter(Boolean).join(' · ')}
          </Row>
        )}
        {moodLabels.length > 0 && (
          <Row label="vibe">{moodLabels.join(' · ')}</Row>
        )}
        {tradContempLabel && (
          <Row label="trad vs contemp">{tradContempLabel}</Row>
        )}
        {undertone && suggestedPalette?.length ? (
          <Row label="your colors">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-[0.22em] text-bindi">
                {undertone}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPalette.map((hex) => (
                  <span
                    key={hex}
                    className="inline-block h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgba(28,20,18,0.08)]"
                    style={{ backgroundColor: hex }}
                    aria-label={hex}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </Row>
        ) : null}
        {vetoLabels.length > 0 && (
          <Row label="avoid">
            <div className="flex flex-wrap items-center gap-2">
              {vetoLabels.map((c) => (
                <span
                  key={c!.value}
                  className="inline-flex items-center gap-1.5 text-sm"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: c!.hex }}
                  />
                  {c!.label}
                </span>
              ))}
            </div>
          </Row>
        )}
        {blouseLabel && <Row label="blouse">{blouseLabel}</Row>}
        {drapeLabel && <Row label="drape">{drapeLabel}</Row>}
        {accessoriesLabel && (
          <Row label="accessories">{accessoriesLabel}</Row>
        )}
        <div className="border-t border-ink/10" />
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-full border border-ink/20 px-7 py-4 text-base text-ink transition-colors hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 sm:w-auto"
        >
          back to home
        </Link>
        <button
          type="button"
          onClick={() => {
            reset();
            window.location.href = '/';
          }}
          className="inline-flex w-full items-center justify-center rounded-full border border-ink/20 px-7 py-4 text-base text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 sm:w-auto"
        >
          {resultsCopy.restartCta}
        </button>
      </div>
    </div>
  );
}
