# Zarf V1 — Scaffold + Stages 0–1 Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. Execute task-by-task; commit at the end of each task.

**Goal:** Scaffold a Next.js 14 + Tailwind + TypeScript app for Zarf and implement the first two onboarding stages (Welcome + Occasion & Intent) with anonymous session storage.

**Architecture:** Next.js 14 App Router. Anonymous session stored in `localStorage` via Zustand `persist` middleware — no backend yet. Stage 0 is the `/` route; Stage 1 is `/occasion` inside a `(onboarding)` route group that shares a layout for subsequent stages. UI is mobile-first and tone-audited against PRD §2.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS v3 · Zustand · Vitest · React Testing Library · jsdom · `next/font` (Fraunces + Inter).

**Scope of this plan:**
- Scaffold, global styles, theme tokens, fonts
- Session store (typed, persisted, SSR-safe)
- UI primitives: `Button`, `TileSelect`, `BudgetSlider`
- Stage 0: Welcome
- Stage 1: Occasion & Intent (occasion + conditional wedding role + reuse intent + budget)

**Explicitly out of scope (future slices):**
- Supabase wiring, auth
- Stages 2–8
- Real hero photography (placeholder gradient for V0)
- Recommendation engine, catalog, drape videos, share/save
- Playwright / E2E tests

---

## File structure after this plan

```
sareesbysumedha/
├── app/
│   ├── (onboarding)/
│   │   ├── layout.tsx             # Shared chrome for Stage 1+
│   │   └── occasion/
│   │       └── page.tsx           # Stage 1 route
│   ├── globals.css                # Tailwind + theme tokens
│   ├── layout.tsx                 # Root layout + fonts
│   └── page.tsx                   # Stage 0 (Welcome)
├── components/
│   ├── onboarding/
│   │   ├── occasion-form.tsx      # Stage 1 form
│   │   └── welcome.tsx            # Stage 0 screen
│   └── ui/
│       ├── budget-slider.tsx
│       ├── button.tsx
│       └── tile-select.tsx
├── lib/
│   ├── copy/
│   │   └── onboarding.ts          # User-facing strings for stages 0–1
│   └── session/
│       ├── budget.ts              # Band mapping utilities
│       ├── store.ts               # Zustand store w/ persist
│       └── types.ts               # Shared session types
├── tests/
│   ├── components/
│   │   ├── onboarding/
│   │   │   ├── occasion-form.test.tsx
│   │   │   └── welcome.test.tsx
│   │   └── ui/
│   │       ├── budget-slider.test.tsx
│   │       ├── button.test.tsx
│   │       └── tile-select.test.tsx
│   └── lib/
│       └── session/
│           ├── budget.test.ts
│           └── store.test.ts
├── public/
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── vitest.setup.ts
```

---

## Task 1: Scaffold Next.js 14 + TypeScript + Tailwind

**Files:**
- Create: all standard Next.js scaffold files (via `create-next-app`)
- Modify: `package.json` to pin `next@14`

- [ ] **Step 1: Initialize git**

Run from `/Users/sumedhauppal/sareesbysumedha`:

```bash
git init
git add PRD.md CLAUDE.md
git commit -m "chore: initial commit — PRD and project instructions"
```

- [ ] **Step 2: Scaffold Next.js into the current directory**

```bash
npx create-next-app@14 . \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir=false \
  --import-alias "@/*" \
  --use-npm \
  --no-turbo
```

When prompted to proceed in a non-empty directory, answer yes. `create-next-app` will preserve existing files.

- [ ] **Step 3: Verify scaffold**

```bash
ls package.json next.config.mjs tailwind.config.ts tsconfig.json app/page.tsx
```

Expected: all files exist. If `next.config.ts` exists instead of `.mjs`, that's fine — note the actual filename for later edits.

- [ ] **Step 4: Pin Next.js 14**

Open `package.json` and verify `"next"` is `"^14.x"`. If it scaffolded to 15, run:

```bash
npm install next@14 --save-exact
```

- [ ] **Step 5: Run the dev server to confirm it boots**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3000` with no errors. Kill it (Ctrl+C) after confirming.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold next.js 14 + tailwind + typescript"
```

---

## Task 2: Install testing stack

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (scripts), `tsconfig.json` (types)

