// Copy for the intake flow. Elder-sister voice: every question framed as
// "tell me this so i can find the right saree for you." Do not add new
// questions here without matching one of the seven locked inputs in
// docs/current-state.md.

import type { TileOption } from '@/components/ui/tile-select';

export type UseCase = 'everyday_office' | 'everyday_home' | 'special_occasion';

// Remaining intake answer types. UIs for these come in later slices; types
// are declared here so the answer shape is one import away across the app.
export type Season = 'summer' | 'monsoon' | 'winter' | 'festive_season';
export type TimeOfDay = 'day' | 'night';
export type SkinDepth = 'fair' | 'wheatish' | 'deep';
export type JewelryLean = 'gold' | 'silver' | 'either';
export type DrapingSkill = 'hassle_free' | 'medium_pro' | 'pro';
export type AgeBracket = 'under_30' | '30_to_49' | '50_plus';

export interface IntakeAnswers {
  useCase?: UseCase;
  city?: string;
  season?: Season;
  timeOfDay?: TimeOfDay;
  skinDepth?: SkinDepth;
  jewelryLean?: JewelryLean;
  drapingSkill?: DrapingSkill;
  ageBracket?: AgeBracket;
  budgetInr?: number;
}

export const intakeNav = {
  back: 'back',
  continue: 'continue',
  progressOf: 'of',
} as const;

export const useCaseCopy = {
  stepLabel: 'question 1 of 7',
  heading: "first, where's this saree going?",
  subhead:
    "so i can narrow in on fabric and weight that actually suit the day.",
  options: [
    {
      value: 'everyday_office',
      label: 'office, most days',
      hint: 'desk days, client meetings, the regular workweek',
    },
    {
      value: 'everyday_home',
      label: 'around the house',
      hint: 'comfy, lived-in, school runs, errands',
    },
    {
      value: 'special_occasion',
      label: "something's coming up",
      hint: 'wedding, pooja, party, a night out',
    },
  ] as const satisfies ReadonlyArray<TileOption<UseCase>>,
};
