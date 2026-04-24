import type {
  Duration,
  Occasion,
  ReuseIntent,
  VenueType,
  WeddingRole,
} from '@/lib/session/types';

export const welcomeCopy = {
  wordmark: 'zarf',
  // The headline renders a bindi dot in place of the period. Do not include one here.
  headline: 'sarees are easier than they look',
  subhead:
    'figure out what to buy, how to wear it, and whether mum will approve. takes 5 minutes.',
  primaryCta: "let's start",
  secondaryCta: 'i already own a saree, help me style it',
  secondaryHint: 'coming soon',
};

export const occasionCopy = {
  heading: "what's this for?",
  subhead: "pick the closest. we'll refine it in a sec.",
  options: [
    { value: 'wedding', label: 'wedding' },
    { value: 'festival', label: 'festival / pooja' },
    { value: 'work', label: 'work or professional' },
    { value: 'casual', label: 'casual / everyday' },
    { value: 'party', label: 'party / cocktail / reception' },
    { value: 'browsing', label: 'not sure yet, just browsing' },
  ] as const satisfies ReadonlyArray<{ value: Occasion; label: string }>,
};

export const weddingRoleCopy = {
  heading: "and what's your role?",
  options: [
    { value: 'bride', label: 'bride' },
    { value: 'bridesmaid', label: 'bridesmaid / close friend' },
    { value: 'family', label: 'family of bride or groom' },
    { value: 'guest', label: 'guest' },
  ] as const satisfies ReadonlyArray<{ value: WeddingRole; label: string }>,
};

export const reuseCopy = {
  heading: 'how many times will you wear this?',
  options: [
    { value: 'once', label: "just this once, it's a statement" },
    { value: 'few-times', label: 'a few times a year' },
    { value: 'often', label: 'i want to actually wear it often' },
  ] as const satisfies ReadonlyArray<{ value: ReuseIntent; label: string }>,
};

export const budgetCopy = {
  heading: "what's your budget?",
  hint: 'no judgment, seriously.',
  bandLabels: {
    everyday: 'everyday',
    mid: 'mid',
    premium: 'premium',
    heirloom: 'heirloom',
  } as const,
};

export const climateCopy = {
  heading: "let's figure out where you'll be",
  subhead: "takes 10 seconds. helps us pick something that breathes.",
  locationLabel: 'where',
  locationPlaceholder: 'bangalore',
  whenLabel: 'when',
  venueLabel: 'indoor, outdoor, or a mix',
  venueOptions: [
    { value: 'indoor', label: 'indoor' },
    { value: 'outdoor', label: 'outdoor' },
    { value: 'mixed', label: 'mix of both' },
  ] as const satisfies ReadonlyArray<{ value: VenueType; label: string }>,
  durationLabel: 'how long?',
  durationOptions: [
    { value: 'couple-hours', label: 'a couple of hours' },
    { value: 'half-day', label: 'half a day' },
    { value: 'all-day', label: 'all day' },
  ] as const satisfies ReadonlyArray<{ value: Duration; label: string }>,
};

export const navCopy = {
  back: 'back',
  continue: 'continue',
};
