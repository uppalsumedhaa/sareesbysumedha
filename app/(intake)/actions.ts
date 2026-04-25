'use server';

import {
  buildRubricFromIntake,
  type Rubric,
} from '@/lib/recommendation/generateRubric';
import { getClimate, type ClimateProfile } from '@/lib/weather/climate';
import {
  findLiveSarees,
  findReferenceSaree,
  type LiveSaree,
} from '@/lib/search/agentic';
import {
  describeIdealSaree,
  type IdealSareeBrief,
} from '@/lib/recommendation/describeIdealSaree';
import { CATALOG } from '@/lib/catalog/data';
import { climateToSeason, pickFromCatalog } from '@/lib/catalog/score';
import type { IntakeAnswers } from '@/lib/copy/intake';

export interface RunIntakeResult {
  rubric: Rubric;
  climate: ClimateProfile;
  picks: LiveSaree[];
  picksSource: 'live' | 'catalog' | 'none';
  // Non-fatal: rubric + climate still succeed even if live search errors.
  searchError?: string;
  // Empty-state hero: rendered when picks is empty. Brief is always set in
  // that case; referenceImage is best-effort and may be undefined.
  idealBrief?: IdealSareeBrief;
  referenceImageUrl?: string;
}

function isComplete(a: IntakeAnswers): a is Required<IntakeAnswers> {
  return (
    a.useCase !== undefined &&
    a.city !== undefined &&
    a.city.trim().length > 0 &&
    a.month !== undefined &&
    a.timeOfDay !== undefined &&
    a.skinDepth !== undefined &&
    a.jewelryLean !== undefined &&
    a.drapingSkill !== undefined &&
    a.budgetInr !== undefined
  );
}

export async function runIntake(answers: IntakeAnswers): Promise<RunIntakeResult> {
  if (!isComplete(answers)) {
    throw new Error('intake is incomplete');
  }
  const t0 = Date.now();
  const climate = await getClimate(answers.city, answers.month);
  const rubric = buildRubricFromIntake(answers, climate);

  let picks: LiveSaree[] = [];
  let picksSource: 'live' | 'catalog' | 'none' = 'none';
  let searchError: string | undefined;

  // Structured logging for prod debugging. These show up in Vercel logs as
  // entries on the function trace, so we can see WHY a 200 came back with
  // empty picks (timeout vs zero-match vs parse error).
  console.log('[runIntake] start', JSON.stringify({
    useCase: answers.useCase,
    city: climate.city,
    month: answers.month,
    budgetInr: answers.budgetInr,
    season: climateToSeason(climate),
    bucket: rubric.complexion_bucket,
    fabricCandidates: rubric.fabrics.candidates,
    budgetFloor: rubric.budget_floor_inr,
  }));

  try {
    picks = await findLiveSarees(answers, rubric, climate);
    if (picks.length > 0) {
      picksSource = 'live';
    }
    console.log('[runIntake] live ok', JSON.stringify({
      picks: picks.length,
      retailers: picks.map((p) => p.retailer),
      fabrics: picks.map((p) => p.fabricLabel),
      ms: Date.now() - t0,
    }));
  } catch (err) {
    searchError = err instanceof Error ? err.message : 'live search failed';
    console.error('[runIntake] live error', JSON.stringify({
      error: searchError,
      errorName: err instanceof Error ? err.name : 'unknown',
      ms: Date.now() - t0,
    }));
  }

  // Catalog is now a last-ditch fallback for when the API path can't run at
  // all (no key configured — i.e. local dev without ANTHROPIC_API_KEY). All
  // other live failures (timeout, rate limit, model error) surface honestly
  // to the user with a retry path. The seed catalog is too thin to be a
  // graceful steady-state fallback, and leaning on it papers over real bugs
  // in the live path.
  const liveCannotRun =
    !!searchError && searchError.startsWith('ANTHROPIC_API_KEY is not set');
  if (picks.length === 0 && liveCannotRun) {
    const fallback = pickFromCatalog(CATALOG, rubric, {
      budgetInr: answers.budgetInr,
      useCase: answers.useCase,
      season: climateToSeason(climate),
    });
    if (fallback.length > 0) {
      picks = fallback;
      picksSource = 'catalog';
    }
  }

  // When picks are empty (any reason), build the "what to look for" brief
  // and try to fetch a representative image. Brief is deterministic and
  // can't fail; the image is best-effort.
  let idealBrief: IdealSareeBrief | undefined;
  let referenceImageUrl: string | undefined;
  if (picks.length === 0) {
    idealBrief = describeIdealSaree(rubric, answers, climate);
    const ref = await findReferenceSaree(
      rubric.fabrics.candidates[0] ?? 'cotton-silk',
      idealBrief.fabricLabel.split(' ')[0] ?? 'jewel',
    );
    if (ref) referenceImageUrl = ref.imageUrl;
    console.log('[runIntake] empty-state', JSON.stringify({
      hasBrief: !!idealBrief,
      hasReferenceImage: !!referenceImageUrl,
      ms: Date.now() - t0,
    }));
  }

  return {
    rubric,
    climate,
    picks,
    picksSource,
    searchError,
    idealBrief,
    referenceImageUrl,
  };
}
