# SurakshitPath: Real road routing setup

## Recommended provider
Use TomTom Routing API. It calculates real road routes using available current traffic information, estimates travel time, and can return alternative routes. TomTom is preferred when both keys are present.

## 1) Create the API key
1. Open https://developer.tomtom.com/ and sign in/create an account.
2. Create a key for your application.
3. Ensure Routing API access is available for your key/account.

## 2) Configure backend environment
Copy `server/.env.example` to `server/.env` and set:

```env
PORT=5000
TOMTOM_API_KEY=PASTE_YOUR_TOMTOM_KEY_HERE
ORS_API_KEY=
DATABASE_URL=
```

TomTom is the primary provider. If TomTom key is empty, the server uses OpenRouteService if `ORS_API_KEY` is configured. ORS routes are actual road routes but do not use live traffic during routing.

Optional ORS key: https://openrouteservice.org/dev/#/signup

## 3) Start the project
From the project root:

```bash
npm install
npm run dev
```

If your project uses separate install commands, run `npm install` in both the root and `client/` and `server/` folders as appropriate. Restart the backend after changing `.env`.

## 4) Test
- Open the web app and search/select any start and destination locations.
- Generate routes.
- Successful routes are marked as real route geometry and contain provider metadata.
- TomTom route results have `trafficAware: true` and traffic-delay metadata.
- ORS results have `trafficAware: false`.
- When routing fails or keys are missing, an error notification appears; the app will not silently draw illustrative route lines as if they were real.

## 5) What is real and what is not yet real
Real from routing providers: road geometry, route distance, estimated travel time, routing alternatives, and TomTom's traffic-aware ETA (subject to coverage and API limits).
Still modelled/demo in this project: route safety scores/factors, demo incidents/simulation events, trusted-contact journey sharing, and journey progress simulation. OSM POI/surface/light data is mapped data and can be incomplete or outdated. Missing data must not be interpreted as evidence of danger.

## Security
- Do not put API keys in `client/src` or `VITE_` environment variables.
- Do not commit `server/.env` or share screenshots containing keys.
- Check provider quotas, billing/usage limits and terms before public deployment.

## Searching for arbitrary locations

The Plan Route and Live Map pages now use the `LocationSearch` component. Enter at least three characters and wait for suggestions from the backend `/api/geocode` endpoint. Select a suggestion to save its latitude/longitude; merely typing text is not treated as a confirmed coordinate. The backend proxies OpenStreetMap Nominatim so the browser does not call it directly. Search is debounced to reduce requests; respect the public Nominatim usage policy and switch to a hosted geocoder for production/high-volume use.

## TomTom live traffic enrichment

When `TOMTOM_API_KEY` is configured, `POST /api/route` now enriches each calculated route with:

- `route.traffic.sampledSegments`: up to three TomTom Flow Segment samples along that route, including current/free-flow speed, confidence, closure flag, and congestion percentage.
- `route.traffic.averageCurrentSpeed`, `averageFreeFlowSpeed`, `congestionPercent`, and `roadClosureDetected` summaries when flow data is available.
- Top-level `traffic.incidents`: current TomTom Traffic Incidents (v5) returned for the combined route bounding box, with category, delay, road, and geometry details where supplied by TomTom.
- Top-level `traffic.incidentStatus`, `traffic.status`, and `traffic.sampledAt` to distinguish available data from an unavailable feed.

The API key stays on the backend. Traffic flow is sampled at three evenly spaced points per route, so it is an indicative sample rather than a continuous speed profile. Incident results are for the bounding box around all returned alternatives and may include incidents not exactly on a route. No incident or closure should be treated as a guarantee of road safety.

To verify after restarting the server, generate a route and inspect the JSON response for `traffic`, `routes[0].traffic.sampledSegments`, and `traffic.incidents`. A missing/disabled Traffic API product or a rejected key will show `unavailable`; check that the Traffic Flow and Traffic Incidents products are enabled for the same TomTom key.
