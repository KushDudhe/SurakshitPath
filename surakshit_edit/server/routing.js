// Traffic-aware real-road routing. Keys remain server-side.
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
const TOMTOM_URL = 'https://api.tomtom.com/routing/1/calculateRoute';
export const hasRoutingKey = () => Boolean(process.env.TOMTOM_API_KEY?.trim() || process.env.ORS_API_KEY?.trim());
const validPoint = (p) => Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === 'number' && Number.isFinite(n)) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90;
const simplifyPath = (pts) => { const step = Math.max(1, Math.ceil(pts.length / 400)); return pts.filter((_, i) => i % step === 0 || i === pts.length - 1); };

async function fetchTomTom(start, end) {
  const locations = `${start[1]},${start[0]}:${end[1]},${end[0]}`;
  const u = new URL(`${TOMTOM_URL}/${locations}/json`);
  u.search = new URLSearchParams({ key: process.env.TOMTOM_API_KEY.trim(), traffic: 'true', departAt: 'now', routeType: 'fastest', maxAlternatives: '2', sectionType: 'traffic', computeTravelTimeFor: 'all', instructionsType: 'text', language: 'en-US' });
  const response = await fetch(u, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) { const detail = await response.text().catch(() => ''); const e = new Error(`TomTom returned ${response.status}`); e.status = response.status; e.detail = detail.slice(0, 350); throw e; }
  const data = await response.json();
  return (data.routes || []).map((r) => {
    const summary = r.summary || {};
    const points = (r.legs || []).flatMap((leg) => leg.points || []).map((p) => [p.latitude, p.longitude]);
    const instructions = (r.guidance?.instructions || []).map((i) => ({ instruction: i.message || i.instruction || '', distance: i.routeOffsetInMeters ?? i.distanceInMeters ?? 0, duration: 0, name: i.street || '', type: i.maneuver ?? '' }));
    return { path: simplifyPath(points), dist: +(summary.lengthInMeters / 1000).toFixed(1), time: Math.max(1, Math.round(summary.travelTimeInSeconds / 60)), trafficDelay: Math.round((summary.trafficDelayInSeconds || 0) / 60), trafficStatus: summary.trafficDelayInSeconds > 600 ? 'Heavy' : summary.trafficDelayInSeconds > 180 ? 'Moderate' : 'Light', steps: instructions, provider: 'TomTom', trafficAware: true };
  }).filter((r) => r.path.length > 1);
}
async function fetchORS(start, end) {
  const body = { coordinates: [start, end], alternative_routes: { target_count: 3, share_factor: 0.6, weight_factor: 1.6 }, instructions: true, instructions_format: 'text' };
  const response = await fetch(ORS_URL, { method: 'POST', headers: { Authorization: process.env.ORS_API_KEY.trim(), 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(12000) });
  if (!response.ok) { const detail = await response.text().catch(() => ''); const e = new Error(`OpenRouteService returned ${response.status}`); e.status = response.status; e.detail = detail.slice(0, 350); throw e; }
  const data = await response.json();
  return (data.features || []).slice(0, 3).map((f) => {
    const pts = f.geometry.coordinates; const path = simplifyPath(pts).map(([lng, lat]) => [lat, lng]); const s = f.properties.summary;
    const steps = (f.properties.segments || []).flatMap((segment) => segment.steps || []).map((step) => ({ instruction: step.instruction, distance: Math.round(step.distance), duration: Math.round(step.duration), name: step.name || '', type: step.type }));
    return { path, dist: +(s.distance / 1000).toFixed(1), time: Math.max(1, Math.round(s.duration / 60)), steps, provider: 'OpenRouteService', trafficAware: false };
  });
}
export async function fetchRoutes(start, end) {
  if (process.env.TOMTOM_API_KEY?.trim()) return fetchTomTom(start, end);
  if (process.env.ORS_API_KEY?.trim()) return fetchORS(start, end);
  const e = new Error('No routing API key configured. Add TOMTOM_API_KEY or ORS_API_KEY to server/.env'); e.status = 503; throw e;
}


// Enrich calculated routes with independent TomTom Traffic Flow and Incident data.
// Flow requests are sampled along each route (not just at the user's start point).
async function tomtomJson(url, label) {
  const response = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const error = new Error(`${label} returned ${response.status}`);
    error.status = response.status;
    error.detail = detail.slice(0, 250);
    throw error;
  }
  return response.json();
}

function sampleRoutePoints(path, maxSamples = 3) {
  if (!path?.length) return [];
  const count = Math.min(maxSamples, path.length);
  if (count === 1) return [path[0]];
  return Array.from({ length: count }, (_, i) => path[Math.round(i * (path.length - 1) / (count - 1))]);
}

