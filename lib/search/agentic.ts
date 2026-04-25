// Live saree search via Claude Opus 4.7 with server-side web_search +
// web_fetch. The model is briefed with the user's rubric and climate, runs
// its own search loop on Anthropic infra, and returns three in-stock picks
// from approved retailers as a JSON block.
//
// Why this shape (Path D):
//   - no scraping, no per-retailer parsers
//   - real products, real links, verified in-stock at submit time
//   - costs ~$0.05-0.20 per intake depending on search depth
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

// System prompt is stable across every intake: cache it. Must be > ~4096
// tokens on Opus 4.7 to cache; keeping it terse means no cache write until we
// hit the threshold, but the cache_control marker is correct to have in place.
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
1. Use web_search to find candidate products matching the rubric's fabric candidates, flatter color families, and budget.
2. Use web_fetch on promising product URLs to verify price, image URL, and in-stock status. Discard anything that's out of stock or not on an approved retailer.
3. Prefer retailer diversity across the three picks when quality allows.
4. Prefer products that match both a flatter color family AND a candidate fabric.
5. Never include avoid-list color families unless nothing else is available.

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
- Budget max: ₹${answers.budgetInr}

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

  let finalText = '';
  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-7',
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
    });
    const message = await stream.finalMessage();
    for (const block of message.content) {
      if (block.type === 'text') finalText += block.text + '\n';
    }
  } catch (err) {
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
