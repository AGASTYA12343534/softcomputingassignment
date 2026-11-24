# FuzzyLab Mathematical & Automated Test Validation

## 1. Automated Test Results

Executed via `npm test` (`vitest run`):

```text
> fuzzylab@1.0.0 test
> vitest run

 RUN  v2.1.9 D:/projects/spotube-master/softcomputing

 ✓ tests/engine/membership.test.ts (6 tests) 13ms
 ✓ tests/quiz/quiz.test.ts (3 tests) 17ms
 ✓ tests/engine/controller.test.ts (9 tests) 1971ms
   ✓ Room Fan Controller & Inference Engine > reproduces the hand-verifiable reference case (24 °C, 45 %)
   ✓ Room Fan Controller & Inference Engine > matches the independent reference implementation across a full grid of inputs
   ✓ Room Fan Controller & Inference Engine > keeps outputs within [0, 100] on the dense grid (T step 1, H step 5)
   ✓ Room Fan Controller & Inference Engine > clamps out-of-universe inputs consistently
   ✓ Room Fan Controller & Inference Engine > verifies mirror symmetry of Low (0,0,20,50) and High (50,80,100,100) about y = 50
   ✓ Room Fan Controller & Inference Engine > verifies corner cases (0,0), (40,100), (0,100), (40,0)
   ✓ Room Fan Controller & Inference Engine > demonstrates min vs product AND operator differences
   ✓ Room Fan Controller & Inference Engine > verifies non-decreasing monotonicity with humidity fixed at 50 %
   ✓ Room Fan Controller & Inference Engine > handles zero-area edge case gracefully without NaN

 Test Files  3 passed (3)
      Tests  18 passed (18)
```

---

## 2. Hand-Verifiable Reference Case (24 °C, 45 %)

| Quantity | Hand Calculation | Engine Output | Status |
| :--- | :--- | :--- | :--- |
| `μ_Cool(24)` | `0` | `0.0000` | Pass |
| `μ_Warm(24)` | `1.0` | `1.0000` | Pass |
| `μ_Hot(24)` | `0` | `0.0000` | Pass |
| `μ_Dry(45)` | `(50 - 45)/(50 - 25) = 0.2` | `0.2000` | Pass |
| `μ_Normal(45)` | `(45 - 25)/(50 - 25) = 0.8` | `0.8000` | Pass |
| `μ_Humid(45)` | `0` | `0.0000` | Pass |
| Active Rules | `R4 (0.2)`, `R5 (0.8)` | `R4 (0.2000)`, `R5 (0.8000)` | Pass |
| Discrete Sum `Σμ(y)` (0..100) | `33.5` | `33.5000` | Pass |
| Discrete Moment `Σy·μ(y)` | `1493.1667` | `1493.1667` | Pass |
| **Discrete Centroid** | **`44.5721%` (~`44.57%`)** | **`44.5721%`** | Pass |
| Continuous Area | `33.4` | `33.4000` | Pass |
| Continuous Moment | `1493.2` | `1493.2000` | Pass |
| **Continuous Centroid** | **`44.7066%` (~`44.71%`)** | **`44.7066%`** | Pass |
| **Mean of Maxima (MoM)** | `(44 + 56) / 2 = 50.0` | `50.0000` | Pass |

---

## 3. Boundary, Corner & Property Verification

- **Left/Right Shoulders**: `Cool(0) = 1`, `Hot(40) = 1`, `Dry(0) = 1`, `Humid(100) = 1`, `Low(0) = 1`, `High(100) = 1`.
- **Partition of Unity**: Verified across all integer points `T ∈ [0, 40]` and `H ∈ [0, 100]` that `Σμ = 1.0`.
- **Corner Cases**:
  - `(0 °C, 0 %)`: Only `R1` fires (`1.0`) → Low region (`~18.34%`).
  - `(40 °C, 100 %)`: Only `R9` fires (`1.0`) → High region (`~81.66%`).
  - `(0 °C, 100 %)`: Only `R3` fires (`1.0`) → `50.00%` (Medium).
  - `(40 °C, 0 %)`: Only `R7` fires (`1.0`) → `50.00%` (Medium).
- **Mirror Symmetry**: Verified `Low(y) = High(100 - y)` for all `y ∈ [0, 100]` and `centroid(High) = 100 - centroid(Low)` within `1e-9`.
- **Monotonicity**: With `Humidity = 50 %`, fan speed is monotonically non-decreasing across `T = 0..40 °C`.
- **Zero-Area Edge Case**: Empty rule base returns `{ ok: false, reason: 'No rule fired, so there is nothing to defuzzify.' }` without `NaN` or `Infinity`.
