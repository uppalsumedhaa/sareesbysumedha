# Zarf — A saree confidence app

**Product Requirements Document**
*v1.0 — Solo build spec*

---

## Summary

Zarf is a discovery and confidence app for women who want to wear sarees but find the whole process intimidating — choosing one, pairing a blouse, draping it, feeling sure about the look. Users answer a short Pinterest-style flow about occasion, vibe, and climate, optionally upload a photo for personalized color recommendations, and receive a small set of complete looks with drape tutorials and a shareable link to get a second opinion.

The app is not a marketplace. It does not process payments. It links out to retailers via affiliate links. The goal is to make the act of buying and wearing a saree feel accessible, not to own the transaction.

### Who should read it

- The builder (Sumi) — as the north-star spec to build against
- Any contractor, designer, or collaborator brought in later
- Future Sumi, 3 months from now, when the scope has drifted

### Owner

Sumi Uppal — product, design, build, everything.

---

## 1. Product positioning

### 1.1 The one-line

Zarf helps you figure out what saree to buy, how to wear it, and whether it actually looks good on you — without needing an auntie on call.

### 1.2 What we are

- A guided discovery tool for sarees
- A confidence layer that reduces intimidation around wearing one
- A light styling assistant (blouse, drape, accessories)
- A social second-opinion loop (share with mum, friend, sister)

### 1.3 What we are not

