# Zarf, current state

Handoff notes as of 2026-04-25 (last refresh after wiring live agentic search and seeding the fallback catalog). Read this alongside `PRD.md`, `CLAUDE.md`, and the user-memory files under `~/.claude/projects/-Users-sumedhauppal-sareesbysumedha/memory/`.

---

## Product decisions locked

### Intake inputs (the locked model)

Seven inputs decide a saree recommendation. Every question in the flow must map to one of these seven. Do not add new dimensions without explicit approval.

1. Use case: `everyday_office` | `everyday_home` | `special_occasion`
2. City + month. Season is **not** asked. Climate (avg temp, humidity, monthly precipitation, bucket) is fetched from Open-Meteo at submit time using the city's geocoded lat/lon and the answered month. See `lib/weather/climate.ts`.
3. Time of day: `day` | `night`
4. Complexion depth: `light` | `wheatish` | `deep`. Renamed from `fair` to `light` end-to-end (rubric, palette keys, color-theory doc) because "fair" carries colorist baggage in the Indian context.
5. Undertone: asked via a jewelry-test-style question (yellow gold vs silver). Fallback to `neutral` when uncertain. Never surface to user as jargon.
6. Draping skill: `hassle_free` | `medium_pro` | `pro`
7. Budget (INR max). Drives substitution within fabric families (pure Kanjivaram becomes tested-zari, original Ikkat becomes semi-Ikkat).

**Cut from earlier drafts. Do not re-add without approval:**
- Drape volume preference (`close` | `stand_away`) — body-type proxy, did not move the JPMC result.
- Solids vs prints — taste, not a filter. Retailer stock naturally carries both.
- Vibe / moodboard — belongs in a styling layer, not in saree selection.
- Wedding guest-coordination ("what will others wear") — too situational.
- Age bracket — flagged briefly, then cut. The rubric doesn't currently use age and the question wasn't earning its slot. Bring back only if a stylist signal emerges that age (not skill, not occasion) is the actual driver.
- Asking the user to name a season — derived from city + month via Open-Meteo instead, so we don't make the user guess what "monsoon" means in their city.

### Results page

- Exactly **3 sarees** total per results page. Radical cut from PRD's cap of 8. Chosen to reduce decision fatigue.
- Each saree from a potentially different retailer to give URL variety across the three without a grocery list.

### Card shape

- Hero image (real product image from retailer)
- Title line that leads with use case ("the perfect office wear saree," "for long bangalore afternoons," "office-to-evening without a change")
- One storytelling reasoning line in elder-sister voice
- Retailer, price, single button reading only "Buy"
- Price is the trust signal. No review stars, stock pills, verification badges.

### Reasoning line rules

- Talks about: the fabric, how it'll feel to wear, how it'll make the wearer shine, how it fits the requirement (climate, occasion, day).
- Never mentions complexion, skin tone, color theory, buckets, or any backend reasoning.
- Plain English, short, warm.
- No marketing-speak. Banned: discover, curate, elevate, timeless, stunning, effortless, signature.

### Tone, locked

- No em dashes, anywhere in Zarf output.
- Warm, friendly, like an elder sister and a confidant.
- Lowercase-friendly in UI copy where it fits.

---

## Catalog knowledge built

### Fabrics, top three per category (12 total)

Stored in `lib/recommendation/generateRubric.ts`.

- **Silks (heritage, occasion):** Kanjivaram, Banarasi, Mysore silk
- **Cottons (daily, office):** Tant, Mangalagiri, Mul cotton
- **Cotton-silk blends (office, day events):** Chanderi, Maheshwari, Kota Doria
- **Synthetics / modern (daily, practical):** Georgette, Chiffon, Organza

Each fabric has: lightness, drape type, draping difficulty, use-case fit, season fit, typical price range. Price ranges reflect 2026 benchmarks in `docs/saree-reference.md` section 11.

### Color theory

Full brief saved at `lib/color/color-theory.md`. Nine complexion buckets (3 depths x 3 undertones: warm / cool / neutral-or-olive). Each bucket has a `flatter` and `avoid` list over 14 color families. Day vs night modulates saturation and finish, not undertone. Olive is treated as a distinct undertone and has its own avoid rules (yellow-greens).

### Saree reference

`docs/saree-reference.md`. 16 sections: anatomy, fabric guide, regional weaves by region, weaving techniques, motif vocabulary, color symbolism, occasion guide, drapes, body-type guide, authenticity tests, price benchmarks, care, buying checklist, shopkeeper questions, glossary, how to keep learning.

### Retailers

