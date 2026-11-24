const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const apiUrl = (path) => `${API_BASE}/api${path}`;

async function call(method, path, body) {
  try {
    const r = await fetch(apiUrl(path), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!r.ok) throw new Error('bad status');
    return await r.json();
  } catch {
    return null;
  }
}

export const api = {
  get: (p) => call('GET', p),
  post: (p, b) => call('POST', p, b),
  del: (p) => call('DELETE', p)
};

export async function fetchRealRoutes(s, e) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16000);

  try {
    const r = await fetch(apiUrl('/route'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: [s.lng, s.lat],
        end: [e.lng, e.lat]
      }),
      signal: controller.signal
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      throw new Error(data.error || `Routing request failed (${r.status})`);
    }

    if (!data.routes?.length) {
      throw new Error('Routing provider returned no valid routes. Try different locations.');
    }

    return data.routes;
  } finally {
    clearTimeout(timer);
  }
}

export async function authRequest(path, body) {
  try {
    const r = await fetch(apiUrl('/auth' + path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await r.json().catch(() => ({}));

    if (r.ok) return { user: data.user };
    if (r.status >= 500) return { offline: true };

    return { error: data.error || 'Something went wrong' };
  } catch {
    return { offline: true };
  }
}

export async function searchLocations(query) {
  const r = await fetch(apiUrl('/geocode?q=' + encodeURIComponent(query)));
  const data = await r.json().catch(() => ({}));

  if (!r.ok) throw new Error(data.error || 'Location search failed');

  return data.results || [];
}

export async function fetchAreaConditions(lat, lng) {
  try {
    const r = await fetch(
      apiUrl(`/conditions?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`)
    );

    if (!r.ok) return null;

    return await r.json();
  } catch {
    return null;
  }
}