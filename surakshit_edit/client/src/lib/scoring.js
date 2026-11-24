// Explainable, weighted safety scoring. Every number shown in the UI comes from these functions.
export const FACTORS = [
  { key: 'lighting', label: 'Lighting' },
  { key: 'activity', label: 'Public Activity' },
  { key: 'transport', label: 'Transport' },
  { key: 'help', label: 'Help Points' },
  { key: 'incidents', label: 'Recent Incidents' },
  { key: 'road', label: 'Road Condition' },
];
export const FACTOR_KEYS = FACTORS.map((f) => f.key);
export const DEFAULT_WEIGHTS = { lighting: 25, activity: 15, transport: 15, help: 15, incidents: 20, road: 10 };
// A factor whose data coverage is below this is treated as UNKNOWN (excluded), never as "unsafe".
export const MIN_COVERAGE = 0.35;

export const hourOf = (t) => { const h = parseInt(String(t || '21:30').split(':')[0], 10); return Number.isNaN(h) ? 21 : h; };
export const isLateNight = (t) => { const h = hourOf(t); return h >= 23 || h < 5; };

/** Normalised weights (sum = 1) after user preferences and time-of-night calibration. */
export function effectiveWeights(base = DEFAULT_WEIGHTS, { prefs = {}, departure = '21:30' } = {}) {
  const w = { ...base };
  Object.keys(prefs).forEach((k) => { if (prefs[k] && w[k] != null) w[k] *= 1.3; });
  if (isLateNight(departure)) { w.lighting *= 1.15; w.activity *= 1.2; w.transport *= 0.8; }
  const sum = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  const out = {};
  Object.keys(w).forEach((k) => { out[k] = w[k] / sum; });
  return out;
}

/** route.f = factor values (0-100, higher = safer), route.c = data coverage (0-1). */
export function scoreRoute(route, weights) {
  let sum = 0, used = 0, cov = 0;
  const rows = [], unknown = [];
  FACTORS.forEach(({ key, label }) => {
    const w = weights[key], v = route.f[key], c = route.c[key];
    cov += w * c;
    const known = c >= MIN_COVERAGE;
    if (known) { sum += w * v; used += w; } else unknown.push(label);
    rows.push({ key, label, value: Math.round(v), weight: w, coverage: c, known });
  });
  const raw = used > 0 ? sum / used : null;
  const confidence = Math.round(cov * 100);
  rows.forEach((r) => { r.points = r.known && used ? (r.weight * r.value) / used : 0; });
  return { score: raw == null ? null : Math.round(raw), raw, confidence, limited: used < 0.7 || confidence < 55, unknown, rows };
}

/** Events (simulated live updates) adjust factor values and travel time for one route. */
export function applyEvents(route, events = []) {
  const f = { ...route.f };
  let time = route.time;
  events.filter((e) => e.routeId === route.id).forEach((e) => {
    Object.entries(e.delta).forEach(([k, d]) => { f[k] = Math.max(0, Math.min(100, f[k] + d)); });
    time += e.time || 0;
  });
  return { ...route, f, time };
}

/** User-controlled trade-off: pref = 0..100 (share given to safety; the rest goes to travel time). */
export function rankScore(route, pref, minTime) {
  const timeScore = Math.max(0, Math.min(100, 100 - Math.max(0, route.time - minTime) * 6));
  const safety = route.score == null ? 50 : route.score;
  return (pref / 100) * safety + (1 - pref / 100) * timeScore;
}

export const riskLabel = (s) => (s == null ? 'Limited data' : s >= 80 ? 'Low' : s >= 65 ? 'Moderate' : 'Elevated');
export const scoreTone = (v) => (v >= 60 ? '#00C3C9' : v >= 40 ? '#FBBF24' : '#F87171');
