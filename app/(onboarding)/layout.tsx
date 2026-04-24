import Link from 'next/link';
import { welcomeCopy, navCopy } from '@/lib/copy/onboarding';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh] bg-cream">
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          aria-label="back to start"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>{navCopy.back}</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-baseline font-serif text-xl lowercase tracking-tight text-ink"
          aria-label="zarf."
        >
          {welcomeCopy.wordmark}
          <span
            aria-hidden="true"
            className="ml-[0.06em] inline-block h-[0.16em] w-[0.16em] rounded-full bg-bindi"
          />
        </Link>
      </header>
      <main className="mx-auto max-w-prose px-6 pb-10 pt-10 sm:px-10 sm:pt-12">
        {children}
      </main>
    </div>
  );
}
