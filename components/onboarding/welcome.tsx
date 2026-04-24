import Link from 'next/link';
import { welcomeCopy } from '@/lib/copy/onboarding';

export function Welcome() {
  return (
    <main className="relative flex min-h-[100svh] flex-col overflow-hidden bg-cream">
      {/* Big bindi: hero shape, anchored top-right, bleeding off canvas */}
      <div
        aria-hidden="true"
        className="animate-bindi pointer-events-none absolute right-[-24%] top-[-18%] z-0 h-[110vw] w-[110vw] sm:right-[-12%] sm:top-[-24%] sm:h-[64vw] sm:w-[64vw]"
      >
        <svg viewBox="0 0 400 400" className="h-full w-full">
          <defs>
            <radialGradient id="bindi-disc" cx="38%" cy="38%" r="72%">
              <stop offset="0%" stopColor="#A22139" />
              <stop offset="62%" stopColor="#8E1929" />
              <stop offset="100%" stopColor="#5C0E18" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="200" fill="url(#bindi-disc)" />
        </svg>
      </div>

      {/* Wordmark */}
      <header className="relative z-10 px-6 pt-8 sm:px-10 sm:pt-10">
        <span
          className="animate-reveal inline-flex items-baseline font-serif text-3xl lowercase tracking-tight text-ink sm:text-4xl"
          style={{ animationDelay: '200ms' }}
          aria-label="zarf."
        >
          {welcomeCopy.wordmark}
          <span
            aria-hidden="true"
            className="ml-[0.06em] inline-block h-[0.18em] w-[0.18em] rounded-full bg-bindi"
          />
        </span>
      </header>

      {/* Hero body */}
      <section className="relative z-10 flex flex-1 flex-col justify-center px-6 pt-20 sm:px-10 sm:pt-16">
        <div className="max-w-[34rem]">
          <h1 className="font-serif font-medium text-[clamp(2.75rem,12vw,6.5rem)] leading-[0.95] tracking-[-0.025em] text-ink">
            <span
              className="animate-reveal block"
              style={{ animationDelay: '500ms' }}
            >
              sarees
            </span>
            <span
              className="animate-reveal block"
              style={{ animationDelay: '650ms' }}
            >
              are easier
            </span>
            <span
              className="animate-reveal block"
              style={{ animationDelay: '800ms' }}
            >
              than they look
              <span
                aria-hidden="true"
                className="ml-[0.05em] inline-block h-[0.18em] w-[0.18em] rounded-full bg-bindi align-baseline"
              />
              <span className="sr-only">.</span>
            </span>
          </h1>
          <p
            className="animate-reveal mt-7 max-w-[26rem] text-base leading-relaxed text-muted sm:text-lg"
            style={{ animationDelay: '1100ms' }}
          >
            {welcomeCopy.subhead}
          </p>
        </div>
      </section>

      {/* Bottom actions */}
      <footer className="relative z-10 px-6 pb-10 sm:px-10 sm:pb-14">
        <div className="mx-auto flex w-full max-w-prose flex-col gap-5">
          <Link
            href="/occasion"
            className="animate-reveal group inline-flex w-full items-center justify-center gap-3 rounded-full bg-bindi px-7 py-5 text-lg font-medium text-cream shadow-[0_10px_30px_-12px_rgba(92,14,24,0.45)] transition-all duration-300 hover:bg-bindi-deep hover:shadow-[0_14px_34px_-10px_rgba(92,14,24,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            style={{ animationDelay: '1350ms' }}
          >
            <span>{welcomeCopy.primaryCta}</span>
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
          </Link>
          <div
            className="animate-reveal flex items-center justify-center gap-2.5 text-sm text-muted"
            style={{ animationDelay: '1500ms' }}
          >
            <span>{welcomeCopy.secondaryCta}</span>
            <span className="inline-flex items-center rounded-full border border-ink/15 bg-cream/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-ink/60">
              {welcomeCopy.secondaryHint}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
