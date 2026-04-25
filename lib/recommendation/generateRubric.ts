// Rubric generator for the POC.
// Deterministic: profile in, structured rubric + search queries out.
// Color theory data is distilled from lib/color/color-theory.md.
//
// `Profile` is the legacy 11-field input shape. The intake flow now collects
// only seven of those fields; `buildRubricFromIntake` at the bottom of this
// file adapts the new shape (plus a ClimateProfile) into a Profile.

import type { ClimateProfile } from '@/lib/weather/climate';
import type { IntakeAnswers, JewelryLean } from '@/lib/copy/intake';

export type Depth = 'light' | 'wheatish' | 'deep';
export type Undertone = 'cool' | 'warm' | 'neutral' | 'unknown';
export type UseCase = 'everyday_office' | 'everyday_home' | 'special_occasion';
export type TimeOfDay = 'day' | 'night';
export type Season = 'summer' | 'monsoon' | 'winter';
export type DrapeVolume = 'close' | 'stand_away' | 'either';
export type DrapingSkill = 'hassle_free' | 'medium_pro' | 'pro';
export type SolidsOrPrints = 'solids' | 'prints' | 'either';

export interface Profile {
  use_case: UseCase;
  location: string;
  season: Season;
  time_of_day: TimeOfDay;
  complexion_depth: Depth;
  undertone: Undertone;
  drape_volume: DrapeVolume;
  draping_skill: DrapingSkill;
  solids_vs_prints: SolidsOrPrints;
  budget_inr_max: number;
  fabric_aversions: string[];
}

export type ColorFamily =
  | 'red_warm' | 'red_cool'
  | 'pink_cool' | 'pink_warm'
  | 'orange_earth'
  | 'yellow_warm' | 'yellow_cool'
  | 'green_warm' | 'green_cool'
  | 'blue_cool' | 'blue_warm'
  | 'purple'
  | 'neutral_warm' | 'neutral_cool';

export type Saturation = 'muted' | 'mid' | 'vivid' | 'flexible';

export interface Rubric {
  summary: string;
  complexion_bucket: string;
  colors: {
    flatter: ColorFamily[];
    avoid: ColorFamily[];
    emphasis: string;
  };
  fabrics: {
    candidates: string[];
    excluded: string[];
    excluded_reason: string;
  };
  saturation: Saturation;
  day_night_note: string;
  budget_notes: string;
  search_queries: string[];
}

// -- Color palette map (from lib/color/color-theory.md) --

type ComplexionBucket =
  | 'light_cool' | 'light_warm' | 'light_neutral'
  | 'wheatish_cool' | 'wheatish_warm' | 'wheatish_neutral'
  | 'deep_cool' | 'deep_warm' | 'deep_neutral';

const PALETTE: Record<ComplexionBucket, { flatter: ColorFamily[]; avoid: ColorFamily[]; emphasis: string }> = {
  light_cool: {
    flatter: ['red_cool', 'pink_cool', 'blue_cool', 'green_cool', 'purple', 'neutral_cool'],
    avoid: ['yellow_warm', 'orange_earth'],
    emphasis: 'blue-based jewel tones and cool-based reds',
  },
  light_warm: {
    flatter: ['red_warm', 'pink_warm', 'orange_earth', 'yellow_warm', 'green_warm', 'neutral_warm'],
    avoid: ['pink_cool', 'blue_cool', 'neutral_cool'],
    emphasis: 'earth and spice tones, warm golds, coral and peach',
  },
  light_neutral: {
    flatter: ['pink_cool', 'red_cool', 'purple', 'green_cool', 'blue_cool', 'red_warm', 'pink_warm'],
    avoid: [],
    emphasis: 'cool pinks and jewel tones lead; widest flattering range so most mid-saturation shades work',
  },
  wheatish_cool: {
    flatter: ['red_cool', 'pink_cool', 'purple', 'blue_cool', 'green_cool', 'neutral_cool'],
    avoid: ['orange_earth', 'yellow_warm', 'green_warm', 'neutral_warm'],
    emphasis: 'magenta, wine, sapphire, plum',
  },
  wheatish_warm: {
    flatter: ['orange_earth', 'yellow_warm', 'green_warm', 'red_warm', 'pink_warm', 'neutral_warm'],
    avoid: ['pink_cool', 'blue_cool', 'purple', 'neutral_cool'],
    emphasis: 'mustard, rust, terracotta, marigold, olive',
  },
  wheatish_neutral: {
    flatter: ['red_cool', 'pink_cool', 'blue_warm', 'green_cool', 'purple', 'orange_earth'],
    avoid: ['yellow_warm', 'green_warm'],
    emphasis: 'teal, emerald, deep magenta, cobalt; avoid yellow-greens on olive undertone',
  },
  deep_cool: {
    flatter: ['red_cool', 'pink_cool', 'blue_cool', 'green_cool', 'purple', 'neutral_cool'],
    avoid: ['yellow_warm', 'neutral_warm'],
    emphasis: 'saturated jewel tones, ivory and silver; no pure black',
  },
  deep_warm: {
    flatter: ['orange_earth', 'yellow_warm', 'red_warm', 'pink_cool', 'blue_warm', 'neutral_warm'],
    avoid: ['neutral_cool'],
    emphasis: 'mustard, marigold, rust, rani pink, bronze, teal; no black or charcoal',
  },
  deep_neutral: {
    flatter: ['red_cool', 'red_warm', 'pink_cool', 'blue_cool', 'green_cool', 'yellow_warm'],
    avoid: ['neutral_cool'],
    emphasis: 'saturation matters more than hue; avoid muddy mid-tones and pure black',
  },
};

