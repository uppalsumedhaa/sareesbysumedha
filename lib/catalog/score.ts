// Score the seeded catalog against the rubric and return top 3 as LiveSaree
// objects. Used as a fallback when the live agentic search fails (no API key,
// rate limit, $0 credit, model returns empty).
//
// Scoring shape:
//   - hard filter: budget cap, use case match
//   - soft scoring: color flatter (+3), color avoid (-5), fabric candidate (+2),
//     fabric excluded (-3), saturation match (+1), season ok (+1), budget-fit
//     bonus when price <= 80% of budget (+0.5)
//   - diversity pass: prefer the highest-scoring saree from each distinct fabric
//     before back-filling from the remaining tail

import type {
  ColorFamily,
  Rubric,
  Season,
  UseCase,
} from '@/lib/recommendation/generateRubric';
import type { ClimateProfile } from '@/lib/weather/climate';
import type { LiveSaree } from '@/lib/search/agentic';
import type { CatalogSaree, ScoredSaree } from './types';

const HARD_FAIL = -1000;

export interface ScoringContext {
  budgetInr: number;
  useCase: UseCase;
  season: Season;
}

// Mirror of the same helper inside generateRubric.ts. Duplicated rather than
// exported because the rubric module's adapter is private.
export function climateToSeason(c: ClimateProfile): Season {
  if (c.rainy) return 'monsoon';
  if (c.bucket === 'cool') return 'winter';
  if (c.bucket === 'hot_humid' || c.bucket === 'hot_dry') return 'summer';
  return c.avgTempC >= 22 ? 'summer' : 'winter';
}

function scoreOne(
  saree: CatalogSaree,
  rubric: Rubric,
  ctx: ScoringContext,
): { score: number; matchedOn: string[] } {
  const matches: string[] = [];

  if (saree.priceInr > ctx.budgetInr) {
    return { score: HARD_FAIL, matchedOn: ['over-budget'] };
  }
  if (!saree.useCases.includes(ctx.useCase)) {
    return { score: HARD_FAIL, matchedOn: ['use-case-mismatch'] };
  }
  // Heavy embellishment (stone work, sequins, mirror work, dense zari) is
  // costume-y for office or at-home wear. Filter it out for everyday cases.
  if (
    saree.embellishment === 'heavy' &&
    (ctx.useCase === 'everyday_office' || ctx.useCase === 'everyday_home')
  ) {
    return { score: HARD_FAIL, matchedOn: ['embellishment-too-heavy-for-everyday'] };
  }

  let score = 0;

  if (rubric.colors.flatter.includes(saree.dominantColor)) {
    score += 3;
    matches.push('color-flatter');
  }
  if (rubric.colors.avoid.includes(saree.dominantColor)) {
    score -= 5;
    matches.push('color-avoid');
  }

  if (rubric.fabrics.candidates.includes(saree.fabric)) {
    score += 2;
    matches.push('fabric-match');
  } else if (rubric.fabrics.excluded.includes(saree.fabric)) {
    score -= 3;
    matches.push('fabric-excluded');
  }

  if (saree.saturation === rubric.saturation || saree.saturation === 'flexible') {
    score += 1;
    matches.push('saturation-match');
  }

  if (saree.seasonsOk.includes(ctx.season)) {
    score += 1;
    matches.push('season-ok');
  }

  if (saree.priceInr <= ctx.budgetInr * 0.8) {
    score += 0.5;
    matches.push('budget-fit');
  }

  return { score, matchedOn: matches };
}

function pickDiverseTop(scored: ScoredSaree[], n: number): ScoredSaree[] {
  const picked: ScoredSaree[] = [];
  const seenFabric = new Set<string>();

  for (const s of scored) {
    if (picked.length >= n) break;
    if (!seenFabric.has(s.saree.fabric)) {
      picked.push(s);
      seenFabric.add(s.saree.fabric);
    }
  }
  for (const s of scored) {
    if (picked.length >= n) break;
    if (!picked.includes(s)) picked.push(s);
  }
  return picked;
}

const COLOR_WORD: Record<ColorFamily, string> = {
  red_warm: 'red',
  red_cool: 'cool red',
  pink_cool: 'magenta',
  pink_warm: 'pink',
  orange_earth: 'rust',
  yellow_warm: 'mustard',
  yellow_cool: 'pale yellow',
  green_warm: 'olive',
  green_cool: 'green',
  blue_cool: 'blue',
  blue_warm: 'teal',
  purple: 'plum',
  neutral_warm: 'ivory',
  neutral_cool: 'silver',
};

