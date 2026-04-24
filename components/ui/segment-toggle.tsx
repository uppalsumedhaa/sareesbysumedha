'use client';

import { useId } from 'react';

interface SegmentOption<V extends string> {
  value: V;
  label: string;
}

interface SegmentToggleProps<V extends string> {
  options: ReadonlyArray<SegmentOption<V>>;
  value: V | null | undefined;
  onChange: (value: V) => void;
  name?: string;
}

export function SegmentToggle<V extends string>({
  options,
  value,
  onChange,
  name,
}: SegmentToggleProps<V>) {
  const groupId = useId();
  const groupName = name ?? `segment-${groupId}`;

  return (
    <div
      role="radiogroup"
      className="inline-flex w-full items-stretch gap-1 rounded-full border border-ink/15 p-1"
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={[
              'flex-1 cursor-pointer rounded-full px-3 py-2.5 text-center text-sm transition-all duration-200',
              selected
                ? 'bg-bindi text-cream shadow-[0_4px_14px_-6px_rgba(142,25,41,0.45)]'
                : 'text-ink hover:bg-ink/[0.04]',
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
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