function bucketOf(depth: Depth, undertone: Undertone): ComplexionBucket {
  const ut = undertone === 'unknown' ? 'neutral' : undertone;
  return `${depth}_${ut}` as ComplexionBucket;
}

// -- Fabric knowledge base --

interface FabricRule {
  name: string;
  lightness: 'light' | 'medium' | 'heavy';
  drape: 'close' | 'stand_away' | 'either';
  difficulty: 'easy' | 'medium' | 'hard';
  appropriate_for: UseCase[];
  season_ok: Season[];
  typical_budget_inr: [number, number]; // [floor, ceiling] for a decent version
}

// Top three per category. Cuts confirmed with Sumi 2026-04-25.
// Budget ranges reflect docs/saree-reference.md section 11.
const FABRICS: FabricRule[] = [
  // Silks (heritage, occasion)
  { name: 'kanjivaram silk', lightness: 'heavy', drape: 'stand_away', difficulty: 'hard', appropriate_for: ['special_occasion'], season_ok: ['winter'], typical_budget_inr: [15000, 150000] },
  { name: 'banarasi silk', lightness: 'heavy', drape: 'stand_away', difficulty: 'hard', appropriate_for: ['special_occasion'], season_ok: ['winter'], typical_budget_inr: [8000, 80000] },
  { name: 'mysore silk', lightness: 'light', drape: 'close', difficulty: 'easy', appropriate_for: ['everyday_office', 'special_occasion'], season_ok: ['winter', 'monsoon'], typical_budget_inr: [5000, 15000] },

  // Cottons (daily, office)
  { name: 'tant', lightness: 'light', drape: 'close', difficulty: 'easy', appropriate_for: ['everyday_home', 'everyday_office'], season_ok: ['summer', 'monsoon'], typical_budget_inr: [1500, 5000] },
  { name: 'mangalagiri', lightness: 'light', drape: 'close', difficulty: 'easy', appropriate_for: ['everyday_office', 'everyday_home'], season_ok: ['summer', 'monsoon'], typical_budget_inr: [1500, 5000] },
  { name: 'mul cotton', lightness: 'light', drape: 'close', difficulty: 'easy', appropriate_for: ['everyday_home', 'everyday_office'], season_ok: ['summer'], typical_budget_inr: [800, 3000] },

  // Cotton-silk blends (office, day events)
  { name: 'chanderi', lightness: 'light', drape: 'close', difficulty: 'medium', appropriate_for: ['everyday_home', 'everyday_office', 'special_occasion'], season_ok: ['summer', 'winter'], typical_budget_inr: [3000, 25000] },
  { name: 'maheshwari', lightness: 'light', drape: 'close', difficulty: 'easy', appropriate_for: ['everyday_office', 'everyday_home', 'special_occasion'], season_ok: ['summer', 'winter'], typical_budget_inr: [3000, 10000] },
  { name: 'kota doria', lightness: 'light', drape: 'close', difficulty: 'medium', appropriate_for: ['everyday_office', 'everyday_home', 'special_occasion'], season_ok: ['summer'], typical_budget_inr: [3000, 10000] },

  // Synthetics / modern (daily, practical, budget-friendly)
  { name: 'georgette', lightness: 'light', drape: 'close', difficulty: 'medium', appropriate_for: ['everyday_office', 'everyday_home', 'special_occasion'], season_ok: ['summer', 'monsoon', 'winter'], typical_budget_inr: [800, 4000] },
  { name: 'chiffon', lightness: 'light', drape: 'close', difficulty: 'medium', appropriate_for: ['everyday_office', 'everyday_home', 'special_occasion'], season_ok: ['summer', 'monsoon'], typical_budget_inr: [800, 5000] },
  { name: 'organza', lightness: 'medium', drape: 'stand_away', difficulty: 'hard', appropriate_for: ['special_occasion'], season_ok: ['summer', 'winter'], typical_budget_inr: [2000, 15000] },
];