function templateReasoning(saree: CatalogSaree): string {
  const f = saree.fabric.toLowerCase();
  if (f.includes('mul cotton') || f.includes('mulmul') || f === 'mul cotton') {
    return "mulmul is the lightest thing you can drape, breathes when nothing else does. this one lets you look put-together without feeling dressed up.";
  }
  if (f.includes('chanderi') && f.includes('silk')) {
    return "chanderi silk has a soft shimmer baked in, picks up evening light without a thing changing on your end. it carries itself.";
  }
  if (f.includes('chanderi')) {
    return "chanderi reads gentle in daylight and warms up in the evening. easy to drape, the woven detail does most of the work.";
  }
  if (f === 'chiffon') {
    return "chiffon is light, it moves with you. takes almost no effort to drape and comes out looking considered.";
  }
  if (f === 'georgette') {
    return "georgette is forgiving, drapes clean, and the embroidery does the talking. easy through a long evening.";
  }
  if (f.includes('brocade')) {
    return "varanasi brocade has been in north indian wedding wardrobes for centuries. heavy in the best way, the kind you bring out on purpose.";
  }
  if (f.includes('banarasi') && saree.fabricFamily === 'synthetic') {
    return "festive banarasi style. the zari weave reads rich without the silk weight. holds up through a long evening.";
  }
  if (f.includes('banarasi')) {
    return "banarasi has weight to it, meant for the kind of evening that deserves the effort. the zari does most of the work.";
  }
  if (f.includes('kanjivaram')) {
    return "kanjivaram is for the occasions you remember. heavy, structured, the kind you bring out on purpose.";
  }
  if (f.includes('paithani')) {
    return "paithani is a statement. the peacock and floral motifs woven into the borders do the talking, so let it run the show with simple jewelry.";
  }
  if (f.includes('raw silk') || f.includes('tussar')) {
    return "tussar has that natural matte gold sheen and just enough weight. reads refined without trying.";
  }
  if (f.includes('maheshwari')) {
    return "maheshwari is a cotton-silk blend that punches above its weight. crisp body, soft drape. one of the most wearable handlooms going.";
  }
  if (f.includes('handloom') || f.includes('soft cotton')) {
    return "handloom cotton breathes easy, drapes soft. the irregularities are the point, every weave is a little different.";
  }
  if (f.includes('cotton')) {
    return "cotton is the fabric that won't fuss with you. breathable, forgiving, easy to live in.";
  }
  return `a solid ${saree.fabric} pick. wears well, drapes clean, fits the day.`;
}

function templateDirection(saree: CatalogSaree, useCase: UseCase): string {
  if (useCase === 'everyday_office') {
    return saree.saturation === 'muted'
      ? 'an easy office day saree'
      : 'a saree to brighten the workweek';
  }
  if (useCase === 'everyday_home') {
    return 'something for slow at-home days';
  }
  // special_occasion
  if (saree.priceInr > 15000) return 'for the big occasion';
  if (saree.saturation === 'vivid') return 'for the occasion that calls for it';
  return 'something for the occasion coming up';
}

function toLiveSaree(scored: ScoredSaree, useCase: UseCase): LiveSaree {
  const s = scored.saree;
  return {
    productName: s.productName,
    productUrl: s.productUrl,
    imageUrl: s.imageUrl,
    retailer: s.retailer,
    priceInr: s.priceInr,
    fabricLabel: `${COLOR_WORD[s.dominantColor]} ${s.fabric}`,
    direction: s.direction ?? templateDirection(s, useCase),
    reasoning: s.reasoningLine ?? templateReasoning(s),
  };
}

export function pickFromCatalog(
  catalog: CatalogSaree[],
  rubric: Rubric,
  ctx: ScoringContext,
  topN = 3,
): LiveSaree[] {
  const scored: ScoredSaree[] = catalog
    .map((saree) => ({ saree, ...scoreOne(saree, rubric, ctx) }))
    .filter((s) => s.score > HARD_FAIL);

  scored.sort((a, b) => b.score - a.score);
  const top = pickDiverseTop(scored, topN);
  return top.map((s) => toLiveSaree(s, ctx.useCase));
}
