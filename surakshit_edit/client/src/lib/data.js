import { FACTOR_KEYS } from './scoring.js';

// ---- Demo places (approximate coordinates, Pune / Pimpri-Chinchwad). q = how much open data we "have" there.
export const PLACES = [
  { name: 'Pimpri', lat: 18.6279, lng: 73.8009, q: 0.9 },
  { name: 'Hinjawadi', lat: 18.5912, lng: 73.7389, q: 0.9 },
  { name: 'Wakad', lat: 18.5975, lng: 73.7601, q: 0.85 },
  { name: 'Chinchwad', lat: 18.6446, lng: 73.792, q: 0.85 },
  { name: 'Nigdi', lat: 18.652, lng: 73.77, q: 0.45 },
  { name: 'Baner', lat: 18.559, lng: 73.7868, q: 0.85 },
  { name: 'Aundh', lat: 18.558, lng: 73.8075, q: 0.85 },
  { name: 'Kothrud', lat: 18.5074, lng: 73.8077, q: 0.8 },
  { name: 'Shivajinagar', lat: 18.5308, lng: 73.8475, q: 0.9 },
  { name: 'Pune Station', lat: 18.5286, lng: 73.8746, q: 0.9 },
  { name: 'Viman Nagar', lat: 18.5679, lng: 73.9143, q: 0.8 },
  { name: 'Talegaon', lat: 18.735, lng: 73.676, q: 0.3 },
];
export const findPlace = (n) => PLACES.find((p) => p.name.toLowerCase() === String(n || '').trim().toLowerCase()) || null;

function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hashStr = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hav = (a, b) => { const R = 6371, r = (d) => (d * Math.PI) / 180; const dLa = r(b.lat - a.lat), dLo = r(b.lng - a.lng); const x = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };

// ---- Exact demo values (Pimpri -> Hinjawadi). Scores follow from the weights: A=68, B=84, C=91.
const DEMO = {
  A: { time: 18, dist: 7.2, f: { lighting: 68, activity: 62, transport: 70, help: 60, incidents: 72, road: 82 }, c: { lighting: 0.85, activity: 0.7, transport: 0.8, help: 0.7, incidents: 0.55, road: 0.8 } },
  B: { time: 21, dist: 7.8, f: { lighting: 92, activity: 80, transport: 72, help: 86, incidents: 82, road: 90 }, c: { lighting: 0.9, activity: 0.75, transport: 0.8, help: 0.85, incidents: 0.59, road: 0.8 } },
  C: { time: 25, dist: 8.4, f: { lighting: 96, activity: 88, transport: 80, help: 92, incidents: 94, road: 92 }, c: { lighting: 0.92, activity: 0.8, transport: 0.8, help: 0.9, incidents: 0.62, road: 0.85 } },
};
const DEF = [
  { id: 'A', tag: 'Fastest', dm: 1, speed: 24, bulge: 0.05, base: 64 },
  { id: 'B', tag: 'Balanced', dm: 1.08, speed: 22.3, bulge: -0.09, base: 78 },
  { id: 'C', tag: 'Safety Priority', dm: 1.17, speed: 20.16, bulge: 0.17, base: 88 },
];

// Illustrative geometry. In production, replace with polylines from OSRM / OpenRouteService.
function makePath(a, b, bulge, rng) {
  const N = 56, dLat = b.lat - a.lat, dLng = b.lng - a.lng, len = Math.hypot(dLat, dLng) || 1e-6;
  const pl = -dLng, pg = dLat;
  const cLat = (a.lat + b.lat) / 2 + pl * bulge * 2, cLng = (a.lng + b.lng) / 2 + pg * bulge * 2;
  const ph = rng() * 6, amp = len * 0.012, pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, u = 1 - t;
    let lat = u * u * a.lat + 2 * u * t * cLat + t * t * b.lat;
    let lng = u * u * a.lng + 2 * u * t * cLng + t * t * b.lng;
    const w = Math.sin(t * Math.PI * 7 + ph) * Math.sin(t * Math.PI) * amp;
    lat += (pl / len) * w; lng += (pg / len) * w;
    pts.push([lat, lng]);
  }
  return pts;
}

const HELP_NAMES = ['Verified help desk', '24×7 shop (staffed)', 'Security booth'];
const TRANSPORT_NAMES = ['Bus stop', 'Auto / cab stand', 'Metro access point'];
const INCIDENTS = [
  { title: 'Poor lighting report', verified: true },
  { title: 'Suspicious activity report', verified: false },
  { title: 'Minor accident report', verified: true },
];

