import { Fragment, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import IncidentMarker from './IncidentMarker';
import HelpPointMarker from './HelpPointMarker';
import PoiMarker from './PoiMarker';
import { ROUTE_COLORS, pinIcon } from '../lib/poi';

function MapClickPicker({ onMapPick }) {
  useMapEvents({ click(e) { if (onMapPick) onMapPick({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return null;
}

function Fit({ points, fitKey, focus }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
      else if (points.length === 1) map.setView(points[0], 14);
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [fitKey]);
  useEffect(() => { if (focus) map.flyTo(focus.pos, focus.zoom || 14, { duration: 0.8 }); /* eslint-disable-next-line */ }, [focus?.key]);
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map]);
  return null;
}

const HELP = ['help', 'police', 'hospital'];
const routeBadgeCache = {};
function routeBadgeIcon(route, color, selected) {
  const label = `Route ${route.id} · ${route.tag || ''}${route.time != null ? ` · ${route.time} min` : ''}`;
  const key = `${route.id}-${color}-${selected}-${label}`;
  if (!routeBadgeCache[key]) {
    routeBadgeCache[key] = L.divIcon({
      className: 'route-badge-wrap',
      html: `<span style="--route-color:${color};--route-scale:${selected ? 1 : .92}" class="route-map-badge${selected ? ' is-selected' : ''}"><b>${route.id}</b><span>${label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span></span>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }
  return routeBadgeCache[key];
}

export default function MapView({ routes = [], selectedId, onSelect, start, end, types, scope = 'selected', wheel = false, height = '100%', journey = null, fitKey = 'x', focus = null, className = '', onMapPick = null }) {
  const ordered = useMemo(() => [...routes].sort((a, b) => (a.id === selectedId) - (b.id === selectedId)), [routes, selectedId]);
  const pts = routes.length ? routes.flatMap((r) => r.path) : [start, end].filter(Boolean).map((p) => [p.lat, p.lng]);
  const pois = useMemo(() => routes.flatMap((r) => r.pois).filter((p) => {
    if (types && !types[p.type]) return false;
    if (scope === 'all') return true;
    return p.routeId === selectedId || p.type === 'incident' || p.type === 'closure';
  }), [routes, types, scope, selectedId]);
  const jr = journey?.active ? routes.find((r) => r.id === journey.routeId) : null;
  const you = jr ? jr.path[Math.min(jr.path.length - 1, Math.floor(journey.progress * (jr.path.length - 1)))] : null;
  const touch = L.Browser.mobile && !wheel;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <MapContainer center={[18.6, 73.78]} zoom={12} scrollWheelZoom={wheel} dragging={!touch} touchZoom={!touch} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        <Fit points={pts} fitKey={fitKey} focus={focus} />
        <MapClickPicker onMapPick={onMapPick} />
        {ordered.map((r) => {
          const sel = r.id === selectedId;
          const color = ROUTE_COLORS[r.id] || '#3B82F6';
          const badgePoint = r.path?.length ? r.path[Math.floor((r.path.length - 1) / 2)] : null;
          return (
            <Fragment key={`${r.id}-${fitKey}`}>
              {sel && <Polyline positions={r.path} pathOptions={{ color, weight: 14, opacity: 0.16, lineCap: 'round' }} interactive={false} />}
              <Polyline positions={r.path} pathOptions={{ color, weight: sel ? 6 : 3.5, opacity: sel ? 1 : 0.5, lineCap: 'round', lineJoin: 'round', className: 'route-anim' }} eventHandlers={{ click: () => onSelect && onSelect(r.id) }}>
                <Tooltip sticky className="lbl">Route {r.id} · {r.tag} · {r.time} min{r.score != null ? ` · ${r.score}/100` : ''}</Tooltip>
              </Polyline>
              {badgePoint && <Marker position={badgePoint} icon={routeBadgeIcon(r, color, sel)} zIndexOffset={sel ? 850 : 700} eventHandlers={{ click: () => onSelect && onSelect(r.id) }} /> }
            </Fragment>
          );
        })}
        {pois.map((p) => (p.type === 'incident' || p.type === 'closure' ? <IncidentMarker key={p.id} poi={p} /> : HELP.includes(p.type) ? <HelpPointMarker key={p.id} poi={p} /> : <PoiMarker key={p.id} poi={p} />))}
        {start && <Marker position={[start.lat, start.lng]} icon={pinIcon('start')} zIndexOffset={900}><Tooltip permanent direction="top" offset={[0, -10]} className="lbl">{start.name}</Tooltip></Marker>}
        {end && <Marker position={[end.lat, end.lng]} icon={pinIcon('end')} zIndexOffset={900}><Tooltip permanent direction="top" offset={[0, -10]} className="lbl">{end.name}</Tooltip></Marker>}
        {you && <Marker position={you} icon={pinIcon('you')} zIndexOffset={1000}><Tooltip direction="top" offset={[0, -10]} className="lbl">You</Tooltip></Marker>}
      </MapContainer>
    </div>
  );
}