- A marketplace or checkout experience
- An encyclopedia of sarees (we curate, we don't catalog)
- A heritage/craft storytelling platform (that voice is already saturated)
- An Instagram-style inspiration feed (too passive)

### 1.4 Who it's for

**Primary persona — Meera, 26, Bangalore**

Works in tech or marketing. Urban. Has worn maybe 4–5 sarees in her life, usually at weddings, always with someone else helping her drape. Owns two sarees she rarely wears because she's not sure what blouses go with them. Gets invited to 3–4 weddings this year. Would prefer to handle this herself but doesn't know where to start. Shops online by default, has a budget of ₹3,000–₹15,000 for a saree, but will spend more for something special.

**Secondary persona — Ananya, 22, first-time wearer**

College student or early-career. Never worn a saree alone. Cousin's wedding coming up, family is insisting. Anxious about drape, about looking "old," about whether she'll feel comfortable. Needs the most handholding. Budget ₹2,000–₹6,000. High social-share propensity.

**Tertiary persona — the confident wearer**

Knows what she likes. Uses the app for curation speed, not education. May upload a saree she already owns and ask for blouse/accessory pairings. Lower priority for V1 but the data model should not exclude her.

### 1.5 Why this exists (positioning moat)

Every saree e-commerce site optimizes for browsing inventory. Nobody optimizes for the emotional journey of deciding to wear one. The category leaders (Myntra, Ajio, specialized sites like Suta, Taneira) are all transactional. Pinterest and Instagram offer inspiration but no structure. Zarf sits between the two — inspiration with a decision path attached.

---

## 2. Tone and language principles

This is a design primitive, not a footnote. Every screen, button, error state, and empty state should be audited against these principles before shipping.

### 2.1 Voice attributes

- Warm, slightly funny, never precious
- Permission-giving, not prescriptive
- Specific and offhand, not grand or reverent
- Lowercase-friendly where it fits the moment
- Closer to a cool older cousin than a museum plaque

### 2.2 Rules

- No jargon without a one-line plain-English gloss the first time it appears. "Chanderi (a light, slightly crisp silk-cotton blend — breathes well)" not "Chanderi saree."
- No gatekeeping phrases. Kill "as you know," "obviously," "traditional wisdom says."
- Never shame a shortcut. Pre-pleated sarees, safety pins, borrowed blouses — all legitimate, framed as such.
- Avoid the reverent "heritage craft" voice. No "timeless elegance," no "woven stories."
- No body-shaming or size-based prescriptions. Body-type guidance is optional and framed as "what tends to flatter," not "what you should hide."

### 2.3 Copy examples

| Moment | Bad | Good |
|---|---|---|
| Onboarding welcome | Welcome to the world of sarees. | sarees are easier than they look. we'll figure this out together — takes about 5 minutes. |
| Asking for a photo | Upload your photograph for analysis | want us to suggest colors that'll look great on you? upload a selfie — we just look at your coloring, nothing weird. |
| Explaining a material | Kanjeevaram is a traditional South Indian silk. | Kanjeevaram — heavy silk, holds a grand drape, hot to wear outdoors. Best for AC weddings. |
| Zarf guidance | Ensure the pleats are perfectly aligned. | pleats don't have to be perfect. nobody's measuring. a safety pin is your friend. |
| No results state | No matches found. | hmm, nothing great for this combo. try loosening your budget or switching the vibe? |
| Share success | Link copied to clipboard. | sent! now go stress her out. |

---

## 3. User journey

The flow is structured as a single guided onboarding that produces a results page, with optional branches. Total target time: 4–6 minutes.

### 3.1 Journey overview

| Stage | Purpose | User time |
|---|---|---|
| 0. Welcome | Set expectations, reduce anxiety | 10 sec |
| 1. Occasion | Capture the "why" — event, role, reuse intent, budget | 45 sec |
| 2. Climate | Auto-detected, confirm / override | 15 sec |
| 3. Vibe | Pinterest-style image grid; emotional centerpiece | 60–90 sec |
| 4. Photo (optional) | Color analysis for personalized palette | 30 sec |
| 5. Styling prefs | Blouse/crop top, drape style, accessories | 45 sec |
| 6. Results | 5–8 curated looks with reasoning | browse |
| 7. Look detail | Full look, drape video, affiliate links | browse |
| 8. Share / save | Second-opinion link, save to moodboard | optional |

### 3.2 Stage 0 — Welcome

**Goal**

Reduce landing-page bounce. Set tone. Signal that the app is short and low-pressure.

**Screen**

- Full-bleed soft image of a saree, not a model's face (less intimidating)
- Headline: "sarees are easier than they look."
- Subhead: "figure out what to buy, how to wear it, and whether mum will approve. takes 5 minutes."
- Primary CTA: "let's start"
- Secondary CTA (small, below): "i already own a saree, help me style it" (V2 — stub this out with "coming soon")

### 3.3 Stage 1 — Occasion & intent

**Goal**

Capture event type, role, reuse intent, and budget. These are the hardest filters — everything downstream keys off them.

**Inputs**

- **What's this for?** (single-select, visual tiles)
  - Wedding
  - Festival / pooja
  - Work or professional
  - Casual / everyday
  - Party / cocktail / reception
  - Not sure yet — just browsing

- **What's your role?** (shown only if wedding selected. captures whether it's your own wedding or someone else's)
  - Bride
  - Bridesmaid / close friend
  - Family of bride or groom
  - Guest

- **How many times will you wear this?** (slider or 3-option select)
  - Just this once — it's a statement
  - A few times a year
  - I want to actually wear it often

- **Budget** (slider, ₹1K to ₹2L+, with bands)
  - Everyday (₹1K–₹5K)
  - Mid (₹5K–₹15K)
  - Premium (₹15K–₹50K)
  - Heirloom (₹50K+)

**Copy notes**

Budget slider has a persistent "no judgment, seriously" microcopy underneath. The reuse-intent question is new and important — it's what shifts a recommendation from Kanjeevaram (one-time wear) to Chanderi or handloom cotton (regular wear).

### 3.4 Stage 2 — Climate & context

**Goal**

Auto-detect where and when, so the material recommendation actually works in real life.

**Inputs**

- Location — auto-detected via browser geolocation, confirmable / editable
- Month of the event — date picker, defaults to "in the next month"
- Indoor / outdoor / mixed — 3-button toggle
- How long will you be in it? — "a couple of hours" / "half a day" / "all day"

**Logic**

This stage should feel like 10 seconds, not a form. Pre-fill everything; the user just confirms. Internally this maps to one of ~6 climate profiles (hot-humid, hot-dry, monsoon, winter-mild, winter-cold, AC-indoor) which filters material recommendations.

### 3.5 Stage 3 — Vibe capture

**Goal**

This is the emotional centerpiece. Pinterest-style image grid captures aesthetic preference in a way word-lists cannot.

**Screen 3a — Pick your moods**

- 12-image grid, curated moodboard tiles
- Prompt: "pick 2–3 that pull you in. trust your gut, there's no wrong answer."
- Moods to represent across the grid: minimal / soft-romantic / maximalist / old-money / festive-loud / power-dresser / boho / preppy / old-world / contemporary-edgy / sporty-modern / earthy-artisan
- Images are abstract enough to not anchor to specific sarees — think texture, color, object still-lifes, architecture, not saree product shots

**Screen 3b — Traditional vs contemporary slider**

- Visual slider with 5 stops, each labeled with a reference image
- Copy: "where are you on this?"
- Stops: classic / classic-with-a-twist / balanced / modern-with-heritage / fully contemporary

**Screen 3c — Color vetoes**

- "any colors you absolutely won't wear?" (multi-select, color swatches)
- Most people have strong opinions here — honoring them is more important than dictating what'll look good

### 3.6 Stage 4 — Photo upload (optional)

**Goal**

Personalize color recommendations using undertone and contrast analysis. Must be framed as optional and low-stakes.

**Screen**

- Prompt: "want us to suggest colors that'll look great on you? upload a selfie — we just look at your coloring, nothing weird."
- Skip CTA is equally prominent: "skip, pick colors myself"
- Reassurance microcopy: "the photo is processed and then deleted. we don't store it." (This must be true — see section 7.)

**Logic**

On upload, analyze:
- Undertone: warm / cool / neutral (skin color channel analysis)
- Contrast level: high / medium / low (difference between skin, hair, eye tones)
- Suggested palette: 8–12 saree colors that tend to flatter

Output is shown as a soft palette with language like "these tend to work beautifully with your coloring" — never "your season is autumn" or other absolutist framings.

### 3.7 Stage 5 — Styling preferences

**Inputs**

- **Blouse or crop top?**
  - Traditional blouse
  - Crop top / fusion
  - Show me both, I'm open
  - I already own a blouse I want to match (upload photo — V2)

- **Zarf style preference?**
  - Classic (Nivi)
  - Regional (Bengali / Gujarati / Maharashtrian)
  - Pant-saree / pre-stitched
  - Not sure, suggest what works

- **Accessories vibe?**
  - Temple / traditional
  - Oxidized / silver
  - Minimal gold
  - Statement / bold
  - None — the saree is the outfit

### 3.8 Stage 6 — Results

**Goal**

Show 5–8 curated looks. Not more. Choice paralysis kills confidence.

**Screen layout**

- Header: "here are 6 looks we think you'll love. tap any to see the full styling."
- Grid: 2 columns on mobile, 3 on desktop
- Each card: saree image on model + price + one-line why ("chanderi, breathes well for april bangalore, warm tones work with your coloring")
- Sticky budget meter at top — drag to rescale recommendations in real time
- Refine button: reopens vibe questions to nudge results without starting over

### 3.9 Stage 7 — Look detail

**Screen**

Full look = saree + blouse + accessories + drape + reasoning + affiliate links. One scrollable page per look.

- Hero image: saree draped on model
- "why this works for you" block (3–4 lines, specific to this user's inputs)
- Saree: name, fabric, price, "view on [retailer]" CTA (affiliate link)
- Blouse suggestion: image, style notes, retailer link
- Accessories: 2–3 pieces, image grid, retailer links
- Zarf guide: embedded video (see 3.10)
- "send to mum" share button — prominent, sticky on scroll
- "save this look" — requires login

### 3.10 Zarf guide

**Goal**

Demystify the drape. Remove the biggest anxiety source. This is arguably the highest-leverage confidence move in the entire product.

**Two modes per look**

- **Easy mode** — 5-minute drape, pre-pleated or pant-saree. Framed as "this is a real, legitimate way to wear a saree — not a shortcut." 15–45 second video.
- **Classic mode** — traditional Nivi or regional drape for this saree. Broken into forgiving steps. 45–90 second video. Permission-giving copy throughout.

**Video library**

V1 needs ~15 core drape videos (not one per saree — reuse across similar sarees).

- Nivi drape — light fabric
- Nivi drape — heavy fabric
- Bengali drape
- Gujarati / seedha pallu
- Maharashtrian nauvari (V2)
- Pant-saree — light
- Pant-saree — heavy
- Pre-pleated quick drape
- Dupatta-style drape for crop top
- Pallu styling — butterfly, open, pleated
- Blouse tucking 101
- Petticoat fitting basics
- Pinning for beginners
- Fixing a drape mid-event
- First-timer complete walkthrough

**Production**

License from creators where possible (YouTube creators often have vertical clips already), commission a small shoot in Bangalore for the gaps. Estimate: ₹40K–₹80K for the V1 library if commissioned fresh.

### 3.11 Stage 8 — Share & save

**Share flow ("send to mum")**

- One-tap share from any look
- Generates a public URL with the look + user's annotation
- Pre-filled WhatsApp message: "hey, thoughts on this? [link]"
- User can add a note: "mum, the green one is my fav, what do you think?"
- Recipient lands on a clean shared-look page with a "💬 reply" button that opens WhatsApp back to the sender

**Reply handling — the graceful-no**

The UX should gracefully handle "she said no" without making the user feel defeated. When the sender returns to the app:

- "did she love it?" — yes / no / mixed feelings
- If no: "no stress. want to see some she might prefer?" → refinement flow that asks what mum's objection was (too modern / too traditional / wrong color / too expensive) and filters accordingly
- Gentle note: "your taste is valid too — this is about finding something you both like, not overriding you."

**Save flow**

- Requires email or Google login
- Saved looks appear in a "my moodboard" tab
- User can revisit, re-share, or remove
- Over time this becomes sticky — their personal saree wishlist

---

## 4. Recommendation engine

### 4.1 How a recommendation is built

The engine is not ML. It's a rules + scoring system over a curated catalog. This is deliberate for V1 — interpretable, debuggable, and cheap.

**Inputs**

- Occasion, role, reuse intent, budget (Stage 1)
- Climate profile (Stage 2)
- Vibe vector: 3 selected moodboard tags + trad-contemp slider value + color vetoes (Stage 3)
- Optional: undertone + contrast + suggested palette (Stage 4)
- Styling prefs (Stage 5)

**Catalog schema (per saree)**

- ID, name, image URLs, retailer, affiliate link, price
- Fabric (enum: chanderi, kanjeevaram, linen, mul-cotton, chiffon, georgette, organza, handloom-cotton, tussar, banarasi, kota-doria, etc.)
- Climate suitability score per profile (1–5)
- Occasion tags (multi: wedding-guest, bride, work, casual, cocktail, festival)
- Vibe tags (multi, matching moodboard tags)
- Traditional-contemporary score (1–5)
- Dominant colors (hex array)
- Undertone compatibility (warm / cool / neutral / universal)
- Reuse-friendliness (1–5 — how workhorse vs statement)
- Associated drape video IDs
- Suggested blouse options (IDs)
- Suggested accessory options (IDs)

### 4.2 Scoring logic

Each saree gets a score per user. Top 6–8 shown. Rough weighting:

- Budget fit (hard filter — if outside budget, excluded unless within ±20%)
- Occasion match (25%)
- Climate suitability (15%)
- Vibe tag overlap (20%)
- Trad-contemp match (10%)
- Color / undertone match (15%)
- Reuse-intent alignment (10%)
- Color veto (hard filter — if saree dominant color is vetoed, excluded)
- Diversity rerank: ensure final 6 span at least 3 different fabrics and price bands

### 4.3 Catalog sourcing (V1)

Start with 150–300 hand-curated sarees across ~8–10 retailers. The quality of this catalog is the quality of the product — it's the single most important thing to get right.

**Retailers to start with**

- Suta — contemporary, cotton/linen, good price band for Ananya persona
- Taneira (Tata) — wider range, traditional to contemporary
- Ajio Luxe / Myntra — breadth and affiliate programs exist
- Jaypore — artisan/handloom
- Kalki Fashion — wedding/statement
- House of Masaba, Raw Mango — high-end / aspirational tier
- Local handloom cooperatives — authenticity signal

**Affiliate programs**

- Myntra, Ajio, Amazon India — established affiliate programs
- Smaller brands — direct affiliate arrangements, often 8–15% commission
- Cuelinks or INRDeals — aggregator affiliate networks that cover multiple Indian retailers with one integration

### 4.4 Data entry workflow

This is the unsexy but critical part. Build a simple admin interface (can be a Google Sheet in V0, a Supabase table editor in V1) where each saree is tagged against the schema. Budget 3–5 minutes per saree for full tagging. 200 sarees = ~15 hours of work. Do it in batches.

---

## 5. Tech architecture

### 5.1 Stack recommendation

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 + Tailwind | Fast to build, great on mobile, free hosting |
| Hosting | Vercel | Zero-config Next.js, generous free tier |
| Database | Supabase (Postgres) | Auth + db + storage in one, free tier works for MVP |
| Auth | Supabase Auth | Email magic link + Google OAuth, built-in |
| Image storage | Cloudinary | Transforms, CDN, free tier 25GB |
| AI calls | Anthropic Claude API | For vibe summaries and color analysis |
| Video hosting | Mux or Cloudflare Stream | Low-bandwidth delivery for drape videos |
| Analytics | Plausible or PostHog | Privacy-friendly, better than GA |
| Email | Resend | For magic links and share notifications |
| Affiliate tracking | Cuelinks SDK + own UTM layer | Multi-retailer coverage |

### 5.2 Data model (core tables)

- **users** — id, email, created_at, undertone, contrast, color_palette, last_vibe_vector
- **sarees** — full catalog schema from 4.1
- **blouses** — id, image, style, retailer, affiliate link, price, tags
- **accessories** — same pattern as blouses
- **looks** — saree_id, blouse_id, accessory_ids, drape_video_id, manually curated or generated
- **sessions** — user inputs from stages 1–5, stored for analytics and re-use
- **saved_looks** — user_id, look_id, note, saved_at
- **shared_looks** — sharer_id, look_id, annotation, public_slug, created_at, reactions[]
- **drape_videos** — id, title, duration, url, mode (easy/classic), drape_style

### 5.3 The color analysis module

This is the one genuinely tricky technical piece. Two options:

**Option A — Client-side heuristic (recommended for V1)**

- Use a face detection library (face-api.js or MediaPipe) to locate face
- Sample skin pixels from cheek area
- Compute average LAB color space values
- Map to undertone: a* > 10 → warm, a* < 5 → cool, else neutral
- Compute contrast by sampling hair + eye region
- Photo never leaves the browser — privacy-friendly by default
- Failure mode: poor lighting. Show a retake prompt with lighting tips.

**Option B — Server-side with Claude vision**

- Upload photo, call Claude API with vision, ask for structured JSON (undertone, contrast, suggested palette)
- More flexible, handles edge cases better
- Costs ~$0.003 per analysis — fine at low volume, adds up at scale
- Photo must be deleted immediately after — explicit in the pipeline

Recommendation: start with A, fall back to B if A's accuracy is poor in user testing.

### 5.4 Share link architecture

- When user hits "share," generate a short public slug (8-char) pointing to a shared_looks row
- Public page renders without login, shows look + annotation + reply CTA
- Reply CTA opens WhatsApp with pre-filled message back to sender
- Optional: emoji reactions on the page ("❤️ love it" / "🤔 not sure" / "❌ no") stored against the shared_looks row so sender can see aggregate reactions if sent to multiple people
- OG meta tags so the WhatsApp preview is beautiful — saree image, price, "what do you think?"

---

## 6. V1 scope and what to cut

### 6.1 V1 must-haves

- Stages 0–8 end-to-end, mobile-first web
- 150–300 saree catalog, hand-tagged
- 15 drape videos covering the core use cases
- Photo upload + client-side color analysis
- Share-to-WhatsApp flow
- Save looks (requires login)
- At least 2 working affiliate integrations
- Basic analytics (funnel tracking through stages 0–8)

### 6.2 V1 explicit cuts

- "Upload a saree I already own" — this is V2, but schema should accommodate
- Native iOS/Android apps — web is fine for V1
- AR / drape-on-you preview — expensive, low confidence on ROI
- Multi-language — English only for V1, Hindi / regional in V2
- Server-side Claude vision analysis — only if client-side isn't good enough
- User profiles / social features beyond share — no following, no feed
- Reviews on sarees — curation does the quality work, reviews fragment the experience
- Mum-reaction refinement flow (section 3.11) — ship the share-out flow first, add the reaction handling once share volume justifies it

### 6.3 V1 build plan (solo, realistic)

| Week | Focus | Output |
|---|---|---|
| 1–2 | Design & prototype | Figma of all 8 stages, tone guide locked |
| 3–4 | Scaffold & stages 0–2 | Next.js app, Supabase, welcome through climate |
| 5–6 | Stages 3–5 + catalog schema | Vibe, photo, styling; admin for catalog entry |
| 7 | Catalog + tagging | First 100 sarees entered, affiliate links live |
| 8 | Recommendation engine | Scoring logic + results page |
| 9 | Zarf videos | Commission or license 15 videos, integrate |
| 10 | Share + save | Share flow, save looks, auth working |
| 11 | QA + polish | Copy audit, mobile polish, analytics |
| 12 | Soft launch | Close circle (20–30 users), iterate |
| 13+ | Iterate | Public launch when funnel metrics justify |

This is a ~3-month side-project build assuming 10–15 hours/week. Compressible to ~8 weeks if full-time.

---

## 7. Privacy, legal, and brand

### 7.1 Privacy

- Photo uploads: process client-side by default; never stored on server; stated clearly in copy
- If server-side analysis is used later, photo is deleted within 60 seconds of processing; this is logged and auditable
- Session data (user inputs) stored against anonymous session ID until user creates account
- Full privacy policy before public launch — DPDP Act compliance for India
- Cookie consent banner (minimal, not annoying)

### 7.2 Affiliate disclosure

- Clear "we may earn a small commission when you buy through our links — it doesn't change the price you pay" disclosure, visible on every results page
- ASCI compliance for affiliate content — #ad tag on shared links

### 7.3 Brand basics

- **Name:** Zarf (working name — check .com and .in availability, and trademark clearance for fashion/retail class 25 and 35 before committing)
- **Tagline:** sarees are easier than they look
- **Visual direction:** warm, tactile, photo-forward. Deep bindi red (#8E1929) as the single strong accent, cream (#F7F1E6) base, warm ink for text. Restrained — bindi earns its moment because nothing else competes. Generous whitespace.
- **Logo:** wordmark, not icon-first. "zarf" in a soft serif, lowercase.

---

## 8. Success metrics

### 8.1 North star

% of completed sessions that result in at least one affiliate click-out OR one share. This measures both confidence outcomes — "I know what to buy" and "I want a second opinion."

### 8.2 Funnel metrics

- Landing → start rate
- Stage completion rates (drop-off by stage)
- Photo upload rate (how many opt in)
- Results → look detail click rate
- Look detail → affiliate click-out rate
- Look detail → share rate
- Share → reply / reaction rate (viral coefficient)
- Save rate (requires login — measures commitment)

### 8.3 Qualitative signals

- "Did you feel more confident after this?" post-session 1-question survey
- Session replays (Hotjar / PostHog) on drop-off screens
- Weekly 3-user interview cadence for first 6 weeks post-launch

### 8.4 Targets for first 90 days post-launch

- 1,000 completed sessions
- 15% share rate on results
- 20% affiliate click-out rate on look detail
- At least 1 viral share-chain (A shares to B, B starts own session, B shares to C)

---

## 9. Open questions

Things to resolve before or during build — flagged so they don't become blockers late.

- Does the name "Zarf" clear trademark and domain checks?
- Do we source drape videos via licensing (cheaper, less control) or commission (more expensive, brand-consistent)?
- Are we comfortable with a 3-month catalog maintenance rhythm? Sarees go out of stock constantly — need a broken-link checker cron job from day 1
- Do we want to include a "consult with a stylist" upsell even in V1 as a ₹500 option? (Could be you, Sumi, on WhatsApp, curated for users who complete but don't click out — tests willingness to pay without building infrastructure)
- What's the monetization model long-term — pure affiliate, or do we layer in brand-sponsored curations, or subscription?
- India-first vs India + diaspora for V1 share flow — does the WhatsApp-first share model hold up for US/UK diaspora or do we need iMessage / SMS fallback?
- Do we need a moderation layer for user-submitted photos (V2 feature) to catch inappropriate content?

---

## 10. Appendix — material decision tree

Reference table for the recommendation engine and content team. What fabric works for what context.

| Fabric | Best for | Avoid for | Price band |
|---|---|---|---|
| Mul cotton | Hot humid day events, casual wear, monsoon | Formal evening, grand weddings | ₹1K–₹5K |
| Chanderi | Work, day weddings, festivals — breathable | Outdoor winter, torrential monsoon | ₹3K–₹15K |
| Linen | Work, casual, very hot weather | Grand occasions (too casual) | ₹2K–₹8K |
| Handloom cotton | Everyday, work, small gatherings | Black-tie, grand evening events | ₹2K–₹10K |
| Kota Doria | Day events in heat, light summer | Winter outdoor, heavy occasions | ₹2K–₹6K |
| Tussar silk | Day weddings, festivals, work-plus | Pure summer outdoor heat | ₹4K–₹20K |
| Chiffon / georgette | Cocktails, evening events, modern vibe | Traditional heavy occasions | ₹3K–₹15K |
| Organza | Evening events, modern weddings, cocktails | Hot outdoor, day wear | ₹4K–₹20K |
| Banarasi silk | Weddings (guest or bride), big festivals | Casual, hot outdoor | ₹8K–₹80K+ |
| Kanjeevaram | Weddings (bride, close family), big festivals, AC indoor | Hot outdoor, casual, regular wear | ₹15K–₹1L+ |
| Patola / ikat | Statement occasions, festivals | Casual wear | ₹10K–₹1L+ |

---

*— end of PRD —*