- [ ] **Step 1: Install test deps**

```bash
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add test script and types**

Edit `package.json` `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Edit `tsconfig.json` `compilerOptions.types` (add, or create if missing):

```json
"types": ["vitest/globals", "@testing-library/jest-dom"]
```

- [ ] **Step 5: Verify install with a throwaway sanity test**

Create `tests/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('true is true', () => {
    expect(true).toBe(true);
  });
});
```

Run: `npm test`
Expected: 1 passed.

Delete the file:

```bash
rm tests/sanity.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add vitest + testing-library"
```

---

## Task 3: Configure Tailwind theme + fonts + global styles

**Files:**
- Modify: `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Replace `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F7F1E6',
        terracotta: '#C87456',
        mustard: '#D9A441',
        olive: '#7A7A3D',
        ink: '#2C2520',
        muted: '#6B6259',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '38rem',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

html, body {
  background-color: #F7F1E6; /* cream */
  color: #2C2520;            /* ink */
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: var(--font-sans);
}

.font-serif {
  letter-spacing: -0.01em;
}
```

- [ ] **Step 3: Wire fonts in `app/layout.tsx`**

Replace the file with:

```tsx
import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'drape — sarees are easier than they look',
  description:
    'figure out what saree to buy, how to wear it, and whether it actually looks good on you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Smoke-test the theme**

Run `npm run dev` and load `http://localhost:3000`. The default Next.js page should render with the cream background. Kill the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire tailwind theme tokens, fraunces + inter fonts, cream background"
```

---

## Task 4: Session types + budget band utility (TDD)

**Files:**
- Create: `lib/session/types.ts`, `lib/session/budget.ts`
- Test: `tests/lib/session/budget.test.ts`

- [ ] **Step 1: Write the failing budget band test**

Create `tests/lib/session/budget.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getBudgetBand, BUDGET_MIN, BUDGET_MAX } from '@/lib/session/budget';

