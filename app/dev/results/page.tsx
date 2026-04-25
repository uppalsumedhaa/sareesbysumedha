'use client';

// Results page — reads intake from the client store, calls the server action
// which fetches climate, runs the rubric, then delegates live saree search to
// Claude Opus 4.7 with server-side web_search + web_fetch. Renders three real
// in-stock picks from approved retailers.
//
// The debug panel stays around so Sumi can verify climate + rubric output.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useIntake } from '@/lib/intake/store';
import { runIntake, type RunIntakeResult } from '@/app/(intake)/actions';
import type { LiveSaree } from '@/lib/search/agentic';
import type { IntakeAnswers } from '@/lib/copy/intake';

const USE_CASE_LABEL: Record<string, string> = {
  everyday_office: 'everyday office wear',
  everyday_home: 'at-home days',
  special_occasion: 'your special occasion',
};

const MONTH_NAME = [
  '', 'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

function answersAreComplete(a: IntakeAnswers): boolean {
  return (
    !!a.useCase &&
    !!a.city &&
    a.month !== undefined &&
    !!a.timeOfDay &&
    !!a.skinDepth &&
    !!a.jewelryLean &&
    !!a.drapingSkill &&
    a.budgetInr !== undefined
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const answers = useIntake(
    useShallow((s) => ({
      useCase: s.useCase,
      city: s.city,
      month: s.month,
      timeOfDay: s.timeOfDay,
      skinDepth: s.skinDepth,
      jewelryLean: s.jewelryLean,
      drapingSkill: s.drapingSkill,
      budgetInr: s.budgetInr,
    })),
  );

  const complete = answersAreComplete(answers);

  const [data, setData] = useState<RunIntakeResult | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  useEffect(() => {
    if (!complete) return;
    let cancelled = false;
    setFatal(null);
    setData(null);
    runIntake(answers).then(
      (res) => {
        if (!cancelled) setData(res);
      },
      (err: unknown) => {
        if (!cancelled) {
          setFatal(err instanceof Error ? err.message : 'something went wrong');
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [complete, answers]);

  const subhead = useMemo(() => {
    if (!complete || !answers.city || !answers.month || !answers.useCase) return '';
    const useCaseText = USE_CASE_LABEL[answers.useCase] ?? 'your saree';
    return `for ${useCaseText} in ${answers.city}, ${MONTH_NAME[answers.month]}. weather, complexion and budget all in the mix.`;
  }, [complete, answers.useCase, answers.city, answers.month]);

  if (!complete) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="mx-auto max-w-prose px-6 py-20 sm:px-10">
          <h1 className="font-serif text-3xl text-ink md:text-4xl">
            let&apos;s start at the beginning.
          </h1>
          <p className="mt-3 text-muted">
            we need your answers first. takes about a minute.
          </p>
          <button
            onClick={() => router.push('/use-case')}
            className="mt-8 inline-flex items-center rounded-full bg-bindi px-6 py-3 text-base font-medium text-cream hover:bg-bindi-deep"
          >
            begin
          </button>
        </div>
      </main>
    );
  }

  const loading = !data && !fatal;

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
        <header className="mb-10 md:mb-14">
          <h1 className="font-serif text-3xl text-ink md:text-4xl">
            the chosen three for you
          </h1>
          {subhead && (
            <p className="mt-2 text-sm text-muted md:text-base">{subhead}</p>
          )}
          {loading && (
            <p className="mt-4 text-sm text-muted">
              scouting in-stock sarees across soch, suta, nalli, taneira, karagiri. this takes 15-30 seconds.
            </p>
          )}
          {fatal && (
            <p className="mt-4 text-sm text-bindi">
              couldn&apos;t finish: {fatal}.{' '}
              <Link href="/use-case" className="underline">
                start over
              </Link>
            </p>
          )}
          {data?.searchError && data.picksSource === 'catalog' && (
            <p className="mt-4 rounded-lg border border-muted/30 bg-muted/5 p-4 text-sm text-ink/80">
              live search couldn&apos;t complete (<span className="font-mono text-xs">{data.searchError}</span>),
              so these are scored from our verified backup pool. real products, real links, just a smaller catalog.
            </p>
          )}
          {data?.searchError && data.picksSource === 'none' && (
            <p className="mt-4 rounded-lg border border-bindi/30 bg-bindi/5 p-4 text-sm text-ink/80">
              live search hit a snag: <span className="font-mono">{data.searchError}</span>.
              the rubric still worked, see what it decided below.
            </p>
          )}
        </header>

        {data && data.picks.length > 0 && (
          <section className="grid gap-6 md:grid-cols-3 md:gap-8">
            {data.picks.map((p) => (
              <Card key={p.productUrl} rec={p} />
            ))}
          </section>
        )}

        {data && data.picks.length === 0 && !data.searchError && (
          <section className="rounded-lg border border-muted/20 bg-white p-6">
            <p className="text-ink">
              the scout came back empty. that&apos;s on us. try widening the budget or picking a different month.
            </p>
          </section>
        )}

        {data && <RubricPanel result={data} />}
      </div>
    </main>
  );
}

function Card({ rec }: { rec: LiveSaree }) {
  const formattedPrice = new Intl.NumberFormat('en-IN').format(rec.priceInr);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <div className="aspect-[4/5] overflow-hidden bg-muted/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rec.imageUrl}
          alt={rec.productName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="font-serif text-lg text-ink md:text-xl">{rec.direction}</h2>
        <p className="text-xs uppercase tracking-wide text-muted">{rec.fabricLabel}</p>
        <p className="text-sm leading-relaxed text-ink/80">{rec.reasoning}</p>

        <div className="mt-auto flex items-center justify-between border-t border-muted/15 pt-4">
          <div className="text-sm">
            <div className="text-muted">{rec.retailer}</div>
            <div className="font-semibold text-ink">₹{formattedPrice}</div>
          </div>
          <a
            href={rec.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded bg-bindi px-5 py-2 text-sm font-medium text-white transition hover:bg-bindi-deep"
          >
            Buy
          </a>
        </div>
      </div>
    </article>
  );
}

function RubricPanel({ result }: { result: RunIntakeResult }) {
  const { rubric, climate } = result;
  return (
    <details className="mt-14 rounded-lg border border-muted/20 bg-white/60 p-5 text-sm text-ink/80">
      <summary className="cursor-pointer font-medium text-ink">
        what the rubric decided (debug)
      </summary>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Row label="climate">
          {climate.city}, avg {climate.avgTempC}°C, {climate.avgHumidity}% humidity,{' '}
          {climate.precipMm}mm rain — {climate.bucket}
          {climate.rainy ? ' (rainy)' : ''}
        </Row>
        <Row label="bucket">{rubric.complexion_bucket}</Row>
        <Row label="color direction">{rubric.colors.emphasis}</Row>
        <Row label="flatter families">
          {rubric.colors.flatter.join(', ') || '—'}
        </Row>
        <Row label="avoid families">
          {rubric.colors.avoid.join(', ') || '—'}
        </Row>
        <Row label="saturation">{rubric.saturation}</Row>
        <Row label="fabric candidates">
          {rubric.fabrics.candidates.join(', ') || '—'}
        </Row>
        <Row label="fabric excluded">
          {rubric.fabrics.excluded.join(', ') || '—'}
        </Row>
        <Row label="budget notes">{rubric.budget_notes}</Row>
        <Row label="day/night note">{rubric.day_night_note || '—'}</Row>
      </dl>
    </details>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-ink/80">{children}</dd>
    </div>
  );
}