function buildPois(path, f, rng, rid) {
  const at = (t, off) => {
    const i = Math.min(path.length - 1, Math.round(t * (path.length - 1)));
    const p = path[i], q = path[Math.min(i + 1, path.length - 1)];
    const dl = q[0] - p[0], dg = q[1] - p[1], n = Math.hypot(dl, dg) || 1;
    return [p[0] + (-dg / n) * off, p[1] + (dl / n) * off];
  };
  const pois = []; let k = 0;
  const add = (type, count, extra) => {
    for (let j = 0; j < count; j++) pois.push({ id: `${rid}-${type}-${k++}`, type, routeId: rid, pos: at(0.06 + rng() * 0.88, (rng() - 0.5) * 0.0016), ...extra(j) });
  };
  add('lighting', Math.round(f.lighting / 16), () => ({ title: 'Street lighting', note: 'Lit segment (estimated coverage)' }));
  add('help', Math.round(f.help / 28), (j) => ({ title: 'Help point', note: HELP_NAMES[j % 3], verified: true }));
  add('transport', Math.round(f.transport / 24), (j) => ({ title: TRANSPORT_NAMES[j % 3], note: 'Public transport access' }));
  add('incident', Math.round((100 - f.incidents) / 9), (j) => ({ ...INCIDENTS[j % 3], note: 'Reported in the last 24 h · route-level, not area label' }));
  add('police', 1, () => ({ title: 'Police station', note: 'Nearest staffed station' }));
  if (rng() > 0.4) add('hospital', 1, () => ({ title: 'Hospital', note: 'Emergency services nearby' }));
  return pois;
}

export function eventPoi(route, e) {
  const p = route.path[Math.floor(route.path.length * (e.kind === 'closure' ? 0.55 : 0.4))];
  return e.kind === 'closure'
    ? { id: `ev-closure-${route.id}`, type: 'closure', routeId: route.id, pos: p, title: 'Road closure', note: 'Detected ~500 m ahead · reroute suggested', verified: true, pulse: true }
    : { id: `ev-incident-${route.id}`, type: 'incident', routeId: route.id, pos: p, title: 'Verified incident', note: 'Reported moments ago · under review', verified: true, pulse: true };
}

export function generateRoutes(s, e) {
  const demo = s.name === 'Pimpri' && e.name === 'Hinjawadi';
  const rng = mulberry32(hashStr(`${s.name}>${e.name}`));
  const d = hav(s, e) * 1.28, q = Math.min(s.q, e.q);
  return DEF.map((def) => {
    const D = demo ? DEMO[def.id] : null;
    const dist = D ? D.dist : +(d * def.dm).toFixed(1);
    const time = D ? D.time : Math.max(4, Math.round((dist / def.speed) * 60));
    let f, c;
    if (D) { f = { ...D.f }; c = { ...D.c }; } else {
      f = {}; c = {};
      FACTOR_KEYS.forEach((k) => {
        f[k] = clamp(Math.round(def.base + (rng() - 0.5) * 18), 20, 98);
        c[k] = +clamp(q * (0.8 + rng() * 0.3) * (k === 'incidents' ? 0.85 : 1), 0, 1).toFixed(2);
      });
    }
    const path = makePath(s, e, def.bulge, rng);
    return { id: def.id, tag: def.tag, name: `Route ${def.id}`, time, dist, f, c, path, pois: buildPois(path, f, rng, def.id) };
  });
}

// Swap the illustrative curves for real road geometry (from /api/route). Scores/factors stay as modelled.
// The Pimpri -> Hinjawadi demo keeps its scripted time/distance so the README demo numbers still hold.
export function applyRealGeometry(routes, real, s, e) {
  if (!real?.length) return routes;
  const demo = s.name === 'Pimpri' && e.name === 'Hinjawadi';
  return routes.map((r, i) => {
    const g = real[i];
    if (!g || !g.path || g.path.length < 2) return r;
    const rng = mulberry32(hashStr(`${s.name}>${e.name}#${r.id}`));
    return { ...r, path: g.path, pois: buildPois(g.path, r.f, rng, r.id), geometry: 'real', steps: g.steps || [], provider: g.provider || 'routing provider', trafficAware: Boolean(g.trafficAware), trafficDelay: g.trafficDelay || 0, trafficStatus: g.trafficStatus || 'Unknown', ...(demo ? {} : { time: g.time, dist: g.dist }) };
  });
}

export const SEED_HISTORY = [];
export const SEED_CONTACTS = [];
export const SEED_REPORTS = [];
