# Zarf, current state

Handoff notes as of 2026-04-25. Read this alongside `PRD.md`, `CLAUDE.md`, and the user-memory files under `~/.claude/projects/-Users-sumedhauppal-sareesbysumedha/memory/`.

---

## Product decisions locked

### Intake inputs (the locked model)

Seven inputs decide a saree recommendation. Every question in the flow must map to one of these seven. Do not add new dimensions without explicit approval.

1. Use case: `everyday_office` | `everyday_home` | `special_occasion`
2. City + month. Season is **not** asked. Climate (avg temp, humidity, monthly precipitation, bucket) is fetched from Open-Meteo at submit time using the city's geocoded lat/lon and the answered month. See `lib/weather/climate.ts`.
3. Time of day: `day` | `night`
4. Complexion depth: `fair` | `wheatish` | `deep`
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

- `lib/recommendation/generateRubric.ts`, deterministic rubric generator. Takes a profile, returns complexion bucket, color palette, fabric candidates, saturation, budget notes, and a set of search queries. No LLM call yet.
- `app/api/dev/rubric/route.ts`, dev API endpoint that runs the rubric for a hard-coded JPMC-friend profile and returns JSON.
- `app/dev/results/page.tsx`, the user-facing results page for the JPMC profile. Wired to three real, in-stock sarees (Soch magenta chiffon ombre, Suta Ode To Greens mulmul, Soch emerald chanderi) with product images and affiliate-ready URLs. Reasoning lines written in elder-sister voice.
- `app/(intake)/...`, the new intake flow. One route per question; shared layout in `app/(intake)/layout.tsx`. Question 1 (use case) is live at `/use-case`. Remaining six questions to be built next.
- `lib/weather/climate.ts`, server-side climate lookup. Geocodes a city via Open-Meteo (no API key), pulls the previous-year monthly archive, and returns `{avgTempC, avgHumidity, precipMm, rainy, bucket}` where bucket is one of `hot_humid` | `hot_dry` | `temperate` | `cool`. Dev endpoint at `app/api/dev/climate/route.ts` for spot checks.
- Old stage pages and forms (the pre-lock 5-stage flow) were deleted. The new intake is the only flow.

---

## Test cases discussed

1. **JPMC friend** (case #1, complete): office everyday, Bangalore summer, fair skin, neutral undertone (fallback), close-drape, medium-pro draper, budget ₹3000 max. Ground truth from Sumi: bright magenta georgette. This is the profile driving the current POC.
2. **Friend's mother** (case #2, partial): homewear, pro draper, Chanderi in earthy colors. Budget, complexion, and other inputs not filled in.
3. **Haldi bridesmaid** (case #3, partial): dark skin, morning haldi function, medium-pro draper, chiffon in mehendi green. Revealed a tension between color theory (yellow flatters deep-warm skin) and social context (avoiding the haldi-yellow uniform at a ceremony), which we flagged but did not encode.

---

## Pending

### Immediate: build the remaining six intake questions

Q1 (use case) is live. Still to build, in order:

2. `/where` — city (free text, geocoded) + month (1–12). Climate fetched at submit time from `lib/weather/climate.ts`.
3. `/time-of-day` — day | night
4. `/skin` — fair | wheatish | deep
5. `/jewelry` — gold | silver | either (jewelry-test proxy for undertone)
6. `/draping` — hassle-free | medium-pro | pro
7. `/budget` — INR slider

Cadence: build one screen, push, get Sumi's feedback, then build the next.

Each question is its own route under `app/(intake)/`. After Q7, intake submits to a new route (TBD `/results`) that runs the rubric against the collected inputs and renders the three-card output currently living at `/dev/results`.

State management: for the slice, Q1 uses local state only. Once two or more questions are wired in sequence, add a minimal intake store (likely Zustand, single file under `lib/intake/`). Do not restore the old `lib/session/` abstractions.

### After intake is whole

- Wire rubric → retailer search → results. Currently the JPMC case is hand-wired at `/dev/results`. That becomes dynamic once intake feeds the rubric.
- Credibility plus reviews filter layer: when a saree passes rubric + search, verify the retailer is on the approved list before it makes the page.
- Affiliate link setup via Cuelinks (planned, not wired).
- LLM-synthesized human-readable rubric summary, optional replacement for deterministic templating.

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

- Once real sarees land on the page, does the 3-card layout still feel right, or do we need a different shape for mobile (stacked) vs desktop (grid)?
- How do we want to handle the case where the rubric cannot find 3 sarees meeting all filters? (Relax budget? Widen fabric pool? Show fewer than 3?)
- Does vibe come back as a styling-tip-only input, or do we drop it entirely for V1?
- Intake form reshape: big or incremental? Sumi's existing stages 1 through 5 will need rework.