describe('getBudgetBand', () => {
  it('returns "everyday" at the floor', () => {
    expect(getBudgetBand(BUDGET_MIN)).toBe('everyday');
  });

  it('returns "everyday" at the upper edge of everyday', () => {
    expect(getBudgetBand(5000)).toBe('everyday');
  });

  it('returns "mid" just above everyday', () => {
    expect(getBudgetBand(5001)).toBe('mid');
  });

  it('returns "mid" at the upper edge of mid', () => {
    expect(getBudgetBand(15000)).toBe('mid');
  });

  it('returns "premium" at the upper edge of premium', () => {
    expect(getBudgetBand(50000)).toBe('premium');
  });

  it('returns "heirloom" above premium', () => {
    expect(getBudgetBand(50001)).toBe('heirloom');
  });

  it('returns "heirloom" at the ceiling', () => {
    expect(getBudgetBand(BUDGET_MAX)).toBe('heirloom');
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/session/types.ts`**

```ts
export type Occasion =
  | 'wedding-others'
  | 'wedding-mine'
  | 'festival'
  | 'work'
  | 'casual'
  | 'party'
  | 'browsing';

export type WeddingRole = 'bride' | 'bridesmaid' | 'family' | 'guest';

export type ReuseIntent = 'once' | 'few-times' | 'often';

export type BudgetBand = 'everyday' | 'mid' | 'premium' | 'heirloom';

export interface SessionState {
  occasion?: Occasion;
  weddingRole?: WeddingRole;
  reuseIntent?: ReuseIntent;
  budget?: number;
}
```

- [ ] **Step 4: Create `lib/session/budget.ts`**

```ts
import type { BudgetBand } from './types';

export const BUDGET_MIN = 1000;
export const BUDGET_MAX = 200000;

export function getBudgetBand(value: number): BudgetBand {
  if (value <= 5000) return 'everyday';
  if (value <= 15000) return 'mid';
  if (value <= 50000) return 'premium';
  return 'heirloom';
}

export function formatRupees(value: number): string {
  if (value >= 100000) {
    const lakhs = value / 100000;
    const rounded = Number.isInteger(lakhs) ? lakhs.toFixed(0) : lakhs.toFixed(1);
    return `₹${rounded}L`;
  }
  if (value >= 1000) {
    return `₹${Math.round(value / 1000)}K`;
  }
  return `₹${value}`;
}
```

- [ ] **Step 5: Run tests, confirm pass**

```bash
npm test
```

Expected: 7 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(session): session types + budget band mapping"
```

---

## Task 5: Zustand session store (TDD)

**Files:**
- Create: `lib/session/store.ts`
- Test: `tests/lib/session/store.test.ts`
- Modify: `package.json` (add zustand)

- [ ] **Step 1: Install Zustand**

```bash
npm install zustand
```

- [ ] **Step 2: Write the failing store test**

Create `tests/lib/session/store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSession } from '@/lib/session/store';

beforeEach(() => {
  // Reset both persisted state and in-memory store
  window.localStorage.clear();
  useSession.setState({
    occasion: undefined,
    weddingRole: undefined,
    reuseIntent: undefined,
    budget: undefined,
  });
});

describe('useSession', () => {
  it('starts empty', () => {
    const s = useSession.getState();
    expect(s.occasion).toBeUndefined();
    expect(s.weddingRole).toBeUndefined();
    expect(s.reuseIntent).toBeUndefined();
    expect(s.budget).toBeUndefined();
  });

  it('setOccasion stores the value', () => {
    useSession.getState().setOccasion('wedding-others');
    expect(useSession.getState().occasion).toBe('wedding-others');
  });

  it('setOccasion clears weddingRole when switching to a non-wedding occasion', () => {
    const s = useSession.getState();
    s.setOccasion('wedding-others');
    s.setWeddingRole('guest');
    s.setOccasion('casual');
    expect(useSession.getState().weddingRole).toBeUndefined();
  });

  it('setOccasion keeps weddingRole when staying within a wedding occasion', () => {
    const s = useSession.getState();
    s.setOccasion('wedding-others');
    s.setWeddingRole('guest');
    s.setOccasion('wedding-mine');
    expect(useSession.getState().weddingRole).toBe('guest');
  });

  it('setBudget stores the value', () => {
    useSession.getState().setBudget(8000);
    expect(useSession.getState().budget).toBe(8000);
  });

  it('reset clears everything', () => {
    const s = useSession.getState();
    s.setOccasion('festival');
    s.setReuseIntent('often');
    s.setBudget(4000);
    s.reset();
    const after = useSession.getState();
    expect(after.occasion).toBeUndefined();
    expect(after.reuseIntent).toBeUndefined();
    expect(after.budget).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run test, confirm it fails**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 4: Create `lib/session/store.ts`**

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Occasion,
  ReuseIntent,
  SessionState,
  WeddingRole,
} from './types';

interface SessionActions {
  setOccasion: (occasion: Occasion) => void;
  setWeddingRole: (role: WeddingRole) => void;
  setReuseIntent: (intent: ReuseIntent) => void;
  setBudget: (budget: number) => void;
  reset: () => void;
}

const EMPTY: SessionState = {
  occasion: undefined,
  weddingRole: undefined,
  reuseIntent: undefined,
  budget: undefined,
};

function isWedding(o: Occasion | undefined): boolean {
  return o === 'wedding-others' || o === 'wedding-mine';
}

export const useSession = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...EMPTY,
      setOccasion: (occasion) =>
        set((prev) => ({
          occasion,
          weddingRole:
            isWedding(prev.occasion) && isWedding(occasion)
              ? prev.weddingRole
              : undefined,
        })),
      setWeddingRole: (weddingRole) => set({ weddingRole }),
      setReuseIntent: (reuseIntent) => set({ reuseIntent }),
      setBudget: (budget) => set({ budget }),
      reset: () => set({ ...EMPTY }),
    }),
    {
      name: 'drape-session-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        occasion: s.occasion,
        weddingRole: s.weddingRole,
        reuseIntent: s.reuseIntent,
        budget: s.budget,
      }),
    },
  ),
);
```

- [ ] **Step 5: Run tests, confirm pass**

```bash
npm test
```

Expected: all tests passing (session tests + budget tests = 13 passing).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(session): zustand store with localstorage persist"
```

---

## Task 6: Copy module for stages 0–1

**Files:**
- Create: `lib/copy/onboarding.ts`

All user-facing strings for stages 0–1 live here. Centralized so the tone audit and future i18n both have one target.

- [ ] **Step 1: Create `lib/copy/onboarding.ts`**

```ts
import type { Occasion, ReuseIntent, WeddingRole } from '@/lib/session/types';

export const welcomeCopy = {
  headline: 'sarees are easier than they look.',
  subhead:
    'figure out what to buy, how to wear it, and whether mum will approve. takes 5 minutes.',
  primaryCta: "let's start",
  secondaryCta: 'i already own a saree, help me style it',
  secondaryHint: 'coming soon',
};

export const occasionCopy = {
  heading: "what's this for?",
  subhead: "pick the closest one — we'll refine in a sec.",
  options: [
    { value: 'wedding-others', label: "wedding — someone else's" },
    { value: 'wedding-mine', label: 'wedding — my own' },
    { value: 'festival', label: 'festival / pooja' },
    { value: 'work', label: 'work or professional' },
    { value: 'casual', label: 'casual / everyday' },
    { value: 'party', label: 'party / cocktail / reception' },
    { value: 'browsing', label: 'not sure yet — just browsing' },
  ] as const satisfies ReadonlyArray<{ value: Occasion; label: string }>,
};

export const weddingRoleCopy = {
  heading: "what's your role?",
  options: [
    { value: 'bride', label: 'bride' },
    { value: 'bridesmaid', label: 'bridesmaid / close friend' },
    { value: 'family', label: 'family of bride or groom' },
    { value: 'guest', label: 'guest' },
  ] as const satisfies ReadonlyArray<{ value: WeddingRole; label: string }>,
};

export const reuseCopy = {
  heading: 'how many times will you wear this?',
  options: [
    { value: 'once', label: "just this once — it's a statement" },
    { value: 'few-times', label: 'a few times a year' },
    { value: 'often', label: 'i want to actually wear it often' },
  ] as const satisfies ReadonlyArray<{ value: ReuseIntent; label: string }>,
};

export const budgetCopy = {
  heading: "what's your budget?",
  hint: 'no judgment, seriously.',
  bandLabels: {
    everyday: 'everyday',
    mid: 'mid',
    premium: 'premium',
    heirloom: 'heirloom',
  } as const,
};

export const navCopy = {
  back: 'back',
  next: 'next',
  continue: 'continue',
};
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(copy): centralized strings for stages 0–1"
```

---

## Task 7: UI primitive — Button (TDD)

**Files:**
- Create: `components/ui/button.tsx`
- Test: `tests/components/ui/button.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/components/ui/button.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>click me</Button>);
    expect(screen.getByRole('button', { name: 'click me' })).toBeInTheDocument();
  });

  it('fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>go</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'go' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('respects disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        nope
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'nope' });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `components/ui/button.tsx`**

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/60 disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-terracotta text-cream hover:bg-terracotta/90',
  secondary: 'bg-transparent text-ink border border-ink/20 hover:bg-ink/5',
  ghost: 'bg-transparent text-muted hover:text-ink',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth = false, className = '', ...rest }, ref) => {
    const width = fullWidth ? 'w-full' : '';
    return (
      <button
        ref={ref}
        className={[base, variants[variant], width, className]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
    );
  },
);
Button.displayName = 'Button';
```

- [ ] **Step 4: Run tests, confirm pass**

```bash
npm test
```

Expected: 3 button tests pass, everything else still green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): button primitive with primary/secondary/ghost variants"
```