- Marketplaces (reviews-rich): Myntra, Ajio
- D2C and specialty: Nalli, Taneira, Karagiri, Suta
- Premium tier: Raw Mango (only when budget supports it)
- D2C others: open, case by case, gated on credibility

---

## Code built

### Intake (live end-to-end)

All seven questions are live under `app/(intake)/`. Welcome → `/use-case` → `/where` → `/time-of-day` → `/skin` → `/jewelry` → `/draping` → `/budget` → `/dev/results`. Final CTA reads **"what's my saree?"**

Shared state: `lib/intake/store.ts` (zustand). Each page reads its prior answer from the store on mount and writes on continue. No persistence yet, refresh wipes state — add `persist` middleware when needed.

Welcome screen: hero is `your saree / matchmaker[•]` rendered in two staggered reveals; bindi-disc top-right has been replaced with the Zarf line-art mark (`public/brand/zarf-mark-circle.jpg`) cropped to a circle. Top-left wordmark restored.

### Climate

`lib/weather/climate.ts` geocodes a city via Open-Meteo (no API key), pulls the previous-year monthly archive, and returns `{avgTempC, avgHumidity, precipMm, rainy, bucket}` where bucket is one of `hot_humid` | `hot_dry` | `temperate` | `cool`. Dev endpoint at `app/api/dev/climate/route.ts`.

### Rubric

`lib/recommendation/generateRubric.ts`, deterministic. Takes the legacy `Profile` shape, returns complexion bucket, color palette, fabric candidates, saturation, budget notes, and search queries. New helper `buildRubricFromIntake(answers, climate)` maps the 7-input intake + ClimateProfile into a Profile and runs the generator. Drape-volume / solids-vs-prints / fabric-aversions are passed as defaults (`'either'`, `[]`) since they were cut from intake.

### Live agentic search (Path D)

`lib/search/agentic.ts` calls **Claude Opus 4.7** via the Anthropic SDK with server-side `web_search_20260209` + `web_fetch_20260209` tools. Briefs the model with rubric + climate + intake, gets back three real in-stock products as JSON. System prompt is `cache_control: ephemeral`-tagged.

Server action: `app/(intake)/actions.ts → runIntake(answers)` orchestrates climate fetch → rubric → live search and returns `{rubric, climate, picks, searchError?}`. Live search failure does not bubble — the page still gets the rubric.

Requires `ANTHROPIC_API_KEY` in `.env.local`. Cost: ~$0.05–0.20 per intake. Path A/B/C alternatives are documented in chat history; Path D was the chosen direction.

### Results page

`app/dev/results/page.tsx`, client component. Reads intake from the store, calls the server action, renders:
- Headline: **"the chosen three for you"** (static)
- Subhead: dynamic, derived from intake (`three picks for everyday office wear in bangalore, june.`)
- Three cards with real product images, prices, retailer attribution, Buy buttons
- Collapsible debug panel: climate readings, complexion bucket, color direction, fabric candidates, saturation, budget notes — so Sumi can verify the rubric
- Loading state: *"scouting in-stock sarees across soch, suta, nalli, taneira, karagiri. this takes 15-30 seconds."*
- Empty/error states with a clear "start over" link

### Fallback catalog (live, scoring + wiring done)

`lib/catalog/data.ts` has 25 hand-verified in-stock sarees from Suta, Karagiri, Soch, and Raw Mango, tagged with fabric / color family / saturation / **embellishment** / use cases / seasons (schema in `lib/catalog/types.ts`).

`lib/catalog/score.ts` scores the catalog deterministically:
- Hard filters: budget cap, use case match, embellishment level (heavy is hard-failed for everyday_office and everyday_home — see Embellishment dimension below).
- Soft scoring: color flatter (+3), color avoid (-5), fabric candidate (+2), fabric excluded (-3), saturation match (+1), season ok (+1), price-fit bonus when ≤ 80% of budget (+0.5).
- Diversity pass: walks the sorted list, picks each saree only if its fabric hasn't been seen yet — stops 3-of-the-same-fabric outputs.

`runIntake` in `app/(intake)/actions.ts` calls live search first; on failure or empty result, falls back to `pickFromCatalog`. The result includes `picksSource: 'live' | 'catalog' | 'none'` so the page can render an honest "scored from our verified backup pool" banner when the fallback fires.

Known catalog gap: the everyday_office tier is **mul-cotton-dominant** (7 of 11 candidates from the seed pool). The diversity pass surfaces non-cotton picks but the alternates are thin. Real catalog needs more linen / cotton-silk / chanderi options at office price points.

### Embellishment dimension

