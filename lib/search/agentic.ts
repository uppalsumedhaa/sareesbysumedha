// Live saree search via Claude Sonnet 4.6 with server-side web_search +
// web_fetch. The model is briefed with the user's rubric and climate, runs
// its own search loop on Anthropic infra, and returns three in-stock picks
// from approved retailers as a JSON block.
//
// Why this shape (Path D):
//   - no scraping, no per-retailer parsers
//   - real products, real links, verified in-stock at submit time
//   - costs ~$0.02-0.08 per intake depending on search depth
//
// Requires ANTHROPIC_API_KEY in the env (e.g. .env.local for dev).

import Anthropic from '@anthropic-ai/sdk';
import type { IntakeAnswers } from '@/lib/copy/intake';
import type { ClimateProfile } from '@/lib/weather/climate';
import type { Rubric } from '@/lib/recommendation/generateRubric';

export interface LiveSaree {
  productName: string;
  productUrl: string;
  imageUrl: string;
  retailer: string;
  priceInr: number;
  fabricLabel: string;
  direction: string;
  reasoning: string;
}

export class AgenticSearchError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'AgenticSearchError';
    this.cause = cause;
  }
}

// System prompt is stable across every intake: cache it. Sonnet 4.6's prompt
// cache threshold is 1024 tokens, which this prompt clears comfortably, so
// repeat intakes within the 5-minute TTL pay a fraction of the input-token
// cost. Worth the cache_control marker.
const SYSTEM_PROMPT = `You are Zarf's saree scout. Zarf is a discovery app that helps Indian women find the right saree for a specific occasion. Your job: given a user's intake profile and rubric, find three real, currently in-stock sarees from approved Indian retailers and return them as JSON.

APPROVED RETAILERS (only these — reject any product not on this list):
- soch.com
- suta.in
- nalli.com
- taneira.com
- karagiri.com
- myntra.com
- ajio.com

WORK STEPS:
1. Use web_search to find candidate products matching the rubric's fabric candidates, flatter color families, and budget target band. Use AT MOST 4 web_search calls.
2. Use web_fetch ONLY when the search snippet doesn't already show the price and in-stock signal. Most retailer search snippets contain both — fetch is expensive and slow, so don't fetch for verification when the snippet has what you need. Use AT MOST 2 web_fetch calls in the whole task.
3. CONVERGENCE: The first three picks that satisfy the diversity rule, the budget band, and the embellishment rule are good enough. Do not keep searching for marginally better matches once you have three valid picks. Speed matters more than picking the absolute best.
4. DIVERSITY (hard rule, not a preference):
   - The three picks must come from at least two different retailers. Three picks from one retailer is wrong, even if quality is high.
   - The three picks must use at least two different fabrics. Three banarasis is wrong, three mul cottons is wrong.
   - If the only way to satisfy diversity is to drop a slightly stronger pick for a slightly weaker one, do that — variety is part of the value.
5. Prefer products that match both a flatter color family AND a candidate fabric.
6. Never include avoid-list color families unless nothing else is available.

BUDGET RULES (hard, not soft):
- The user's budget is a TARGET BAND, not a cap. They have specified both a floor and a max.
- Do NOT return products priced below the floor. A user shopping at ₹15,000 does not want a ₹2,500 mul cotton. That reads as "you ignored my budget."
- Aim the three picks at the upper half of the band. One pick may sit in the lower half if it's exceptional, but never below the floor.
- At higher budgets for everyday wear (≥ ₹5,000), favor LINEN sarees, premium handlooms (chanderi, maheshwari, kota doria), mysore silk, and brand-tier cottons (Suta's premium line, Anavila linen, Taneira handlooms) over basic mul cotton or entry-level synthetics.

EMBELLISHMENT RULES (very important):
- For \`everyday_office\` or \`everyday_home\` use cases: NEVER recommend sarees with stone work, mirror work, sequins, dense zari, or heavy embroidery. Plain woven, prints, light thread work, woven borders only. A "Floral Print Saree With Stone Work" is wrong for office wear regardless of color or price. If the product title or description mentions "stone work", "mirror work", "sequins", "embellished", "embroidered", or "heavy zari", treat it as occasion-only.
- For \`special_occasion\` + day events (haldi, mehendi, sangeet daytime, daytime ceremony): prefer subtle to mid embellishment. Heavy stone/zari can read costume-y in daylight.
- For \`special_occasion\` + evening / night events (cocktail, reception, sangeet evening, evening ceremony): heavy embellishment is fine, often preferred — catches indoor light.

VOICE RULES for the user-facing \`direction\` and \`reasoning\` fields:
- Warm, elder-sister tone. Indian-English.
- Lowercase where it reads natural.
- NEVER use em dashes. Use periods or commas for pauses.
- Banned words: discover, curate, elevate, timeless, stunning, effortless, signature, unveil, presents, embodies.
- \`direction\` is a short use-case headline at the top of the card ("the perfect office wear saree" / "for long bangalore afternoons" / "for the occasion that's coming up").
- \`reasoning\` is 2-3 short sentences. Talks about how the fabric feels, how it'll wear, how it fits the day. NEVER mentions complexion, skin tone, undertone, or color theory. Never markets at the user.

OUTPUT FORMAT — return exactly this JSON object, with no prose before or after it:
{
  "picks": [
    {
      "productName": "<exact product name from the retailer page>",
      "productUrl": "<full product page URL>",
      "imageUrl": "<full image URL that resolves to an actual image>",
      "retailer": "Soch | Suta | Nalli | Taneira | Karagiri | Myntra | Ajio",
      "priceInr": <integer in rupees>,
      "fabricLabel": "<short descriptive phrase, lowercase, e.g. 'magenta chiffon' or 'emerald green chanderi'>",
      "direction": "<short use-case headline>",
      "reasoning": "<2-3 sentence warm reasoning line>"
    }
  ]
}

If you cannot find three valid in-stock matches, return fewer entries and state what you couldn't find in the first entry's reasoning. Never fabricate URLs, prices, or image paths.`;