---

## Task 8: UI primitive — TileSelect (TDD)

**Files:**
- Create: `components/ui/tile-select.tsx`
- Test: `tests/components/ui/tile-select.test.tsx`

`TileSelect` is a single-select visual tile picker used for occasion, wedding role, and reuse intent.

- [ ] **Step 1: Write the failing test**

Create `tests/components/ui/tile-select.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TileSelect } from '@/components/ui/tile-select';

const options = [
  { value: 'a', label: 'apple' },
  { value: 'b', label: 'banana' },
  { value: 'c', label: 'cherry' },
];

describe('TileSelect', () => {
  it('renders every option', () => {
    render(<TileSelect options={options} value={null} onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'apple' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'banana' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'cherry' })).toBeInTheDocument();
  });

  it('marks the current value as checked', () => {
    render(<TileSelect options={options} value="b" onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'banana' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'apple' })).not.toBeChecked();
  });

  it('fires onChange with the clicked value', async () => {
    const onChange = vi.fn();
    render(<TileSelect options={options} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'cherry' }));
    expect(onChange).toHaveBeenCalledWith('c');
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `components/ui/tile-select.tsx`**

```tsx
'use client';

import { useId } from 'react';

export interface TileOption<V extends string> {
  value: V;
  label: string;
  hint?: string;
}

