'use server';

import {
  buildRubricFromIntake,
  type Rubric,
} from '@/lib/recommendation/generateRubric';
import { getClimate, type ClimateProfile } from '@/lib/weather/climate';
import { findLiveSarees, type LiveSaree } from '@/lib/search/agentic';
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
  const climate = await getClimate(answers.city, answers.month);
  const rubric = buildRubricFromIntake(answers, climate);

  let picks: LiveSaree[] = [];
  let picksSource: 'live' | 'catalog' | 'none' = 'none';
  let searchError: string | undefined;

  try {
    picks = await findLiveSarees(answers, rubric, climate);
    if (picks.length > 0) {
      picksSource = 'live';
    }
  } catch (err) {
    searchError = err instanceof Error ? err.message : 'live search failed';
  }

  // Fall back to scoring the seed catalog when live search produced nothing.
  if (picks.length === 0) {
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

  return { rubric, climate, picks, picksSource, searchError };
}