export async function addTomTomTraffic(routes) {
  const key = process.env.TOMTOM_API_KEY?.trim();
  if (!key || !routes?.length) return { routes, traffic: { status: 'not_configured', incidents: [] } };

  const flowTasks = routes.map(async (route, routeIndex) => {
    const points = sampleRoutePoints(route.path, 3);
    const segments = await Promise.all(points.map(async ([lat, lng]) => {
      const url = new URL('https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json');
      url.search = new URLSearchParams({ key, point: `${lat},${lng}`, unit: 'KMPH', openLr: 'false' });
      try {
        const data = await tomtomJson(url, 'TomTom Traffic Flow');
        const f = data.flowSegmentData || {};
        return { point: { lat, lng }, currentSpeed: f.currentSpeed ?? null, freeFlowSpeed: f.freeFlowSpeed ?? null,
          confidence: f.confidence ?? null, roadClosure: Boolean(f.roadClosure),
          congestionRatio: f.freeFlowSpeed > 0 && Number.isFinite(f.currentSpeed) ? Math.round((1 - f.currentSpeed / f.freeFlowSpeed) * 100) : null };
      } catch (error) {
        console.warn('TomTom flow sample unavailable:', error.message);
        return { point: { lat, lng }, status: 'unavailable' };
      }
    }));
    const known = segments.filter((x) => Number.isFinite(x.currentSpeed));
    const avgCurrent = known.length ? known.reduce((a, x) => a + x.currentSpeed, 0) / known.length : null;
    const avgFree = known.length ? known.reduce((a, x) => a + (x.freeFlowSpeed || x.currentSpeed), 0) / known.length : null;
    return { ...route, traffic: { status: known.length ? 'available' : 'unavailable', sampledSegments: segments,
      averageCurrentSpeed: avgCurrent === null ? null : Math.round(avgCurrent), averageFreeFlowSpeed: avgFree === null ? null : Math.round(avgFree),
      congestionPercent: avgCurrent !== null && avgFree > 0 ? Math.max(0, Math.min(100, Math.round((1 - avgCurrent / avgFree) * 100))) : null,
      roadClosureDetected: segments.some((x) => x.roadClosure === true) } };
  });

  const allPoints = routes.flatMap((r) => r.path || []);
  const lats = allPoints.map((p) => p[0]).filter(Number.isFinite);
  const lngs = allPoints.map((p) => p[1]).filter(Number.isFinite);
  let incidents = [];
  let incidentStatus = 'unavailable';
  if (lats.length && lngs.length) {
    const padLat = 0.01, padLng = 0.01;
    const bbox = [Math.min(...lngs) - padLng, Math.min(...lats) - padLat, Math.max(...lngs) + padLng, Math.max(...lats) + padLat].join(',');
    try {
      const url = new URL('https://api.tomtom.com/traffic/services/5/incidentDetails');
      url.search = new URLSearchParams({ key, bbox, language: 'en-GB', timeValidityFilter: 'present',
        fields: '{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events,from,to,length,delay,roadNumbers,timeValidity}}}' });
      const data = await tomtomJson(url, 'TomTom Traffic Incidents');
      incidents = (data.incidents || []).map((incident) => {
        const props = incident.properties || {};
        return { id: props.id || incident.id || null, type: incident.type || 'Feature', geometry: incident.geometry || null,
          category: props.iconCategory ?? null, magnitudeOfDelay: props.magnitudeOfDelay ?? null,
          from: props.from ?? null, to: props.to ?? null, lengthMeters: props.length ?? null,
          delaySeconds: props.delay ?? null, roadNumbers: props.roadNumbers ?? [], events: props.events ?? [],
          timeValidity: props.timeValidity ?? 'present', source: 'TomTom' };
      });
      incidentStatus = 'available';
    } catch (error) {
      console.warn('TomTom incident lookup unavailable:', error.message, error.detail || '');
    }
  }
  const enrichedRoutes = await Promise.all(flowTasks);
  return { routes: enrichedRoutes, traffic: { status: enrichedRoutes.some((r) => r.traffic?.status === 'available') || incidentStatus === 'available' ? 'available' : 'unavailable',
    flowProvider: 'TomTom Traffic Flow API', incidentProvider: 'TomTom Traffic Incidents API', incidentStatus, incidents,
    sampledAt: new Date().toISOString(), note: 'Traffic flow is sampled at a few points along each route; incident results cover the combined route bounding box.' } };
}

export function parseRouteRequest(body) { const { start, end } = body || {}; return validPoint(start) && validPoint(end) ? { start, end } : null; }