Added to `CatalogSaree` and to the live-search system prompt after Sumi caught a "Navy Blue Chiffon Floral Print Saree With Stone Work" being recommended for a daytime office brief. Stone work / mirror work / sequins / heavy zari / dense embroidery is `embellishment: 'heavy'`; small prints, light thread work, woven borders are `subtle`; plain woven is `plain`. Heavy hard-fails for everyday_office and everyday_home, both in the catalog scorer and in the agentic search prompt. See `feedback_embellishment_disqualifies_everyday.md` in user memory.

### Old flow

The pre-lock 5-stage flow was deleted in commit `3b7394a`. The intake under `app/(intake)/` is the only flow.

---

## Test cases discussed

1. **JPMC friend** (case #1, complete): office everyday, Bangalore summer, light skin, neutral undertone (fallback), medium-pro draper, budget ₹3000 max. Ground truth from Sumi: bright magenta georgette. This is the profile driving the current POC.
2. **Friend's mother** (case #2, partial): homewear, pro draper, Chanderi in earthy colors. Budget, complexion, and other inputs not filled in.
3. **Haldi bridesmaid** (case #3, partial): dark skin, morning haldi function, medium-pro draper, chiffon in mehendi green. Revealed a tension between color theory (yellow flatters deep-warm skin) and social context (avoiding the haldi-yellow uniform at a ceremony), which we flagged but did not encode.

---

## Pending

### Immediate

1. **Expand the everyday_office catalog tier.** Mul-cotton-heavy seed pool means the diversity pass under-delivers variety. Need ~5-8 more entries: Mangalagiri at office price, Tant cotton with woven borders, Chanderi cotton (not silk) under ₹5k, Maheshwari cotton-silk, light handloom silk under ₹6k, plain crepe / silk-blend office wear. Skip anything heavy on embellishment.

2. **Move the rubric debug panel behind a dev flag.** It's currently always visible at the bottom of `/dev/results`. For real users it should hide unless `?debug=1` or the user is on a localhost build. The panel exists for Sumi's verification, not the customer.

3. **Verify embellishment tagging is right across all 25 entries.** I tagged on best-effort visual + product-name read; Sumi should spot-check a few. Especially: did I correctly mark which Suta chanderi-silks are subtle vs which would read as more decorated?

### Quality and trust

- **Authenticity guardrails.** Encode the red-flag pricing rules from `docs/saree-reference.md` §10–11 (e.g., "Pure Banarasi under ₹3,500 = synthetic"). When live search returns a product whose claimed weave + price violates a floor, drop it before render.
- **Drape on the result card.** `docs/saree-reference.md` §8 maps fabric to drape (Nivi, Atpoure, Seedha Pallu, Nauvari). Surface a one-line drape suggestion on each card. No new intake question needed.
- **Care badge.** One line per card ("dry clean only" / "hand wash, line dry"). Pulled from §12 of the saree reference, mapped per fabric family.
- **Special-occasion follow-up.** When `useCase === 'special_occasion'`, the rubric is still too coarse. Saree reference §7 distinguishes haldi, mehendi, sangeet, cocktail, ceremony, reception — each with its own color/fabric profile. Add a Q1.5 conditional follow-up to capture which.

### Plumbing

- Affiliate link setup via Cuelinks (planned, not wired).
- Persist intake answers across refresh by adding zustand's `persist` middleware to `lib/intake/store.ts`.
- Move `/dev/results` to a real `/results` route, retire the dev path.

---

## Key memory files (auto-loaded in any future session)

Under `~/.claude/projects/-Users-sumedhauppal-sareesbysumedha/memory/`:

- `project_name_and_brand.md`, Zarf, bindi red #8E1929
- `user_role_and_expertise.md`, Sumi's real-life 6-input stylist method, now expanded to 9
- `feedback_first_cut_cadence.md`, show minimal visible slice before running the rest
- `feedback_no_em_dashes.md`
- `feedback_keep_intake_short.md`, cut inputs, don't add
- `feedback_hide_expertise_show_links.md`, rubric is backstage, user sees tangible sarees
- `feedback_elder_sister_voice.md`, voice of user-facing copy
- `project_recommendation_card_conventions.md`, the card shape locked today

---

## Open questions to raise in the next session

- The cards from live search still call retailers like "Soch" and "Karagiri" by name. Does Sumi want a single neutral retailer chip, or to keep retailer attribution visible (trust signal)?
- When live search returns 1 or 2 picks instead of 3, do we backfill from the catalog, show fewer cards with a note, or refuse and ask the user to widen budget?
- Special-occasion follow-up (Q1.5 conditional): worth building in the intake, or do we keep the special-occasion path coarse and let the agentic search figure out subtype from "context the user types in"?
- Affiliate plumbing via Cuelinks vs direct retailer links: when do we wire it?
