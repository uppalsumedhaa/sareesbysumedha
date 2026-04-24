import type {
  AccessoriesVibe,
  BlousePreference,
  DrapeStyle,
  Duration,
  Mood,
  Occasion,
  ReuseIntent,
  TradContempLevel,
  VenueType,
  VetoColor,
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

export const vibeCopy = {
  heading: 'what pulls you in?',
  subhead: "trust your gut. there's no wrong answer.",
  moodSectionLabel: 'pick 2 or 3 that feel like you',
  moodCountSuffix: '/ 3',
  tradContempHeading: 'where are you on this?',
  tradContempOptions: [
    { value: 'classic', label: 'classic', hint: 'full-on traditional' },
    {
      value: 'classic-twist',
      label: 'classic, with a twist',
      hint: 'traditional silhouette, a small modern flourish',
    },
    { value: 'balanced', label: 'balanced', hint: 'even mix of both worlds' },
    {
      value: 'modern-heritage',
      label: 'modern, rooted in heritage',
      hint: 'contemporary, but with clear roots',
    },
    {
      value: 'fully-contemporary',
      label: 'fully contemporary',
      hint: 'no rules, modern through and through',
    },
  ] as const satisfies ReadonlyArray<{
    value: TradContempLevel;
    label: string;
    hint: string;
  }>,
  colorHeading: "any colors you won't wear?",
  colorSubhead: 'tap all that apply. optional.',
};

export const moodTiles = [
  {
    value: 'minimal',
    label: 'minimal',
    bg: 'linear-gradient(135deg, #F5EFE0 0%, #D6C9AD 100%)',
    fg: 'ink',
  },
  {
    value: 'soft-romantic',
    label: 'soft-romantic',
    bg: 'linear-gradient(135deg, #F7E0D9 0%, #D9A3A3 100%)',
    fg: 'ink',
  },
  {
    value: 'maximalist',
    label: 'maximalist',
    bg: 'linear-gradient(135deg, #8E1929 0%, #D9A441 55%, #7A7A3D 100%)',
    fg: 'cream',
  },
  {
    value: 'old-money',
    label: 'old-money',
    bg: 'linear-gradient(135deg, #2A3C2F 0%, #141A14 100%)',
    fg: 'cream',
  },
  {
    value: 'festive-loud',
    label: 'festive-loud',
    bg: 'linear-gradient(135deg, #C41E3A 0%, #E8801E 50%, #D45C7E 100%)',
    fg: 'cream',
  },
  {
    value: 'power-dresser',
    label: 'power-dresser',
    bg: 'linear-gradient(135deg, #2E2A28 0%, #0E0A08 100%)',
    fg: 'cream',
  },
  {
    value: 'boho',
    label: 'boho',
    bg: 'linear-gradient(135deg, #C8764F 0%, #B8843A 100%)',
    fg: 'cream',
  },
  {
    value: 'preppy',
    label: 'preppy',
    bg: 'linear-gradient(135deg, #1E3A6A 0%, #F0E3C4 100%)',
    fg: 'cream',
  },
  {
    value: 'old-world',
    label: 'old-world',
    bg: 'linear-gradient(135deg, #A88A5A 0%, #5C4630 100%)',
    fg: 'cream',
  },
  {
    value: 'contemporary-edgy',
    label: 'contemporary-edgy',
    bg: 'linear-gradient(135deg, #1C1412 0%, #8E1929 100%)',
    fg: 'cream',
  },
  {
    value: 'sporty-modern',
    label: 'sporty-modern',
    bg: 'linear-gradient(135deg, #E5E2DC 0%, #B4B0A8 100%)',
    fg: 'ink',
  },
  {
    value: 'earthy-artisan',
    label: 'earthy-artisan',
    bg: 'linear-gradient(135deg, #7A7A3D 0%, #4A3826 100%)',
    fg: 'cream',
  },
] as const satisfies ReadonlyArray<{
  value: Mood;
  label: string;
  bg: string;
  fg: 'ink' | 'cream';
}>;

export const vetoColors = [
  { value: 'red', label: 'red', hex: '#C41E3A' },
  { value: 'orange', label: 'orange', hex: '#E8801E' },
  { value: 'yellow', label: 'yellow', hex: '#F4C430' },
  { value: 'green', label: 'green', hex: '#2D6B3F' },
  { value: 'blue', label: 'blue', hex: '#1E3A8A' },
  { value: 'purple', label: 'purple', hex: '#6B2D6B' },
  { value: 'pink', label: 'pink', hex: '#D45C7E' },
  { value: 'brown', label: 'brown', hex: '#6B4F2C' },
  { value: 'black', label: 'black', hex: '#1C1412' },
  { value: 'white', label: 'white', hex: '#F5F5F5' },
] as const satisfies ReadonlyArray<{
  value: VetoColor;
  label: string;
  hex: string;
}>;

export const photoCopy = {
  entryHeading: "want us to suggest colors that'll look great on you?",
  entrySubhead: 'upload a selfie. we just look at your coloring, nothing weird.',
  uploadLabel: 'tap to upload a photo',
  uploadHint: 'a clear, well-lit selfie works best',
  skipLabel: 'skip, pick colors myself',
  privacyNote: "the photo stays in your browser. we never upload or store it.",
  processingLabel: 'looking at your coloring',
  resultHeading: 'these tend to work beautifully with your coloring.',
  resultHint:
    "it's a starting point. you can ignore anything that doesn't feel like you.",
  undertoneLabels: {
    warm: 'warm undertone',
    cool: 'cool undertone',
    neutral: 'neutral undertone',
  },
  contrastLabels: {
    high: 'high contrast',
    medium: 'medium contrast',
    low: 'soft contrast',
  },
  retakeLabel: 'try another photo',
};

export const stylingCopy = {
  heading: 'a few last things.',
  subhead: 'these nudge the shortlist in the right direction.',
  blouseHeading: 'blouse or crop top?',
  blouseOptions: [
    { value: 'traditional', label: 'traditional blouse', hint: 'the classic fitted cut' },
    { value: 'crop-top', label: 'crop top / fusion', hint: 'modern, more range of movement' },
    { value: 'both', label: "show me both, i'm open", hint: 'we pair sarees with whichever fits the look' },
  ] as const satisfies ReadonlyArray<{
    value: BlousePreference;
    label: string;
    hint: string;
  }>,
  drapeHeading: 'how do you want to drape it?',
  drapeOptions: [
    { value: 'nivi', label: 'classic (nivi)', hint: 'pleats in front, pallu over the left shoulder' },
    { value: 'regional', label: 'regional', hint: 'bengali, gujarati, maharashtrian, pick later' },
    { value: 'pant-saree', label: 'pant-saree or pre-stitched', hint: "easiest, no pleats to fuss over" },
    { value: 'unsure', label: 'not sure, suggest what works', hint: "we'll pick based on the saree" },
  ] as const satisfies ReadonlyArray<{
    value: DrapeStyle;
    label: string;
    hint: string;
  }>,
  accessoriesHeading: "what's the accessories vibe?",
  accessoriesOptions: [
    { value: 'temple', label: 'temple / traditional', hint: 'gold, ornate, special-occasion' },
    { value: 'oxidized', label: 'oxidized / silver', hint: 'craft-forward, a bit earthy' },
    { value: 'minimal-gold', label: 'minimal gold', hint: 'small studs, thin bangles, nothing loud' },
    { value: 'statement', label: 'statement / bold', hint: 'one big piece doing all the work' },
    { value: 'none', label: 'none. the saree is the outfit', hint: 'let the drape speak' },
  ] as const satisfies ReadonlyArray<{
    value: AccessoriesVibe;
    label: string;
    hint: string;
  }>,
};

export const resultsCopy = {
  heading: "almost there.",
  subhead:
    "the recommendation engine is still coming together. here's what we've got on you so far.",
  emptyHeading: "you haven't started yet.",
  emptyBody:
    "head back to the start and tell us about the occasion, your vibe, and your budget. takes 5 minutes.",
  emptyCta: 'start the flow',
  restartCta: 'start over',
};

export const navCopy = {
  back: 'back',
  continue: 'continue',
  finish: 'see what we know',
};
