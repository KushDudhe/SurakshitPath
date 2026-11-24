// Server-side mirror of client/src/lib/scoring.js (same weights, same rules).
export const DEFAULT_WEIGHTS = { lighting: 25, activity: 15, transport: 15, help: 15, incidents: 20, road: 10 };
export const MIN_COVERAGE = 0.35;

/** factors: { lighting: { value: 0-100, coverage: 0-1 }, ... } */
export function scoreFactors(factors, weights = DEFAULT_WEIGHTS) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let sum = 0, used = 0, cov = 0;
  const breakdown = [], unknown = [];
  for (const [key, w] of Object.entries(weights)) {
    const f = factors[key] || { value: 0, coverage: 0 };
    cov += w * f.coverage;
    const known = f.coverage >= MIN_COVERAGE;
    if (known) { sum += w * f.value; used += w; } else unknown.push(key);
    breakdown.push({ factor: key, value: f.value, weight: w / total, known });
  }
  return {
    score: used ? Math.round(sum / used) : null,
    confidence: Math.round((cov / total) * 100),
    limitedData: used / total < 0.7 || cov / total < 0.55,
    unknown,
    breakdown,
    note: 'Estimate based on route-level conditions. Not a guarantee of safety.',
  };
}
