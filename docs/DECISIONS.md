# Engineering and Design Decisions

This document records autonomous architectural, mathematical, and UX decisions made during the development of FuzzyLab.

## 1. Package Manager & Tooling
- **Decision**: Use `npm` (`10.9.3` with Node `v22.20.0`) as the package manager.
- **Rationale**: Matches all project scripts (`npm test`, `npm run build`, `npm run preview`) and standard Vercel Vite deployment defaults.

## 2. Fonts & Styling
- **Decision**: Bundle `@fontsource-variable/source-serif-4` (or `@fontsource/source-serif-4`), `@fontsource-variable/inter` (or `@fontsource/inter`), and `@fontsource-variable/jetbrains-mono` (or `@fontsource/jetbrains-mono`) plus `katex` CSS locally.
- **Rationale**: Eliminates render-blocking external font CDNs, guarantees offline/sandbox reliability, and ensures fast Lighthouse performance.

## 3. Mathematical Engine Architecture
- **Decision**: Pure TypeScript library in `src/engine/` with zero React/DOM imports.
- **Bisector Tie/Interpolation**: When computing the bisector of area on discrete samples $y_0, y_1, \dots, y_n$ with step $\Delta y$, we compute cumulative trapezoidal/discrete area. Specifically, for discrete sums $S_k = \sum_{i=0}^{k} \mu(y_i)$ with half-total $H = S_n / 2$: if $S_k = H$ exactly, return $y_k$; otherwise find the first $k$ where $S_k \ge H$ and linearly interpolate between $y_{k-1}$ and $y_k$:
  $$y_{\text{bisector}} = y_{k-1} + \frac{H - S_{k-1}}{S_k - S_{k-1}} \cdot (y_k - y_{k-1})$$
  (if $k = 0$ or $S_k = S_{k-1}$, return $y_k$). This avoids step-quantization jumps and matches continuous area splitting closely.
- **Mean of Maxima (MoM) Tolerance**: Points $y_i$ are included in the maximal set if $|\mu_{\text{agg}}(y_i) - \max_y \mu_{\text{agg}}(y)| \le 10^{-9}$.
- **Input Clamping**: Inputs outside a variable's `[min, max]` universe are clamped to `[min, max]` before fuzzification, and the trace records both the raw input and clamped value if clamping occurred.

## 4. State & Persistence
- **Decision**: Use Zustand with versioned `localStorage` persistence (`fuzzylab_progress_v1`, `fuzzylab_experiments_v1`) wrapped in `try/catch` and schema validation so corrupted or blocked storage falls back cleanly to defaults.

## 5. Charts & Accessibility
- **Decision**: Build custom responsive SVG charts (`MembershipChart`, `ClippedOutputChart`, `AggregationChart`, `FanGauge`) with distinct stroke patterns (solid, dashed, dotted/dash-dot) and direct text labels on curves, plus visually-hidden data tables and `aria-live` summaries for screen readers.

