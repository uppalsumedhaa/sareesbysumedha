import Link from 'next/link';
import { welcomeCopy } from '@/lib/copy/onboarding';

export function Welcome() {
  return (
    <main className="flex min-h-screen flex-col bg-cream">
      <header className="flex justify-center px-6 pt-8">
        <span
          className="font-serif text-lg lowercase tracking-tight text-bindi"
          aria-label="zarf"
        >
          {welcomeCopy.wordmark}
        </span>
      </header>

      <section className="flex flex-1 flex-col justify-center px-6">
        <div className="mx-auto flex w-full max-w-prose flex-col gap-6">
          <h1 className="font-serif text-[2.75rem] leading-[1.05] tracking-tight text-ink sm:text-6xl">
            {welcomeCopy.headline}
            <span
              aria-hidden="true"
              className="ml-[0.06em] inline-block h-[0.22em] w-[0.22em] translate-y-[-0.05em] rounded-full bg-bindi align-baseline"
            />
            <span className="sr-only">.</span>
          </h1>
          <p className="max-w-[28rem] text-lg leading-relaxed text-muted sm:text-xl">
            {welcomeCopy.subhead}
          </p>
        </div>
      </section>

      <footer className="flex flex-col gap-5 px-6 pb-10 pt-6 sm:pb-14">
        <div className="mx-auto w-full max-w-prose">
          <Link
            href="/occasion"
            className="inline-flex w-full items-center justify-center rounded-full bg-bindi px-6 py-4 text-lg font-medium text-cream shadow-sm transition hover:bg-bindi-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bindi/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            {welcomeCopy.primaryCta}
          </Link>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
            <span>{welcomeCopy.secondaryCta}</span>
            <span className="rounded-full border border-muted/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted/80">
              {welcomeCopy.secondaryHint}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
