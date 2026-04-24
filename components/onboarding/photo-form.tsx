'use client';

import { useEffect, useRef, useState } from 'react';
import { analyzePhotoStub } from '@/lib/color/analyze';
import { navCopy, photoCopy } from '@/lib/copy/onboarding';
import { useSession } from '@/lib/session/store';

type Mode = 'upload' | 'processing' | 'result';

interface PhotoFormProps {
  onContinue: () => void;
  onSkip: () => void;
}

export function PhotoForm({ onContinue, onSkip }: PhotoFormProps) {
  const {
    undertone,
    contrast,
    suggestedPalette,
    setColorAnalysis,
    clearColorAnalysis,
  } = useSession();

  const initialMode: Mode =
    undertone && suggestedPalette?.length ? 'result' : 'upload';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Revoke object URLs when the preview changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setMode('processing');
    try {
      const result = await analyzePhotoStub(file);
      setColorAnalysis(result);
      setMode('result');
    } catch {
      setMode('upload');
    }
  };

  const handleRetake = () => {
    clearColorAnalysis();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setMode('upload');
    // Nudge the input to re-open
    requestAnimationFrame(() => inputRef.current?.click());
  };

  if (mode === 'result' && undertone && suggestedPalette?.length) {
    return (
      <div className="flex flex-col gap-10 pb-16">
        <div className="flex items-start gap-4">
          {preview && (
            <img
              src={preview}
              alt=""
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
          )}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.22em] text-bindi">
              {photoCopy.undertoneLabels[undertone]}
              {contrast && (
                <span className="ml-2 text-muted/70">
                  · {photoCopy.contrastLabels[contrast]}
                </span>
              )}
            </span>
            <h1 className="font-serif text-[clamp(1.75rem,5.5vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.02em] text-ink">
              {photoCopy.resultHeading}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {suggestedPalette.map((hex) => (
            <div
              key={hex}
              className="aspect-square rounded-full shadow-[inset_0_0_0_1px_rgba(28,20,18,0.08)]"
              style={{ backgroundColor: hex }}
              aria-label={hex}
              title={hex}
            />
          ))}
        </div>

        <p className="text-sm italic text-muted">{photoCopy.resultHint}</p>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-bindi px-7 py-5 text-lg font-medium text-cream shadow-[0_10px_30px_-12px_rgba(92,14,24,0.45)] transition-all duration-300 hover:bg-bindi-deep hover:shadow-[0_14px_34px_-10px_rgba(92,14,24,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
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
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleRetake}
            className="inline-flex w-full items-center justify-center rounded-full border border-ink/20 px-7 py-4 text-base text-ink transition-colors hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            {photoCopy.retakeLabel}
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'processing') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 pb-16">
        {preview && (
          <img
            src={preview}
            alt=""
            className="h-32 w-32 rounded-3xl object-cover shadow-[0_20px_50px_-20px_rgba(28,20,18,0.35)]"
          />
        )}
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-10 w-10">
            <span className="absolute inset-0 rounded-full border-2 border-ink/10" />
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-bindi" />
          </div>
          <span className="font-serif text-lg text-ink">
            {photoCopy.processingLabel}
            <span className="inline-flex ml-1">
              <span className="animate-[pulse_1.4s_ease-in-out_infinite] text-bindi">.</span>
              <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite] text-bindi">.</span>
              <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite] text-bindi">.</span>
            </span>
          </span>
        </div>
      </div>
    );
  }

  // mode === 'upload'
  return (
    <div className="flex flex-col gap-10 pb-16">
      <div>
        <h1 className="font-serif text-[clamp(2rem,7vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          {photoCopy.entryHeading}
        </h1>
        <p className="mt-3 text-base text-muted sm:text-lg">
          {photoCopy.entrySubhead}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-bindi/40 bg-bindi/[0.03] px-6 py-14 text-center transition-all duration-200 hover:border-bindi/70 hover:bg-bindi/[0.06] focus-within:border-bindi focus-within:ring-2 focus-within:ring-bindi/30">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8E1929"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-9 w-9"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="font-serif text-xl text-ink">
            {photoCopy.uploadLabel}
          </span>
          <span className="text-sm text-muted">{photoCopy.uploadHint}</span>
        </label>

        <button
          type="button"
          onClick={onSkip}
          className="inline-flex w-full items-center justify-center rounded-full border border-ink/20 px-7 py-4 text-base text-ink transition-colors hover:bg-ink/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          {photoCopy.skipLabel}
        </button>
      </div>

      <p className="text-sm italic text-muted">{photoCopy.privacyNote}</p>
    </div>
  );
}