function buildUserPrompt(
  answers: Required<IntakeAnswers>,
  rubric: Rubric,
  climate: ClimateProfile,
): string {
  return `User brief:
- Use case: ${answers.useCase.replace('_', ' ')}
- Where / when: ${climate.city}, month ${answers.month}. climate: avg ${climate.avgTempC}°C, ${climate.avgHumidity}% humidity, ${climate.precipMm}mm rainfall (bucket: ${climate.bucket}${climate.rainy ? ', rainy' : ''})
- Time of day: ${answers.timeOfDay}
- Complexion depth: ${answers.skinDepth}
- Undertone signal: ${answers.jewelryLean} jewelry lean
- Draping skill: ${answers.drapingSkill.replace('_', ' ')}
- ${
    rubric.budget_floor_inr > 0
      ? `Budget target band: ₹${rubric.budget_floor_inr.toLocaleString('en-IN')} to ₹${rubric.budget_max_inr.toLocaleString('en-IN')} (aim upper half; never go below the floor)`
      : `Budget cap: ₹${rubric.budget_max_inr.toLocaleString('en-IN')} (small budget; no floor)`
  }

Rubric output:
- Color direction: ${rubric.colors.emphasis}
- Flatter color families: ${rubric.colors.flatter.join(', ')}
- Avoid color families: ${rubric.colors.avoid.join(', ') || '(none specified)'}
- Fabric candidates (prefer these): ${rubric.fabrics.candidates.join(', ') || '(no fabrics passed filters — widen palette and fabric search)'}
- Fabric excluded: ${rubric.fabrics.excluded.join(', ') || '(none)'}
- Saturation: ${rubric.saturation}
- Budget notes: ${rubric.budget_notes}

Find me three real, in-stock matches and return the JSON block.`;
}

function extractJsonBlock(text: string): string | null {
  // Greedy match the outermost { ... } that mentions "picks"
  const m = text.match(/\{[\s\S]*"picks"[\s\S]*\}/);
  return m ? m[0] : null;
}

