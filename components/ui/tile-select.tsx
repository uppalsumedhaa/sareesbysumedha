'use client';

import { useId } from 'react';

export interface TileOption<V extends string> {
  value: V;
  label: string;
  hint?: string;
}

interface TileSelectProps<V extends string> {
  options: ReadonlyArray<TileOption<V>>;
  value: V | null | undefined;
  onChange: (value: V) => void;
  name?: string;
  columns?: 1 | 2;
}

export function TileSelect<V extends string>({
  options,
  value,
  onChange,
  name,
  columns = 1,
}: TileSelectProps<V>) {
  const groupId = useId();
  const groupName = name ?? `tile-${groupId}`;
  const gridClass = columns === 2 ? 'sm:grid-cols-2' : '';

  return (
    <div
      role="radiogroup"
      className={`grid grid-cols-1 gap-2.5 ${gridClass}`}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={[
              'relative flex cursor-pointer items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-200',
              selected
                ? 'border-bindi bg-bindi/[0.04] ring-1 ring-bindi shadow-[0_4px_16px_-8px_rgba(142,25,41,0.25)]'
                : 'border-ink/15 hover:border-ink/40 hover:bg-ink/[0.02]',
            ].join(' ')}
          >
            <input
              type="radio"
              role="radio"
              className="sr-only"
              name={groupName}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
            />
            <span className="flex-1">
              <span className="block text-base text-ink">{opt.label}</span>
              {opt.hint && (
                <span className="mt-0.5 block text-sm text-muted">
                  {opt.hint}
                </span>
              )}
            </span>
            <span
              aria-hidden="true"
              className={[
                'h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-200',
                selected
                  ? 'scale-100 bg-bindi'
                  : 'scale-75 bg-transparent ring-1 ring-ink/25',
              ].join(' ')}
            />
          </label>
        );
      })}
    </div>
  );
}
