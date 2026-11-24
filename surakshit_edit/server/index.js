import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as store from './models.js';
import { hashPassword, validateCredentials, verifyPassword } from './auth.js';
import { scoreFactors } from './scoring.js';
import { fetchRoutes, hasRoutingKey, parseRouteRequest, addTomTomTraffic } from './routing.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const mem = { journeys: [], reports: [], contacts: [], users: [] }; // fallback when PostgreSQL is not connected
let dbReady = false;
const db = () => dbReady;
const id = () => Math.random().toString(36).slice(2, 10);

function crud(name, validate) {
  app.get(`/api/${name}`, async (_req, res) => res.json(db() ? await store.list(name) : mem[name]));
  app.post(`/api/${name}`, async (req, res) => {
    const err = validate?.(req.body);
    if (err) return res.status(400).json({ error: err });
    const { _id, id: _clientId, ...body } = req.body;
    if (name === 'reports') body.status = 'Pending Verification'; // clients cannot self-verify
    res.status(201).json(db() ? await store.create(name, body) : (mem[name].unshift({ _id: id(), ...body }), mem[name][0]));
  });
  app.delete(`/api/${name}/:id`, async (req, res) => {
    if (db()) { await store.remove(name, req.params.id); }
    else mem[name] = mem[name].filter((x) => x._id !== req.params.id);
    res.json({ ok: true });
  });
}
crud('journeys');
crud('reports', (b) => (!b.type || !b.location || !b.description ? 'type, location and description are required' : null));
crud('contacts', (b) => (!b.name ? 'name is required' : null));

// Login / sign-up (passwords are stored as scrypt hashes in the `users` table).
const norm = (e) => String(e || '').trim().toLowerCase();
app.post('/api/auth/register', async (req, res) => {
  const { name, password } = req.body || {};
  const email = norm(req.body?.email);
  const err = validateCredentials({ email, password }, { needName: true, name });
  if (err) return res.status(400).json({ error: err });
  const passwordHash = hashPassword(password);
  if (db()) {
    const user = await store.createUser({ name: String(name).trim(), email, passwordHash });
    return user ? res.status(201).json({ user }) : res.status(409).json({ error: 'email already registered' });
  }
  if (mem.users.some((u) => u.email === email)) return res.status(409).json({ error: 'email already registered' });
  const user = { _id: id(), name: String(name).trim(), email, passwordHash };
  mem.users.push(user);
  res.status(201).json({ user: { _id: user._id, name: user.name, email } });
});
app.post('/api/auth/login', async (req, res) => {
  const email = norm(req.body?.email);
  const password = req.body?.password;
  const err = validateCredentials({ email, password });
  if (err) return res.status(400).json({ error: err });
  const found = db() ? await store.findUserByEmail(email) : mem.users.find((u) => u.email === email);
  if (!found || !verifyPassword(password, found.passwordHash)) return res.status(401).json({ error: 'invalid email or password' });
  res.json({ user: { _id: found._id, name: found.name, email: found.email } });
});

// Explainable scoring endpoint: POST { factors: { lighting: { value, coverage }, ... }, weights? }
app.post('/api/score', (req, res) => {
  if (!req.body?.factors) return res.status(400).json({ error: 'factors required' });
  res.json(scoreFactors(req.body.factors, req.body.weights));
});

// Search real POIs, street addresses and small localities. Prefer TomTom Search
// (when configured), then merge OpenStreetMap/Nominatim results as a fallback.
app.get('/api/geocode', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.status(400).json({ error: 'Enter at least 2 characters' });
  const results = [];
  const seen = new Set();
  const add = (item) => {
    const lat = Number(item.lat), lng = Number(item.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (seen.has(key)) return;
    seen.add(key); results.push({ name: item.name, lat, lng, source: item.source });
  };
  // TomTom Search API finds businesses, POIs, street addresses and smaller places.
  if (process.env.TOMTOM_API_KEY) {
    try {
      const url = new URL(`https://api.tomtom.com/search/2/search/${encodeURIComponent(q)}.json`);
      url.search = new URLSearchParams({ key: process.env.TOMTOM_API_KEY, limit: '10', countrySet: 'IN', typeahead: 'true', language: 'en-IN', idxSet: 'POI,Addr,Geo' });
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (response.ok) {
        const data = await response.json();
        for (const x of data.results || []) {
          const a = x.address || {};
          const name = [x.poi?.name || a.freeformAddress, a.municipality, a.country].filter(Boolean).join(', ');
          add({ name: name || q, lat: x.position?.lat, lng: x.position?.lon, source: 'TomTom' });
        }
      }
    } catch (err) { console.warn('TomTom place search unavailable:', err.message); }
  }
  // Nominatim broadens coverage when TomTom returns few/no matches. This also
  // reduces requests to the community-operated public Nominatim service.
  if (results.length < 5) try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.search = new URLSearchParams({ q, format: 'jsonv2', limit: '10', addressdetails: '1', countrycodes: 'in', 'accept-language': 'en' });
    const response = await fetch(url, { headers: { 'User-Agent': 'SurakshitPath/1.0 (route-planning app; contact: support@surakshitpath.local)' }, signal: AbortSignal.timeout(10000) });
    if (response.ok) {
      const rows = await response.json();
      for (const x of rows) add({ name: x.display_name, lat: x.lat, lng: x.lon, source: 'OpenStreetMap' });
    }
  } catch (err) { console.warn('OpenStreetMap search unavailable:', err.message); }
  res.json({ results: results.slice(0, 12) });
});

