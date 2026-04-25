// Copy for the intake flow. Elder-sister voice: every question framed as
// "tell me this so i can find the right saree for you." Do not add new
// questions here without matching one of the seven locked inputs in
// docs/current-state.md.

import type { TileOption } from '@/components/ui/tile-select';

export type UseCase = 'everyday_office' | 'everyday_home' | 'special_occasion';

// Remaining intake answer types. UIs for these come in later slices; types
// are declared here so the answer shape is one import away across the app.
// Season is not asked: it's derived from city + month via lib/weather.
export type TimeOfDay = 'day' | 'night';
export type SkinDepth = 'light' | 'wheatish' | 'deep';
export type JewelryLean = 'gold' | 'silver' | 'either';
export type DrapingSkill = 'hassle_free' | 'medium_pro' | 'pro';

export interface IntakeAnswers {
  useCase?: UseCase;
  city?: string;
  month?: number; // 1-12
  timeOfDay?: TimeOfDay;
  skinDepth?: SkinDepth;
  jewelryLean?: JewelryLean;
  drapingSkill?: DrapingSkill;
  budgetInr?: number;
}

export const intakeNav = {
  back: 'back',
  continue: 'continue',
  progressOf: 'of',
} as const;

export const whereCopy = {
  stepLabel: 'question 2 of 7',
  heading: 'where, and when?',
  subhead:
    "delhi in june is not bangalore in december. fabric depends on it.",
  cityLabel: 'your city',
  cityPlaceholder: 'bangalore',
  monthLabelByUseCase: {
    everyday_office: "the month you're in",
    everyday_home: "the month you're in",
    special_occasion: "the month it's happening",
    default: 'what month?',
  } satisfies Record<UseCase | 'default', string>,
  monthOptions: [
    { value: 1, label: 'jan' },
    { value: 2, label: 'feb' },
    { value: 3, label: 'mar' },
    { value: 4, label: 'apr' },
    { value: 5, label: 'may' },
    { value: 6, label: 'jun' },
    { value: 7, label: 'jul' },
    { value: 8, label: 'aug' },
    { value: 9, label: 'sep' },
    { value: 10, label: 'oct' },
    { value: 11, label: 'nov' },
    { value: 12, label: 'dec' },
  ] as const satisfies ReadonlyArray<{ value: number; label: string }>,
};

export const budgetCopy = {
  stepLabel: 'question 7 of 7',
  heading: "what's the most you'd spend?",
  subhead:
    "last one. be honest here. we'll find something good either way.",
  min: 500,
  max: 100000,
  step: 500,
  default: 5000,
  submitCta: "what's my saree?",
};

export const drapingCopy = {
  stepLabel: 'question 6 of 7',
  heading: 'how are you with draping?',
  subhead: "pre-stitched is a legit answer. safety pins too. no shame here.",
  options: [
    {
      value: 'hassle_free',
      label: 'keep it easy',
      hint: 'pre-stitched, ready-to-wear, pre-pleated',
    },
    {
      value: 'medium_pro',
      label: 'i can manage the pleats',
      hint: 'give me ten minutes and i figure it out',
    },
    {
      value: 'pro',
      label: "i've got this",
      hint: 'drape it without thinking',
    },
  ] as const satisfies ReadonlyArray<TileOption<DrapingSkill>>,
};

export const jewelryCopy = {
  stepLabel: 'question 5 of 7',
  heading: 'gold or silver?',
  subhead: 'the old jewelry test. trust your gut on this one.',
  options: [
    {
      value: 'gold',
      label: 'yellow gold',
      hint: 'gold chains feel more you',
    },
    {
      value: 'silver',
      label: 'silver or white gold',
      hint: 'silver or platinum feels more you',
    },
    {
      value: 'either',
      label: 'honestly, both',
      hint: 'no strong lean either way',
    },
  ] as const satisfies ReadonlyArray<TileOption<JewelryLean>>,
};

export const skinCopy = {
  stepLabel: 'question 4 of 7',
  heading: 'how would you describe your skin?',
  subhead: 'no judgment. just helps us pick colors that suit you.',
  options: [
    {
      value: 'light',
      label: 'light',
      hint: 'ivory, porcelain, soft golden',
    },
    {
      value: 'wheatish',
      label: 'wheatish',
      hint: 'honey, golden, olive. the indian term for medium',
    },
    {
      value: 'deep',
      label: 'deep',
      hint: 'rich brown to ebony',
    },
  ] as const satisfies ReadonlyArray<TileOption<SkinDepth>>,
};

export const timeOfDayCopy = {
  stepLabel: 'question 3 of 7',
  heading: 'day or night?',
  subhead: 'sunlight and lamplight are not the same brief.',
  options: [
    {
      value: 'day',
      label: 'daytime, mostly',
      hint: 'sun, natural light, before sundown',
    },
    {
      value: 'night',
      label: 'evening into night',
      hint: 'indoor lighting, lamps, after dark',
    },
  ] as const satisfies ReadonlyArray<TileOption<TimeOfDay>>,
};

export const useCaseCopy = {
  stepLabel: 'question 1 of 7',
  // Question count is 7. If you change it, update every other stepLabel too.
  heading: "first off, where's this saree going?",
  subhead: "this one shapes everything else we'll ask.",
  options: [
    {
      value: 'everyday_office',
      label: 'office, most days',
      hint: 'meetings, deadlines, the regular workweek',
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
