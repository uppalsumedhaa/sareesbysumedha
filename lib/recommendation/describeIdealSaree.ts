// Builds a "what to look for" brief from a rubric — used as the empty-state
// hero when the live search can't return real picks. Pure function: same
// inputs produce the same output, no API calls, can't fail. The only place
// that talks to an external service is `findReferenceSaree` (separate file)
// to fetch a representative image; if that fails the brief still renders.

import type {
  ColorFamily,
  Rubric,
} from '@/lib/recommendation/generateRubric';
import type { ClimateProfile } from '@/lib/weather/climate';
import type { IntakeAnswers } from '@/lib/copy/intake';

export interface IdealSareeBrief {
  fabricLabel: string;     // e.g. "emerald chanderi"
  description: string;     // 2-3 sentences, what to look for
  styling: string[];       // 3-4 short styling tips
}

const COLOR_WORD: Record<ColorFamily, string> = {
  red_warm: 'tomato red',
  red_cool: 'ruby',
  pink_cool: 'magenta',
  pink_warm: 'coral',
  orange_earth: 'rust',
  yellow_warm: 'mustard',
  yellow_cool: 'pale yellow',
  green_warm: 'olive',
  green_cool: 'emerald',
  blue_cool: 'sapphire',
  blue_warm: 'teal',
  purple: 'plum',
  neutral_warm: 'ivory',
  neutral_cool: 'silver',
};

const MONTH_NAME = [
  '', 'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

function fabricFeelLine(fabric: string): string {
  const f = fabric.toLowerCase();
  if (f.includes('mul cotton') || f === 'mul cotton') {
    return 'mul cotton breathes when nothing else will, and forgives a long day on you';
  }
  if (f.includes('linen')) {
    return 'linen is crisp, drapes clean, and only gets better the more you wear it';
  }
  if (f.includes('chanderi') && f.includes('silk')) {
    return 'chanderi silk has a soft shimmer baked in, picks up evening light without effort';
  }
  if (f.includes('chanderi')) {
    return 'chanderi reads gentle in daylight and warms up in the evening';
  }
  if (f.includes('maheshwari')) {
    return 'maheshwari is a cotton-silk blend that punches above its weight, crisp body and soft drape';
  }
  if (f.includes('kanjivaram')) {
    return 'kanjivaram has weight and structure, the kind of saree you bring out on purpose';
  }
  if (f.includes('banarasi')) {
    return 'banarasi has weight to it, the zari does most of the work';
  }
  if (f.includes('mysore silk')) {
    return 'mysore silk is light, refined, and drapes like it knows what it is doing';
  }
  if (f.includes('tussar') || f.includes('raw silk')) {
    return 'tussar has a natural matte gold sheen and just enough weight';
  }
  if (f.includes('kota')) {
    return 'kota doria is light as anything, the woven check pattern carries the look';
  }
  if (f.includes('mangalagiri') || f.includes('tant')) {
    return 'a handloom cotton, breathable and forgiving, gets softer with every wash';
  }
  if (f === 'georgette') {
    return 'georgette is forgiving, drapes clean, easy through a long day';
  }
  if (f === 'chiffon') {
    return 'chiffon is light, moves with you, takes almost no effort to drape';
  }
  if (f.includes('organza')) {
    return 'organza holds its shape, stand-away drape, all about presence';
  }
  return `${fabric} drapes easy and wears well`;
}

function composeDescription(
  rubric: Rubric,
  answers: Required<IntakeAnswers>,
  climate: ClimateProfile,
  fabric: string,
  colorWord: string,
): string {
  const month = MONTH_NAME[answers.month] ?? 'this month';
  const city = climate.city.toLowerCase();
  const useFrame = {
    everyday_office: 'a workday',
    everyday_home: 'a slow day at home',
    special_occasion: 'the occasion that\'s coming up',
  }[answers.useCase];
  const lightFrame = answers.timeOfDay === 'night' ? 'evening light' : 'daylight';
  const satNote = {
    vivid: 'something with real saturation, not pastel',
    muted: 'a quieter, dustier tone, not loud',
    mid: 'a confident mid-tone, neither shouting nor whispering',
    flexible: 'whatever speaks to you in the moment',
  }[rubric.saturation];

  return `for ${useFrame} in ${city}, ${month}, look for a ${colorWord} ${fabric}. ${satNote} that lives well in ${lightFrame}. ${fabricFeelLine(fabric)}.`;
}

function composeStyling(
  rubric: Rubric,
  answers: Required<IntakeAnswers>,
): string[] {
  const tips: string[] = [];

  // Jewelry — driven by gold/silver lean (the same signal that maps to
  // warm/cool undertone in the rubric).
  if (answers.jewelryLean === 'gold') {
    tips.push(
      'gold for the jewellery — jhumkas, a kada, a thin chain. nothing has to match perfectly.',
    );
  } else if (answers.jewelryLean === 'silver') {
    tips.push(
      'silver studs or oxidised jhumkas. let the saree carry the warmth, keep the metal cool.',
    );
  } else {
    tips.push(
      'either gold or silver works for you — pick whatever you reach for first in the morning.',
    );
  }

  // Blouse, by saturation
  if (rubric.saturation === 'vivid') {
    tips.push(
      'blouse: a matching tone, or a deep solid contrast like cream, charcoal, or wine. nothing fussy.',
    );
  } else if (rubric.saturation === 'muted') {
    tips.push(
      'blouse: go a touch bolder than the saree so it pops. solid, no print contest with the saree itself.',
    );
  } else {
    tips.push(
      'blouse: a clean solid in a tone that matches or contrasts. don\'t overthink it.',
    );
  }

  // Hair / makeup, by use case + time of day
  if (answers.useCase === 'everyday_office') {
    tips.push(
      'low bun or a sleek pony. soft kohl, neutral lip. you\'re going to work, not a wedding.',
    );
  } else if (answers.useCase === 'everyday_home') {
    tips.push(
      'hair however you woke up. minimal makeup. comfort wins, the saree does the rest.',
    );
  } else if (answers.timeOfDay === 'night') {
    tips.push(
      'loose waves or half-up. lean into the eyes — kohl, a touch of shimmer. the evening light will do the rest.',
    );
  } else {
    tips.push(
      'a side braid with a flower if you have one. soft kohl, a stain on the lip. daylight is honest, keep it clean.',
    );
  }

  // Drape skill — permission to take the shortcut
  if (answers.drapingSkill === 'hassle_free') {
    tips.push(
      'pre-stitched or pre-pleated is a real answer. a few safety pins too. nobody can tell.',
    );
  }

  return tips;
}

export function describeIdealSaree(
  rubric: Rubric,
  answers: Required<IntakeAnswers>,
  climate: ClimateProfile,
): IdealSareeBrief {
  const fabric = rubric.fabrics.candidates[0] ?? 'cotton-silk blend';
  const colorFamily = rubric.colors.flatter[0];
  const colorWord = colorFamily ? COLOR_WORD[colorFamily] : 'jewel-toned';

  return {
    fabricLabel: `${colorWord} ${fabric}`,
    description: composeDescription(rubric, answers, climate, fabric, colorWord),
    styling: composeStyling(rubric, answers),
  };
}