// Nearby mapped safety/context features from OpenStreetMap Overpass.
// Counts are mapped observations, not proof that an area has/hasn't got a feature.
app.get('/api/conditions', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: 'Valid lat and lng are required' });
  }
  const radius = Math.min(2500, Math.max(300, Number(req.query.radius) || 1200));
  const query = `[out:json][timeout:20];(node(around:${radius},${lat},${lng})[highway=street_lamp];way(around:${radius},${lat},${lng})[highway=street_lamp];node(around:${radius},${lat},${lng})[amenity~"^(police|hospital|clinic|fire_station)$"];way(around:${radius},${lat},${lng})[amenity~"^(police|hospital|clinic|fire_station)$"];node(around:${radius},${lat},${lng})[amenity~"^(cafe|restaurant|fast_food|bar|marketplace|bus_station|taxi)$"];way(around:${radius},${lat},${lng})[amenity~"^(cafe|restaurant|fast_food|bar|marketplace|bus_station|taxi)$"];way(around:${radius},${lat},${lng})[highway][surface];);out center tags;`;
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': 'SurakshitPath/1.0' },
      body: new URLSearchParams({ data: query }), signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
    const data = await response.json();
    const elements = data.elements || [];
    const count = (fn) => elements.filter((x) => fn(x.tags || {})).length;
    const emergency = {
      police: count((t) => t.amenity === 'police'),
      hospitals: count((t) => t.amenity === 'hospital'),
      clinics: count((t) => t.amenity === 'clinic'),
      fireStations: count((t) => t.amenity === 'fire_station')
    };
    const surfaceCounts = {};
    for (const x of elements) {
      const surface = x.tags?.surface;
      if (surface) surfaceCounts[surface] = (surfaceCounts[surface] || 0) + 1;
    }
    const venues = count((t) => ['cafe','restaurant','fast_food','bar','marketplace','bus_station','taxi'].includes(t.amenity));
    const traffic = { status: 'not_configured', message: 'Live traffic is not configured. Add TOMTOM_API_KEY to server/.env to enable it.' };
    if (process.env.TOMTOM_API_KEY) {
      try {
        const u = new URL('https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json');
        u.search = new URLSearchParams({ key: process.env.TOMTOM_API_KEY, point: `${lat},${lng}`, unit: 'KMPH', openLr: 'false' });
        const tr = await fetch(u, { signal: AbortSignal.timeout(8000) });
        if (tr.ok) {
          const td = await tr.json(); const f = td.flowSegmentData;
          traffic.status = 'available'; traffic.currentSpeed = f?.currentSpeed ?? null;
          traffic.freeFlowSpeed = f?.freeFlowSpeed ?? null; traffic.confidence = f?.confidence ?? null;
          traffic.roadClosure = f?.roadClosure ?? false;
        } else traffic.status = 'unavailable';
      } catch { traffic.status = 'unavailable'; }
    }
    res.json({ source: 'OpenStreetMap contributors via Overpass API', radiusMeters: radius,
      updatedAt: new Date().toISOString(), lighting: { mappedStreetlights: count((t) => t.highway === 'street_lamp') },
      emergency, publicActivity: { mappedVenuesAndTransit: venues, note: 'Mapped venues/transit are only proxies for nearby activity; they do not measure live footfall.' },
      roads: { mappedRoadSegmentsWithSurface: Object.values(surfaceCounts).reduce((a,b) => a+b,0), surfaceCounts,
        note: 'Surface tags describe mapped road attributes, not live damage or maintenance status.' }, traffic,
      incidentData: { status: 'not_available', note: 'No verified public incident feed is connected. User-submitted reports remain unverified until reviewed.' },
      limitations: 'OpenStreetMap coverage is incomplete. Zero mapped objects means unknown, not absent or unsafe.'
    });
  } catch (e) {
    res.status(502).json({ error: 'Nearby map conditions are temporarily unavailable', detail: e.message });
  }
});

// Real road routing: TomTom traffic-aware routing is preferred; ORS is the fallback provider.
app.post('/api/route', async (req, res) => {
  if (!hasRoutingKey()) return res.status(503).json({ error: 'ORS_API_KEY is not set in server/.env' });
  const q = parseRouteRequest(req.body);
  if (!q) return res.status(400).json({ error: 'start and end must be [lng, lat] numbers' });
  try {
    const baseRoutes = await fetchRoutes(q.start, q.end);
    const enriched = await addTomTomTraffic(baseRoutes);
    res.json({ routes: enriched.routes, traffic: enriched.traffic, provider: enriched.routes[0]?.provider || 'unknown', trafficAware: Boolean(enriched.routes[0]?.trafficAware) });
  } catch (e) {
    console.warn('Routing failed:', e.message, e.detail || '');
    res.status(e.status === 401 || e.status === 403 ? 502 : (e.status || 500)).json({ error: e.status === 401 || e.status === 403 ? 'Routing API key rejected – check your configured key' : e.message || 'Routing failed' });
  }
});
app.get('/api/health', (_req, res) => res.json({ ok: true, database: db() ? 'postgresql' : 'in-memory', routing: process.env.TOMTOM_API_KEY ? 'TomTom traffic-aware configured' : process.env.ORS_API_KEY ? 'ORS configured (not live traffic)' : 'not configured (real route generation disabled)' }));

const port = process.env.PORT || 5000;
const connectDb = process.env.DATABASE_URL
  ? store.connect(process.env.DATABASE_URL).then(() => { dbReady = true; console.log('PostgreSQL connected'); })
  : Promise.reject(new Error('DATABASE_URL not set'));
connectDb
  .catch((e) => console.warn(`PostgreSQL not available (${e.message}) – using in-memory storage`))
  .finally(() => app.listen(port, () => console.log(`API on http://localhost:${port}`)));