function fabricCandidates(profile: Profile): { candidates: FabricRule[]; excluded: FabricRule[]; reasons: string[] } {
  const reasons: string[] = [];
  const out: FabricRule[] = [];
  const excluded: FabricRule[] = [];

  for (const f of FABRICS) {
    const failures: string[] = [];

    if (!f.appropriate_for.includes(profile.use_case)) failures.push(`not for ${profile.use_case}`);
    if (!f.season_ok.includes(profile.season)) failures.push(`not for ${profile.season}`);
    if (profile.drape_volume !== 'either' && f.drape !== 'either' && f.drape !== profile.drape_volume) {
      failures.push(`drape mismatch (wants ${profile.drape_volume})`);
    }
    if (profile.draping_skill === 'hassle_free' && f.difficulty === 'hard') failures.push('too hard to drape');
    if (profile.draping_skill === 'medium_pro' && f.difficulty === 'hard') failures.push('too hard for medium-pro draper');
    if (f.typical_budget_inr[0] > profile.budget_inr_max) failures.push(`entry price ₹${f.typical_budget_inr[0]} exceeds budget`);
    if (profile.fabric_aversions.includes(f.name)) failures.push('on aversion list');

    if (failures.length === 0) {
      out.push(f);
    } else {
      excluded.push(f);
      reasons.push(`${f.name}: ${failures.join(', ')}`);
    }
  }

  return { candidates: out, excluded, reasons };
}

// -- Saturation rule --

function saturationPref(profile: Profile): { saturation: Saturation; note: string } {
  const notes: string[] = [];
  if (profile.time_of_day === 'day') notes.push('daytime in natural light, very bright saturation can read heavy');
  if (profile.time_of_day === 'night') notes.push('artificial light, muted tones flatten, metallics and jewel tones pop');
  if (profile.complexion_depth === 'deep') notes.push('deep skin punishes muted dusty tones; lean saturated');

  let sat: Saturation = 'mid';
  if (profile.complexion_depth === 'deep') sat = 'vivid';
  else if (profile.complexion_depth === 'light' && profile.time_of_day === 'day' && profile.undertone === 'warm') sat = 'mid';
  else if (profile.complexion_depth === 'light' && profile.time_of_day === 'day') sat = 'mid';
  else if (profile.time_of_day === 'night') sat = 'vivid';

  return { saturation: sat, note: notes.join('; ') };
}

// -- Budget substitution note --

function budgetNote(profile: Profile, candidateFabrics: FabricRule[]): string {
  const cap = profile.budget_inr_max;
  const dropped: string[] = [];
  if (cap < 8000) dropped.push('pure Kanjeevaram silk');
  if (cap < 5000) dropped.push('pure Banarasi silk');
  if (cap < 4000) dropped.push('Raw Mango and designer handloom');
  if (cap < 1500) dropped.push('Chanderi at original prices');

  const subs: string[] = [];
  if (cap < 8000) subs.push('tested-zari Kanjeevaram in place of pure silk');
  if (cap < 3000) subs.push('semi-Ikkat in place of original Ikkat, semi-Chanderi in place of pure');

  const parts: string[] = [`Budget cap ₹${cap}.`];
  if (dropped.length) parts.push(`Out of range: ${dropped.join(', ')}.`);
  if (subs.length) parts.push(`Substitutions: ${subs.join('; ')}.`);
  parts.push(`${candidateFabrics.length} fabric families in range.`);
  return parts.join(' ');
}

// -- Search query generation --