interface TileSelectProps<V extends string> {
  options: ReadonlyArray<TileOption<V>>;
  value: V | null | undefined;
  onChange: (value: V) => void;
  name?: string;
  columns?: 1 | 2;
}

export function TileSelect<V extends string>({
  options,
  value,
  onChange,
  name,
  columns = 1,
}: TileSelectProps<V>) {
  const groupId = useId();
  const groupName = name ?? `tile-${groupId}`;
  const colClass = columns === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div role="radiogroup" className={`grid ${colClass} gap-3`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={[
              'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 transition',
              selected
                ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta'
                : 'border-ink/15 hover:border-ink/30',
            ].join(' ')}
          >
            <input
              type="radio"
              role="radio"
              className="sr-only"
              name={groupName}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
            />
            <span className="flex-1">
              <span className="block text-base text-ink">{opt.label}</span>
              {opt.hint && (
                <span className="mt-0.5 block text-sm text-muted">{opt.hint}</span>
              )}
            </span>
            <span
              aria-hidden
              className={[
                'h-4 w-4 shrink-0 rounded-full border',
                selected ? 'border-terracotta bg-terracotta' : 'border-ink/30',
              ].join(' ')}
            />
          </label>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run tests, confirm pass**

```bash
npm test
```

Expected: 3 new tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): tile-select single-select primitive"
```

---

## Task 9: UI primitive — BudgetSlider (TDD)

**Files:**
- Create: `components/ui/budget-slider.tsx`
- Test: `tests/components/ui/budget-slider.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/components/ui/budget-slider.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { BudgetSlider } from '@/components/ui/budget-slider';

describe('BudgetSlider', () => {
  it('shows the formatted current value', () => {
    render(<BudgetSlider value={8000} onChange={() => {}} />);
    expect(screen.getByText('₹8K')).toBeInTheDocument();
  });

  it('shows the matching band label', () => {
    render(<BudgetSlider value={8000} onChange={() => {}} />);
    expect(screen.getByText(/mid/i)).toBeInTheDocument();
  });

  it('shows the no-judgment hint', () => {
    render(<BudgetSlider value={5000} onChange={() => {}} />);
    expect(screen.getByText(/no judgment/i)).toBeInTheDocument();
  });

  it('fires onChange when the slider moves', () => {
    const onChange = vi.fn();
    render(<BudgetSlider value={5000} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '20000' } });
    expect(onChange).toHaveBeenCalledWith(20000);
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `components/ui/budget-slider.tsx`**

```tsx
'use client';

import {
  BUDGET_MAX,
  BUDGET_MIN,
  formatRupees,
  getBudgetBand,
} from '@/lib/session/budget';
import { budgetCopy } from '@/lib/copy/onboarding';

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

export function BudgetSlider({
  value,
  onChange,
  step = 500,
}: BudgetSliderProps) {
  const band = getBudgetBand(value);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="font-serif text-3xl text-ink">{formatRupees(value)}</span>
        <span className="text-sm uppercase tracking-wide text-muted">
          {budgetCopy.bandLabels[band]}
        </span>
      </div>
      <input
        type="range"
        min={BUDGET_MIN}
        max={BUDGET_MAX}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink/10 accent-terracotta"
        aria-label="budget"
      />
      <div className="flex justify-between text-xs text-muted">
        <span>{formatRupees(BUDGET_MIN)}</span>
        <span>{formatRupees(BUDGET_MAX)}+</span>
      </div>
      <p className="text-sm text-muted">{budgetCopy.hint}</p>
    </div>
  );
}
```

- [ ] **Step 4: Run tests, confirm pass**

```bash
npm test
```

Expected: 4 new tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): budget slider with band label and no-judgment hint"
```

---

## Task 10: Stage 0 — Welcome screen + route

**Files:**
- Create: `components/onboarding/welcome.tsx`
- Modify: `app/page.tsx`
- Test: `tests/components/onboarding/welcome.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/components/onboarding/welcome.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Welcome } from '@/components/onboarding/welcome';

describe('Welcome', () => {
  it('renders the PRD headline exactly', () => {
    render(<Welcome />);
    expect(
      screen.getByRole('heading', { name: 'sarees are easier than they look.' }),
    ).toBeInTheDocument();
  });

  it('renders the subhead', () => {
    render(<Welcome />);
    expect(
      screen.getByText(
        'figure out what to buy, how to wear it, and whether mum will approve. takes 5 minutes.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the primary CTA linking to /occasion', () => {
    render(<Welcome />);
    const cta = screen.getByRole('link', { name: "let's start" });
    expect(cta).toHaveAttribute('href', '/occasion');
  });

  it('renders the secondary CTA marked as coming soon', () => {
    render(<Welcome />);
    expect(
      screen.getByText('i already own a saree, help me style it'),
    ).toBeInTheDocument();
    expect(screen.getByText('coming soon')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `components/onboarding/welcome.tsx`**

```tsx
import Link from 'next/link';
import { welcomeCopy } from '@/lib/copy/onboarding';

export function Welcome() {
  return (
    <main className="relative min-h-screen">
      {/* V0 hero: warm gradient placeholder. Replace with saree photography when ready. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-terracotta/25 via-mustard/10 to-cream"
        aria-hidden
      />
      <div className="mx-auto flex min-h-screen max-w-prose flex-col justify-between px-6 py-12">
        <div />
        <div className="flex flex-col gap-6">
          <h1 className="font-serif text-5xl leading-tight text-ink sm:text-6xl">
            {welcomeCopy.headline}
          </h1>
          <p className="text-lg text-muted">{welcomeCopy.subhead}</p>
        </div>
        <div className="flex flex-col gap-4">
          <Link
            href="/occasion"
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-4 text-lg font-medium text-cream transition hover:bg-terracotta/90"
          >
            {welcomeCopy.primaryCta}
          </Link>
          <div className="flex items-center justify-center gap-2 text-sm text-muted">
            <span>{welcomeCopy.secondaryCta}</span>
            <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs uppercase tracking-wide">
              {welcomeCopy.secondaryHint}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Replace `app/page.tsx`**

```tsx
import { Welcome } from '@/components/onboarding/welcome';

export default function HomePage() {
  return <Welcome />;
}
```

- [ ] **Step 5: Run tests, confirm pass**

```bash
npm test
```

Expected: 4 new tests pass.

- [ ] **Step 6: Eyeball in browser**

```bash
npm run dev
```

Visit `http://localhost:3000`. Resize to mobile width (375px). Confirm:
- Cream background, warm gradient from top
- Serif headline renders in Fraunces
- Primary CTA is terracotta and full-width feeling
- Secondary line shows "coming soon" tag
Kill the server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(stage-0): welcome screen with exact PRD copy"
```

---

## Task 11: Onboarding layout shell

**Files:**
- Create: `app/(onboarding)/layout.tsx`

This layout wraps Stage 1+ with shared page chrome: a back link to `/` and a content column width constraint. Stages 2+ will add a progress indicator.

- [ ] **Step 1: Create `app/(onboarding)/layout.tsx`**

```tsx
import Link from 'next/link';
import { navCopy } from '@/lib/copy/onboarding';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="px-6 pt-6">
        <Link
          href="/"
          className="text-sm text-muted transition hover:text-ink"
          aria-label="back to start"
        >
          ← {navCopy.back}
        </Link>
      </header>
      <main className="mx-auto max-w-prose px-6 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(onboarding): shared layout with back link"
```

---

## Task 12: Stage 1 — Occasion & Intent form (TDD)

**Files:**
- Create: `components/onboarding/occasion-form.tsx`
- Test: `tests/components/onboarding/occasion-form.test.tsx`

The `OccasionForm` is a client component that:
1. Asks the occasion question (7 tiles).
2. Reveals the wedding-role question only when the occasion is a wedding.
3. Asks reuse intent (3 tiles).
4. Shows the budget slider.
5. Has a single "continue" button that is disabled until required fields are set (occasion, reuseIntent, budget; weddingRole if applicable).

- [ ] **Step 1: Write the failing test**

Create `tests/components/onboarding/occasion-form.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OccasionForm } from '@/components/onboarding/occasion-form';
import { useSession } from '@/lib/session/store';

beforeEach(() => {
  window.localStorage.clear();
  useSession.getState().reset();
});

describe('OccasionForm', () => {
  it('renders the occasion question headline', () => {
    render(<OccasionForm onContinue={() => {}} />);
    expect(
      screen.getByRole('heading', { name: "what's this for?" }),
    ).toBeInTheDocument();
  });

  it('does not show the wedding-role question by default', () => {
    render(<OccasionForm onContinue={() => {}} />);
    expect(
      screen.queryByRole('heading', { name: "what's your role?" }),
    ).not.toBeInTheDocument();
  });

  it('reveals the wedding-role question when a wedding occasion is chosen', async () => {
    render(<OccasionForm onContinue={() => {}} />);
    await userEvent.click(
      screen.getByRole('radio', { name: "wedding — someone else's" }),
    );
    expect(
      screen.getByRole('heading', { name: "what's your role?" }),
    ).toBeInTheDocument();
  });

  it('hides the wedding-role question when switching to a non-wedding occasion', async () => {
    render(<OccasionForm onContinue={() => {}} />);
    await userEvent.click(
      screen.getByRole('radio', { name: "wedding — someone else's" }),
    );
    await userEvent.click(screen.getByRole('radio', { name: 'casual / everyday' }));
    expect(
      screen.queryByRole('heading', { name: "what's your role?" }),
    ).not.toBeInTheDocument();
  });

  it('keeps continue disabled until all required fields are set', async () => {
    render(<OccasionForm onContinue={() => {}} />);
    const btn = screen.getByRole('button', { name: /continue/i });
    expect(btn).toBeDisabled();

    await userEvent.click(screen.getByRole('radio', { name: 'festival / pooja' }));
    expect(btn).toBeDisabled();

    await userEvent.click(
      screen.getByRole('radio', { name: 'a few times a year' }),
    );
    // budget defaults to a value already; button should now be enabled
    expect(btn).toBeEnabled();
  });

  it('requires a wedding role before enabling continue for wedding occasions', async () => {
    render(<OccasionForm onContinue={() => {}} />);
    const btn = screen.getByRole('button', { name: /continue/i });

    await userEvent.click(screen.getByRole('radio', { name: 'wedding — my own' }));
    await userEvent.click(
      screen.getByRole('radio', { name: 'a few times a year' }),
    );
    expect(btn).toBeDisabled();

    await userEvent.click(screen.getByRole('radio', { name: 'bride' }));
    expect(btn).toBeEnabled();
  });

  it('calls onContinue with the filled session payload', async () => {
    const onContinue = vi.fn();
    render(<OccasionForm onContinue={onContinue} />);
    await userEvent.click(screen.getByRole('radio', { name: 'festival / pooja' }));
    await userEvent.click(
      screen.getByRole('radio', { name: 'a few times a year' }),
    );
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onContinue).toHaveBeenCalledOnce();
    const state = useSession.getState();
    expect(state.occasion).toBe('festival');
    expect(state.reuseIntent).toBe('few-times');
    expect(state.budget).toBeTypeOf('number');
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `components/onboarding/occasion-form.tsx`**

```tsx
'use client';

import { useEffect } from 'react';
import { TileSelect } from '@/components/ui/tile-select';
import { Button } from '@/components/ui/button';
import { BudgetSlider } from '@/components/ui/budget-slider';
import {
  occasionCopy,
  reuseCopy,
  weddingRoleCopy,
  budgetCopy,
} from '@/lib/copy/onboarding';
import { useSession } from '@/lib/session/store';
import type { Occasion } from '@/lib/session/types';

const DEFAULT_BUDGET = 8000;

function isWedding(o: Occasion | undefined): boolean {
  return o === 'wedding-others' || o === 'wedding-mine';
}

interface OccasionFormProps {
  onContinue: () => void;
}

export function OccasionForm({ onContinue }: OccasionFormProps) {
  const {
    occasion,
    weddingRole,
    reuseIntent,
    budget,
    setOccasion,
    setWeddingRole,
    setReuseIntent,
    setBudget,
  } = useSession();

  // Hydrate a default budget once on mount so the slider has a starting point.
  useEffect(() => {
    if (budget === undefined) {
      setBudget(DEFAULT_BUDGET);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weddingSelected = isWedding(occasion);
  const ready =
    !!occasion &&
    !!reuseIntent &&
    budget !== undefined &&
    (!weddingSelected || !!weddingRole);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="font-serif text-3xl text-ink">{occasionCopy.heading}</h1>
        <p className="text-sm text-muted">{occasionCopy.subhead}</p>
        <TileSelect
          options={occasionCopy.options}
          value={occasion ?? null}
          onChange={setOccasion}
        />
      </section>

      {weddingSelected && (
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-2xl text-ink">
            {weddingRoleCopy.heading}
          </h2>
          <TileSelect
            options={weddingRoleCopy.options}
            value={weddingRole ?? null}
            onChange={setWeddingRole}
          />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">{reuseCopy.heading}</h2>
        <TileSelect
          options={reuseCopy.options}
          value={reuseIntent ?? null}
          onChange={setReuseIntent}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">{budgetCopy.heading}</h2>
        <BudgetSlider value={budget ?? DEFAULT_BUDGET} onChange={setBudget} />
      </section>

      <div className="pb-16">
        <Button
          variant="primary"
          fullWidth
          disabled={!ready}
          onClick={() => {
            if (ready) onContinue();
          }}
        >
          continue
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests, confirm pass**

```bash
npm test
```

Expected: all Stage 1 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(stage-1): occasion form with conditional wedding role + budget"
```

---

## Task 13: Stage 1 route + smoke test the full flow

**Files:**
- Create: `app/(onboarding)/occasion/page.tsx`

- [ ] **Step 1: Create `app/(onboarding)/occasion/page.tsx`**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { OccasionForm } from '@/components/onboarding/occasion-form';

export default function OccasionPage() {
  const router = useRouter();
  return (
    <OccasionForm
      onContinue={() => {
        // Stage 2 doesn't exist yet. Go back to Welcome for now; the next
        // slice will route to /climate.
        router.push('/');
      }}
    />
  );
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: all tests pass (budget + store + button + tile-select + budget-slider + welcome + occasion-form).

- [ ] **Step 3: Type-check and lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: both clean. Fix anything they flag before proceeding.

- [ ] **Step 4: Manual smoke test in the browser**

```bash
npm run dev
```

Walk through on mobile viewport (375px):
1. Load `http://localhost:3000` — Welcome renders with correct copy, primary CTA is tappable.
2. Tap "let's start" → lands on `/occasion` under the onboarding layout (back link visible top-left).
3. Pick a non-wedding occasion (e.g. "festival / pooja") — wedding-role section should NOT appear.
4. Switch to "wedding — my own" — wedding-role section appears; pick "bride".
5. Pick "a few times a year" for reuse intent.
6. Drag the budget slider — value updates, band label updates (everyday/mid/premium/heirloom), "no judgment" hint visible.
7. Continue button enables only when all required fields are set.
8. Reload the page — session survives in localStorage (selections still highlighted, slider value preserved).
9. Tap "back" → goes home.

If anything is off (copy, mobile layout, overflow), fix before committing.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(stage-1): wire /occasion route to onboarding flow"
```

- [ ] **Step 6: Update CLAUDE.md phase marker**

Edit `CLAUDE.md` under "Build phase we're currently in" to reflect new state:

```
**Current phase:** Stages 0–1 shipped (scaffold + welcome + occasion & intent). Next slice is Stage 2 (climate & context).

**Next milestone:** Stage 2 climate detection + Stage 3 vibe capture.
```

Commit:

```bash
git add CLAUDE.md
git commit -m "chore: update phase marker after stages 0–1"
```

---

## Done check

After Task 13, verify:
- `npm test` — all green
- `npx tsc --noEmit` — no errors
- `npm run lint` — no errors
- `npm run build` — production build succeeds
- `git log --oneline` — clean commit history, one logical commit per task

If all five check out, this slice is shippable locally. Supabase, Stage 2, and real hero photography are the natural next moves.
