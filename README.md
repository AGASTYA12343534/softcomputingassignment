# FuzzyLab — Interactive Fuzzy Logic Learning Platform

FuzzyLab is an editorial, university-grade interactive learning platform that teaches Fuzzy Logic from first principles to a working Mamdani Fuzzy Logic Controller. Every calculation—membership degrees, rule firing strengths, clipped consequents, aggregated envelopes, and defuzzified outputs—is computed live by a pure TypeScript inference engine with zero UI dependencies.

---

## Features

- **Structured 9-Module Curriculum (`/learn/module-1` … `/learn/module-9`)**: Covers foundations, Boolean vs. Fuzzy logic (including probability vs. membership), membership functions, fuzzification, rule bases, Mamdani inference, aggregation, defuzzification, and the complete Room Fan Controller.
- **Interactive Controller (`/controller`)**: Live 2-input, 9-rule Mamdani Room Fan Controller (`Temperature [0, 40] °C`, `Humidity [0, 100] %` → `Fan Speed [0, 100] %`) with scenario presets, `min`/`product` AND toggle, Centroid/Bisector/MoM comparison, and an Algorithm Trace JSON inspector.
- **7-Stage Step-by-Step Walkthrough**: State-machine simulation with Play/Pause/Next/Prev/Reset, playback speed control, keyboard shortcuts (`Space`, `←`, `→`, `R`), and 5 synchronized explanation blocks per stage.
- **Experiment Lab (`/lab`)**: Dark-panel control deck with Beginner and Advanced controls, interactive **Membership Function Playground** (mouse, touch, and arrow-key dragging with parameter validation), **Visual Rule Builder**, **What-If Simulator**, **Mistake Explorer**, **Challenge Mode**, and `localStorage`/JSON save/export/import.
- **Quiz & Final Assessment (`/quiz`, `/quiz/final`, `/quiz/challenge`)**: 32-question bank with per-option wrong-answer explanations, numeric tolerance grading, and a 20-question Final Assessment with per-module breakdown.
- **Real-World Applications (`/applications`) & Glossary (`/glossary`)**: Six engine-powered teaching models plus a searchable alphabetical glossary and print-friendly KaTeX Cheat Sheet.

---

## Tech Stack

- **Frontend**: React 18, TypeScript (strict), Vite, Tailwind CSS, React Router v6, Zustand, Framer Motion, Lucide React
- **Math & Typography**: KaTeX, `@fontsource/source-serif-4`, `@fontsource/inter`, `@fontsource/jetbrains-mono`
- **Testing & Quality**: Vitest, `@testing-library/react`, ESLint, Prettier

---

## Prerequisites & Local Setup

- Node.js `v20+` (verified on `v22.20.0`) and `npm` (`10.9.3`)

```bash
npm install
npm run dev
```

### Available Scripts

- `npm run dev` — Start Vite development server
- `npm run build` — TypeScript project build + Vite production bundle (`dist/`)
- `npm run preview` — Preview production build locally
- `npm test` — Run all Vitest unit, quiz-verification, and integration tests
- `npm run typecheck` — Run `tsc --noEmit`
- `npm run lint` — Run ESLint

---

## Project Structure

```text
src/
  engine/          Pure TypeScript Mamdani fuzzy inference library (no React imports)
  content/         9 curriculum modules, formula symbol dictionary, glossary, applications
  quiz/            32-question bank + seeded shuffle + grading logic
  state/           Zustand stores (progress, simulation/walkthrough, lab)
  components/      UI primitives, custom SVG charts, controller, walkthrough, playground
  pages/           Route-level lazy-loaded pages
tests/
  engine/          Reference implementation, membership, and controller validation tests
  quiz/            Question bank & engine-verified calculation key tests
  e2e/             React Testing Library route & controller integration smoke tests
docs/
  ENVIRONMENT.md   Environment inspection
  DECISIONS.md     Architecture & mathematical decisions
  VALIDATION.md    Hand-calculation vs. engine validation tables
```

---

## Fuzzy Engine Implementation

- **Membership Functions** (`src/engine/membership.ts`): Triangular, Trapezoidal (with explicit left/right shoulder branches so `a = b` or `c = d` never divides by zero), and Gaussian, all clamped to `[0, 1]` with `validateParams`.
- **Inference Pipeline** (`src/engine/inference.ts`): Fuzzification with branch/arithmetic trace, `min`/`product` AND, `max`/`probSum` OR, Mamdani `min`/`product` implication, and pointwise `max` aggregation.
- **Defuzzification** (`src/engine/defuzzify.ts`): Discrete Centroid, Bisector (cumulative sum with linear interpolation), and Mean of Maxima (`1e-9` plateau tolerance) on the default 101-point integer grid (`y = 0, 1, …, 100`), plus a 100,000-sample trapezoidal continuous-area Centroid reference. Zero-area inputs return `{ ok: false, reason }` rather than `NaN`.
- **Discrete vs. Continuous Centroid**: On the reference case (`24 °C`, `45 %`), the discrete 101-point centroid is `44.57%` (`1493.1667 / 33.5`) while the continuous integral centroid is `44.708%` (`1493.2 / 33.4`); both are displayed and explained in the UI.

---

## Testing & Verification

Run `npm test` to execute all unit, quiz-key verification, and React integration tests. See [docs/VALIDATION.md](docs/VALIDATION.md) for the complete hand-verifiable reference case table and boundary checks.

---

## Deployment (Vercel)

`vercel.json` is preconfigured with SPA rewrites (`/(.*) -> /index.html`) so deep links like `/learn/module-3` and `/controller` work on refresh.

```bash
vercel login
vercel --prod
```

Or import the repository at [vercel.com](https://vercel.com) with Framework Preset **Vite**, Build Command `npm run build`, and Output Directory `dist`.

---

## Known Limitations

- The six Real-World Application models in `/applications` are simplified 2-input educational models, not production industrial control designs.
- Automated Playwright/Chrome DevTools screenshots require Chrome remote debugging (`DevToolsActivePort`) to be enabled on the host machine.

---

## Credits & Licensing

- Built with React, TypeScript, Tailwind CSS, KaTeX (MIT), Framer Motion (MIT), Zustand (MIT), Lucide Icons (ISC), and Fontsource (SIL OFL 1.1).