function colorSearchTerms(family: ColorFamily): string[] {
  // Map a color family to 1-2 shoppable color words stylists/retailers use
  const map: Record<ColorFamily, string[]> = {
    red_warm: ['tomato red', 'brick red'],
    red_cool: ['ruby red', 'cool red'],
    pink_cool: ['magenta', 'fuchsia'],
    pink_warm: ['coral', 'peach'],
    orange_earth: ['rust', 'terracotta'],
    yellow_warm: ['mustard', 'marigold'],
    yellow_cool: ['pale lemon'],
    green_warm: ['olive', 'moss'],
    green_cool: ['emerald', 'bottle green'],
    blue_cool: ['royal blue', 'sapphire'],
    blue_warm: ['teal', 'peacock'],
    purple: ['plum', 'aubergine'],
    neutral_warm: ['ivory', 'gold'],
    neutral_cool: ['silver', 'charcoal'],
  };
  return map[family];
}

function generateSearchQueries(profile: Profile, palette: { flatter: ColorFamily[] }, fabrics: FabricRule[]): string[] {
  // One primary color term per family, so we get diversity across the palette
  const topColors = palette.flatter.slice(0, 4).map(f => colorSearchTerms(f)[0]);
  const topFabrics = fabrics.slice(0, 3).map(f => f.name);
  const queries: string[] = [];

  for (const color of topColors.slice(0, 3)) {
    for (const fabric of topFabrics.slice(0, 2)) {
      queries.push(`${color} ${fabric} saree under ${profile.budget_inr_max}`);
    }
  }

  if (topColors[3]) queries.push(`${topColors[3]} saree under ${profile.budget_inr_max}`);
  queries.push(`lightweight ${profile.use_case.replace('_', ' ')} saree under ${profile.budget_inr_max}`);

  return Array.from(new Set(queries)).slice(0, 8);
}

// -- Summary text --

function writeSummary(profile: Profile, bucket: ComplexionBucket, sat: Saturation, fabricCount: number): string {
  const useCase = profile.use_case.replace('_', ' ');
  return [
    `${useCase} saree for a ${profile.complexion_depth}-${profile.undertone} wearer in ${profile.location} ${profile.season}.`,
    `Lean ${sat} saturation, ${profile.time_of_day} wear.`,
    `${profile.drape_volume === 'close' ? 'Close-draping' : profile.drape_volume === 'stand_away' ? 'Stand-away' : 'Any'} fabric, ${profile.draping_skill.replace('_', ' ')} draper.`,
    `Color direction: ${PALETTE[bucket].emphasis}.`,
    `${fabricCount} fabric families pass the filters under ₹${profile.budget_inr_max}.`,
  ].join(' ');
}

// -- Main entry point --

export function generateRubric(profile: Profile): Rubric {
  const bucket = bucketOf(profile.complexion_depth, profile.undertone);
  const palette = PALETTE[bucket];
  const { candidates, excluded, reasons } = fabricCandidates(profile);
  const { saturation, note: dayNightNote } = saturationPref(profile);
  const budget_notes = budgetNote(profile, candidates);
  const search_queries = generateSearchQueries(profile, palette, candidates);
  const summary = writeSummary(profile, bucket, saturation, candidates.length);

  return {
    summary,
    complexion_bucket: bucket,
    colors: palette,
    fabrics: {
      candidates: candidates.map(f => f.name),
      excluded: excluded.map(f => f.name),
      excluded_reason: reasons.slice(0, 6).join(' | '),
    },
    saturation,
    day_night_note: dayNightNote,
    budget_notes,
    search_queries,
  };
}

// -- Adapter from new intake shape --

function jewelryToUndertone(j: JewelryLean | undefined): Undertone {
  if (j === 'gold') return 'warm';
  if (j === 'silver') return 'cool';
  return 'neutral';
}

function climateToSeason(c: ClimateProfile): Season {
  if (c.rainy) return 'monsoon';
  if (c.bucket === 'cool') return 'winter';
  if (c.bucket === 'hot_humid' || c.bucket === 'hot_dry') return 'summer';
  return c.avgTempC >= 22 ? 'summer' : 'winter';
}

// Expects every intake field to be defined; caller validates.
export function buildRubricFromIntake(
  answers: Required<IntakeAnswers>,
  climate: ClimateProfile,
): Rubric {
  const profile: Profile = {
    use_case: answers.useCase,
    location: climate.city,
    season: climateToSeason(climate),
    time_of_day: answers.timeOfDay,
    complexion_depth: answers.skinDepth,
    undertone: jewelryToUndertone(answers.jewelryLean),
    draping_skill: answers.drapingSkill,
    budget_inr_max: answers.budgetInr,
    // Fields cut from intake. Safe defaults so the legacy filter is lenient.
    drape_volume: 'either',
    solids_vs_prints: 'either',
    fabric_aversions: [],
  };
  return generateRubric(profile);
}
