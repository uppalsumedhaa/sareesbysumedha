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
1. Use web_search to find candidate products matching the rubric's fabric candidates, flatter color families, and budget target band.
2. Use web_fetch on promising product URLs to verify price, image URL, and in-stock status. Discard anything that's out of stock or not on an approved retailer.
3. DIVERSITY (hard rule, not a preference):
   - The three picks must come from at least two different retailers. Three picks from one retailer is wrong, even if quality is high.
   - The three picks must use at least two different fabrics. Three banarasis is wrong, three mul cottons is wrong.
   - If the only way to satisfy diversity is to drop a slightly stronger pick for a slightly weaker one, do that — variety is part of the value.
4. Prefer products that match both a flatter color family AND a candidate fabric.
5. Never include avoid-list color families unless nothing else is available.

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

  // Hard ceiling on the tool-loop runtime. Vercel kills the function at
  // 300s; if Sonnet's web_search/web_fetch loop runs that long, the user just
  // sees a hang. Better to abort at 90s and fall through to the catalog.
  const SEARCH_TIMEOUT_MS = 90_000;

  let finalText = '';
  try {
    const stream = client.messages.stream(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
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