export async function findLiveSarees(
  answers: Required<IntakeAnswers>,
  rubric: Rubric,
  climate: ClimateProfile,
): Promise<LiveSaree[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AgenticSearchError(
      'ANTHROPIC_API_KEY is not set. Add it to .env.local to enable live search.',
    );
  }

  const client = new Anthropic();

  // 60s is enough for Sonnet's web_search loop to converge with the tightened
  // prompt (max 4 searches, max 2 fetches, "first 3 valid wins" rule). If it
  // can't, the user gets the empty-state hero card with the shopping guide,
  // which is a designed surface, not a failure. Better to abort earlier so
  // the function has budget to render that surface within Vercel's 120s
  // route ceiling.
  const SEARCH_TIMEOUT_MS = 60_000;

  let finalText = '';
  try {
    const stream = client.messages.stream(
      {
        model: 'claude-sonnet-4-6',
        // 4k is comfortably above the JSON output (~600 tokens) plus tool-use
        // bookkeeping. Earlier 16k was burning budget on extended thinking we
        // don't need — the search loop is the actual work.
        max_tokens: 4000,
        // No `thinking` block — the model's reasoning is its tool-call sequence,
        // not extended chain-of-thought. Adaptive thinking added 10-30s with
        // marginal quality gain on this task.
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        tools: [
          { type: 'web_search_20260209', name: 'web_search' },
          { type: 'web_fetch_20260209', name: 'web_fetch' },
        ],
        messages: [
          { role: 'user', content: buildUserPrompt(answers, rubric, climate) },
        ],
      },
      { signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS) },
    );
    const message = await stream.finalMessage();
    for (const block of message.content) {
      if (block.type === 'text') finalText += block.text + '\n';
    }
  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
      throw new AgenticSearchError(
        `live search exceeded ${SEARCH_TIMEOUT_MS / 1000}s and was aborted`,
        err,
      );
    }
    throw new AgenticSearchError(
      err instanceof Error ? err.message : 'Claude API call failed',
      err,
    );
  }

  const jsonStr = extractJsonBlock(finalText);
  if (!jsonStr) {
    throw new AgenticSearchError(
      `model did not return a parseable JSON block. first 300 chars: ${finalText.slice(0, 300)}`,
    );
  }

  let parsed: { picks?: unknown };
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new AgenticSearchError(
      `failed to parse JSON from model output: ${err instanceof Error ? err.message : 'parse error'}`,
      err,
    );
  }

  if (!Array.isArray(parsed.picks)) {
    throw new AgenticSearchError('response JSON missing "picks" array');
  }

  return parsed.picks as LiveSaree[];
}

// -----------------------------------------------------------------------------
// findReferenceSaree — used as the empty-state image source. When the main
// agentic search returns zero picks (timeout, model error, etc.), we still
// want to show the user an aesthetic "this is what to look for" card. This
// function makes one fast Sonnet call, allowed at most one web_search and
// one web_fetch, with a 25s ceiling. If it can't return a clean image URL
// in that time it returns null and the UI renders text-only.
// -----------------------------------------------------------------------------

const REFERENCE_SYSTEM_PROMPT = `Find ONE representative product image of a saree matching the description. Use AT MOST one web_search call and AT MOST one web_fetch call. Don't verify in-stock. Don't pick the best one — pick the FIRST visually-relevant one and return.

Return JSON only, no prose:
{"imageUrl": "<full https URL of the image>"}

If no good image is found, return {"imageUrl": null}. Speed matters more than perfection.`;

export interface ReferenceSaree {
  imageUrl: string;
}

export async function findReferenceSaree(
  fabric: string,
  colorWord: string,
): Promise<ReferenceSaree | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const client = new Anthropic();
  const REF_TIMEOUT_MS = 25_000;

  let finalText = '';
  try {
    const stream = client.messages.stream(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: [
          {
            type: 'text',
            text: REFERENCE_SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        tools: [
          { type: 'web_search_20260209', name: 'web_search' },
          { type: 'web_fetch_20260209', name: 'web_fetch' },
        ],
        messages: [
          {
            role: 'user',
            content: `Find one image of a ${colorWord} ${fabric} saree.`,
          },
        ],
      },
      { signal: AbortSignal.timeout(REF_TIMEOUT_MS) },
    );
    const message = await stream.finalMessage();
    for (const block of message.content) {
      if (block.type === 'text') finalText += block.text + '\n';
    }
  } catch {
    return null;
  }

  // Greedy match an outer JSON object that includes "imageUrl"
  const m = finalText.match(/\{[\s\S]*?"imageUrl"[\s\S]*?\}/);
  if (!m) return null;
  let parsed: { imageUrl?: unknown };
  try {
    parsed = JSON.parse(m[0]);
  } catch {
    return null;
  }
  if (typeof parsed.imageUrl !== 'string') return null;
  if (!parsed.imageUrl.startsWith('https://')) return null;
  return { imageUrl: parsed.imageUrl };
}
