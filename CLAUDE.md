# Zarf — Project Instructions

## What this is

A saree discovery and confidence app. Solo side project by Sumi Uppal, based in Bangalore. The full product spec is in `PRD.md` — read it before making scope or feature decisions. When in doubt, reference it.

**One-liner:** Zarf helps you figure out what saree to buy, how to wear it, and whether it actually looks good on you — without needing an auntie on call.

**What it is NOT:** a marketplace, a checkout experience, an Instagram-style feed. It's a guided discovery tool that links out to retailers via affiliate links.

## Stack (locked for V1)

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Hosting:** Vercel
- **Database + Auth + Storage:** Supabase (Postgres)
- **Image CDN:** Cloudinary
- **Video hosting:** Mux or Cloudflare Stream (TBD — default to Mux)
- **AI calls:** Anthropic Claude API (only where needed — color analysis fallback, vibe summaries)
- **Analytics:** PostHog
- **Email:** Resend
- **Affiliate aggregation:** Cuelinks (planned)

Don't swap any of these without asking.

## Architecture principles

- **Mobile-first, always.** Design and build for mobile first, desktop is the adaptation.
- **Web only for V1.** No React Native, no native apps.
- **No login until Stage 8.** Anonymous sessions work through the whole flow; auth only gates save/share.
- **Client-side where possible.** Photo analysis runs in the browser by default (privacy + cost). Server-side is a fallback, not the default.
- **Rules-based recommendation engine for V1.** No ML. Interpretable scoring over a curated catalog. See PRD section 4.
- **Curation over catalog.** 200 well-tagged sarees beats 2000 badly tagged. Quality is the product.

## Tone and copy rules (non-negotiable)

These apply to every user-facing string — buttons, errors, empty states, everything.

- Warm, slightly funny, never precious.
- Lowercase-friendly in UI copy where it fits. Not aggressively, but when the vibe calls for it.
- No jargon without a plain-English gloss on first use. "Chanderi (a light silk-cotton blend — breathes well)" not "Chanderi."
- No gatekeeping. Kill "as you know," "obviously," "traditional wisdom."
- Permission-giving, not prescriptive. "pleats don't have to be perfect" > "ensure pleats are aligned."
- Never shame a shortcut. Pre-pleated sarees, safety pins, borrowed blouses — all legitimate.
- Avoid the reverent heritage-craft voice. No "timeless elegance," no "woven stories."
- No body-shaming language. Body-type guidance, if any, is "what tends to flatter" not "what to hide."

**Reference the copy examples in PRD section 2.3 when unsure.** If writing a new string, sanity-check against those examples.

## Working style with Claude Code

- **Propose before coding.** For any new feature or architectural decision, outline the approach and wait for a go-ahead before writing code.
- **Small, reviewable commits.** One logical change per commit, clear commit messages. Prefer conventional commits (`feat:`, `fix:`, `chore:`).
- **Ask when a PRD ambiguity shows up.** Don't invent — flag it and ask.
- **Explain trade-offs briefly.** When multiple approaches are possible, say which you're picking and why.
- **Prefer boring tech.** The stack above is chosen for stability and solo maintainability. Avoid adding new dependencies unless necessary.
- **Don't over-engineer.** This is a side project, not a 50-person startup. Ship the smallest version that works, iterate from there.

## File structure (proposed — confirm before first scaffold)

```
sareesbysumedha/            # project root (on disk)
├── app/                    # Next.js app router
│   ├── (onboarding)/       # Stages 0-5 flow
│   ├── results/            # Stage 6
│   ├── look/[id]/          # Stage 7
│   ├── share/[slug]/       # Public shared look
│   └── moodboard/          # Saved looks (auth)
├── components/
│   ├── ui/                 # Reusable primitives (buttons, inputs)
│   ├── onboarding/         # Stage-specific components
│   └── look/               # Look card, drape player, etc.
├── lib/
│   ├── supabase/           # Client + server helpers
│   ├── recommendation/     # Scoring engine
│   ├── color/              # Undertone analysis
│   └── copy/               # Shared strings (for tone audit)
├── content/
│   └── moodboard-images/   # Curated mood tiles
├── admin/                  # Catalog entry tooling (internal)
├── public/
├── PRD.md                  # Product spec (reference)
└── CLAUDE.md               # This file
```

## Build phase we're currently in

Track this. Update as we progress.

**Current phase:** Pre-scaffold. About to start PRD section 6.3 Week 1–2 (design + prototype).

**Next milestone:** Figma wireframes for all 8 stages + locked tone guide.

**Blockers / open questions:**
- Name / domain check for "Zarf"
- Zarf video sourcing decision (license vs commission)
- Monetization model beyond affiliate

## Things to never do

- Never commit secrets. Use `.env.local`, add to `.gitignore`.
- Never store user-uploaded photos on the server by default. Client-side processing only unless explicitly decided otherwise.
- Never add reviews, ratings, social feeds, or follow mechanics. We curate, we don't crowd-source.
- Never use the reverent heritage-craft voice in copy. It's alienating and it's everywhere else already.
- Never ship more than 8 recommendations on the results page. Choice paralysis kills confidence.

## When to reference the PRD directly

- Adding a new screen or flow → PRD section 3
- Implementing scoring or filtering → PRD section 4
- Making a data model decision → PRD section 5.2
- Writing user-facing copy → PRD section 2
- Scoping V1 vs V2 → PRD section 6
- Privacy or legal question → PRD section 7

## Final note

This is a confidence app, not a shopping app. Every product decision should be evaluated against: *does this reduce the intimidation of wearing a saree?* If no, deprioritize. If yes, ship it.
