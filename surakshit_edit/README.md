# SurakshitPath

SurakshitPath is a React + Vite frontend with an Express API and optional PostgreSQL storage.

## What's included in this updated project

- Select a custom start and destination by clicking anywhere on the Leaflet map.
- Search for real addresses and places with the Nominatim geocoder.
- Request real road routes from TomTom Routing with current traffic-aware ETA and alternative routes (preferred); OpenRouteService remains a fallback.
- Load nearby mapped context from OpenStreetMap/Overpass:
  - mapped streetlights;
  - mapped police, hospitals, clinics and fire stations;
  - mapped cafes, restaurants, shops/venues and transit indicators;
  - road surface tags where contributors have mapped them.
- TomTom traffic-aware route planning when `TOMTOM_API_KEY` is configured; point-level traffic flow lookup is also available.
- Existing user-submitted incident reports remain **Pending Verification** until reviewed.
- Existing demo/scenario features remain available, but are not presented as verified live incident data.

## Important data limitations

This is a practical integration of available map data, not a complete live safety feed. OpenStreetMap coverage varies by area: zero mapped streetlights or emergency services means **unknown/not mapped**, not that none exist. Venue counts are only proxies for nearby activity and do not measure live pedestrian footfall. Road surface tags are mapped attributes, not live pothole/maintenance reports. No verified crime/incident feed is connected by default. The safety scores and simulated events in the existing demo experience are not yet calculated from a complete verified real-time dataset. Do not rely on this prototype as an emergency or personal-safety guarantee.

TomTom is the recommended primary provider: routes use current traffic, traffic delay, ETA and alternatives. OpenRouteService is a fallback for actual road geometry/directions, but its results are not traffic-aware. Route generation now fails with a message when no provider/key is configured or the provider is unavailable; it will not replace a failed request with invented route lines. Safety scores still include modelled/demo factors and should not be represented as verified real-world safety assessments.

## Requirements

- Node.js 20 or newer (Node 22 recommended)
- npm
- Optional PostgreSQL database
- TomTom API key (recommended) or OpenRouteService API key for route geometry
- Optional TomTom API key for live traffic

## Setup on Windows / VS Code

1. Extract the ZIP file.
2. In VS Code choose **File → Open Folder** and open the `surakshitpath` folder (the folder that contains `client`, `server`, and the root `package.json`). Do not open a patch-only folder.
3. In the VS Code terminal, confirm the terminal is in the project root. Run:

   ```powershell
   dir package.json
   ```

   You should see the root `package.json` and the `client` and `server` folders.

4. Create the backend environment file by copying the example:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

5. Open `server/.env` and set your keys:

   ```env
   PORT=5000
   DATABASE_URL=
   TOMTOM_API_KEY=YOUR_TOMTOM_KEY
   ORS_API_KEY=
   ```

   `DATABASE_URL` is optional; without it the backend uses in-memory storage. `TOMTOM_API_KEY` enables traffic-aware routing and is preferred. If absent, `ORS_API_KEY` enables real-road routes without live traffic routing. Keep `.env` private; never commit or share real keys.

6. From the project root install all dependencies:

   ```powershell
   npm run install:all
   ```

7. Start frontend and backend together from the project root:

   ```powershell
   npm run dev
   ```

8. Open `http://localhost:5173` in your browser. The API runs at `http://localhost:5000`.

## Alternative: run each service separately

Terminal 1:

```powershell
cd server
npm install
npm run dev
```

Terminal 2, from the project root in a second terminal:

```powershell
cd client
npm install
npm run dev
```

## Map use

1. Open the Map page.
2. Choose **Pick start on map** and click the map, or search for an address and select a result.
3. Choose **Pick destination** and click/search for the destination.
4. Press **Show routes**. With a valid TomTom key, routes are real roads and routing uses available current traffic; with ORS only, routes are real roads but traffic is not used in route calculation. The app does not generate fake route lines on failure.
5. The Nearby real-world data panel loads mapped features around the selected point. Use Refresh to request the data again.

## API endpoints added/used

- `GET /api/geocode?q=<place>` — Nominatim place search proxy.
- `POST /api/route` — TomTom traffic-aware directions (preferred) or ORS fallback; request coordinates are `[longitude, latitude]`.
- `GET /api/conditions?lat=<lat>&lng=<lng>&radius=<meters>` — OpenStreetMap/Overpass nearby counts plus optional TomTom traffic.
- `GET /api/health` — API/database/routing status.

## Data attribution

Map tiles and mapped features are © OpenStreetMap contributors. Geocoding uses Nominatim. Nearby feature counts use the public Overpass API. Routing uses OpenRouteService when configured. Traffic uses TomTom when configured. Respect each provider's usage policies, attribution requirements, rate limits, and production terms. For a public production deployment, use a suitable hosted geocoding/Overpass service or your own cache/proxy and add request throttling, monitoring, and abuse protection.
