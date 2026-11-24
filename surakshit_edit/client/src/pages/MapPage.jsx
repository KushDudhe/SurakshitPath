import { useEffect, useMemo, useState } from 'react';
import { Layers, Search, SlidersHorizontal, X } from 'lucide-react';
import MapView from '../components/MapView';
import SafetySlider from '../components/SafetySlider';
import { useApp } from '../state/AppContext';
import { PLACES, findPlace } from '../lib/data';
import { fetchAreaConditions } from '../lib/api';
import LocationSearch from '../components/LocationSearch';
import { POI_META } from '../lib/poi';

const ALL_ON = Object.fromEntries(Object.keys(POI_META).map((k) => [k, true]));

export default function MapPage() {
  const { start, setStart, end, setEnd, startPoint, setStartPoint, endPoint, setEndPoint, departure, setDeparture, pref, setPref, view, selected, selectedId, selectRoute, generate, generating, planKey, journey } = useApp();
  const [types, setTypes] = useState(ALL_ON);
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(null);
  const [panel, setPanel] = useState(false);
  const [legend, setLegend] = useState(false);
  const [pickMode, setPickMode] = useState('start');
  const [conditions, setConditions] = useState(null);
  const [conditionsLoading, setConditionsLoading] = useState(false);
  const conditionPoint = startPoint || endPoint || findPlace(start) || findPlace(end);
  useEffect(() => {
    let active = true;
    if (!conditionPoint) return () => { active = false; };
    setConditions(null);
    setConditionsLoading(true);
    fetchAreaConditions(conditionPoint.lat, conditionPoint.lng).then((data) => { if (active) setConditions(data); }).finally(() => { if (active) setConditionsLoading(false); });
    return () => { active = false; };
  }, [conditionPoint?.lat, conditionPoint?.lng]);
  const hits = q ? PLACES.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [];
  const counts = useMemo(() => { const c = {}; view.list.forEach((r) => r.pois.forEach((p) => { c[p.type] = (c[p.type] || 0) + 1; })); return c; }, [view.list]);
  const go = (p) => { setFocus({ pos: [p.lat, p.lng], zoom: 14, key: Date.now() }); setQ(''); };

  return (
    <div className="fixed inset-x-0 bottom-[60px] top-[72px] lg:bottom-0 lg:left-[220px]">
      <MapView routes={view.list} selectedId={selectedId} onSelect={selectRoute} start={startPoint || findPlace(start)} end={endPoint || findPlace(end)} types={types} scope="all" wheel journey={journey} fitKey={`m-${planKey}-${start}-${end}`} focus={focus} height="100%" onMapPick={(p) => { const point = { ...p, name: `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`, q: 0.5 }; if (pickMode === 'start') { setStartPoint(point); setStart(point.name); setPickMode('end'); } else { setEndPoint(point); setEnd(point.name); } }} />

      {/* status bar */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-[500] flex justify-center px-3">
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-white/10 bg-[#09090B]/85 px-4 py-2 text-xs backdrop-blur-xl">
          <span className="flex items-center gap-2 font-medium"><span className="dot-live h-1.5 w-1.5 rounded-full bg-accent" />Area data</span>
          <span className="text-muted">{conditions?.source ? `OpenStreetMap · ${new Date(conditions.updatedAt).toLocaleTimeString()}` : conditionsLoading ? 'Loading mapped data…' : 'Select a location to inspect data'}</span>
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-amber-300">COVERAGE MAY BE INCOMPLETE</span>
        </div>
      </div>

      {/* mobile toggles */}
      <div className="absolute bottom-3 left-3 z-[500] flex gap-2 md:hidden">
        <button onClick={() => setPanel(!panel)} className="btn-ghost btn-sm !bg-[#0F0F11]/90"><SlidersHorizontal className="h-3.5 w-3.5" />Controls</button>
        <button onClick={() => setLegend(!legend)} className="btn-ghost btn-sm !bg-[#0F0F11]/90"><Layers className="h-3.5 w-3.5" />Legend</button>
      </div>

      {/* controls */}
      <div className={`${panel ? 'block' : 'hidden'} absolute bottom-14 left-3 right-3 z-[500] max-h-[70%] overflow-y-auto rounded-2xl border border-white/10 bg-[#0F0F11]/90 p-4 backdrop-blur-xl md:bottom-auto md:right-auto md:top-16 md:block md:max-h-[calc(100%-5rem)] md:w-[320px]`}>
        <div className="mb-3 flex items-center justify-between md:hidden"><span className="text-sm font-medium">Controls</span><button onClick={() => setPanel(false)} aria-label="Close"><X className="h-4 w-4" /></button></div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
          <input className="input !pl-9" placeholder="Search location" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search location" />
          {hits.length > 0 && <div className="absolute inset-x-0 top-full z-10 mt-1 rounded-xl border border-white/10 bg-[#131316] p-1">{hits.map((p) => <button key={p.name} onClick={() => go(p)} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10">{p.name}</button>)}</div>}
        </div>
        <datalist id="mplaces">{PLACES.map((p) => <option key={p.name} value={p.name} />)}</datalist>
        <div className="mt-3 space-y-2">
          <LocationSearch id="ms" label="Starting point" value={start} placeholder="Search starting address or place" onChange={(v) => { setStart(v); setStartPoint(null); }} onSelect={(p) => { setStartPoint(p); setStart(p.name); setFocus({ pos: [p.lat, p.lng], zoom: 13, key: Date.now() }); }} />
          <LocationSearch id="me" label="Destination" value={end} placeholder="Search destination address or place" onChange={(v) => { setEnd(v); setEndPoint(null); }} onSelect={(p) => { setEndPoint(p); setEnd(p.name); setFocus({ pos: [p.lat, p.lng], zoom: 13, key: Date.now() }); }} />
          <div className="grid grid-cols-2 gap-2">
            <button className={`btn-ghost btn-sm ${pickMode === 'start' ? 'border-accent text-accent' : ''}`} onClick={() => setPickMode('start')}>Pick start on map</button>
            <button className={`btn-ghost btn-sm ${pickMode === 'end' ? 'border-accent text-accent' : ''}`} onClick={() => setPickMode('end')}>Pick destination</button>
          </div>
          <div className="text-[11px] text-muted">Map selection mode: <b>{pickMode === 'start' ? 'Starting point' : 'Destination'}</b>. Click anywhere on the map.</div>

        </div>
        <div className="mt-3"><label className="label" htmlFor="mt">Time</label><input id="mt" type="time" className="input" value={departure} onChange={(e) => setDeparture(e.target.value)} /></div>
        <div className="mt-4"><div className="label">Safety preference</div><SafetySlider value={pref} onChange={setPref} /></div>
        <button onClick={generate} disabled={generating} className="btn-accent mt-4 w-full">{generating ? 'Scoring routes…' : 'Show routes'}</button>
        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="mb-2 flex items-center justify-between"><div className="text-xs font-semibold">Nearby real-world data</div><button className="text-[10px] text-accent" onClick={() => conditionPoint && fetchAreaConditions(conditionPoint.lat, conditionPoint.lng).then(setConditions)}>Refresh</button></div>
          {conditionsLoading && <p className="text-xs text-muted">Loading OpenStreetMap data…</p>}
          {!conditionsLoading && !conditions && <p className="text-xs text-muted">{conditionPoint ? 'Could not load mapped data. Check that the backend is running, then refresh.' : 'Choose a start or destination to load nearby mapped features.'}</p>}
          {conditions && <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white/5 p-2"><div className="text-muted">Mapped streetlights</div><b>{conditions.lighting?.mappedStreetlights ?? '—'}</b></div>
            <div className="rounded-lg bg-white/5 p-2"><div className="text-muted">Police / hospitals</div><b>{conditions.emergency?.police ?? 0} / {conditions.emergency?.hospitals ?? 0}</b><div className="text-[10px] text-muted">Clinics {conditions.emergency?.clinics ?? 0} · Fire {conditions.emergency?.fireStations ?? 0}</div></div>
            <div className="rounded-lg bg-white/5 p-2"><div className="text-muted">Activity indicators</div><b>{conditions.publicActivity?.mappedVenuesAndTransit ?? '—'} mapped places</b></div>
            <div className="rounded-lg bg-white/5 p-2"><div className="text-muted">Road surface tags</div><b>{conditions.roads?.mappedRoadSegmentsWithSurface ?? '—'} segments</b></div>
            <div className="col-span-2 rounded-lg bg-white/5 p-2"><div className="text-muted">Live traffic</div><b>{conditions.traffic?.status === 'available' ? `${conditions.traffic.currentSpeed ?? '—'} km/h current · ${conditions.traffic.freeFlowSpeed ?? '—'} km/h free flow` : conditions.traffic?.status === 'not_configured' ? 'Not configured' : 'Unavailable'}</b></div>
            <div className="col-span-2 rounded-lg border border-amber-400/20 bg-amber-400/5 p-2 text-[10px] leading-relaxed text-amber-200">Incidents: {conditions.incidentData?.note} {conditions.limitations}</div>
            <div className="col-span-2 text-[10px] text-muted">Source: {conditions.source}. {conditions.publicActivity?.note} {conditions.roads?.note}</div>
          </div>}
        </div>
        {selected?.steps?.length > 0 && <div className="mt-4 border-t border-white/10 pt-3"><div className="mb-2 text-xs font-semibold">Turn-by-turn directions · {selected.dist} km</div><ol className="max-h-44 space-y-2 overflow-y-auto pr-1">{selected.steps.map((step, i) => <li key={i} className="flex gap-2 text-xs"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10">{i + 1}</span><span>{step.instruction}<span className="block text-[10px] text-muted">{step.name ? `${step.name} · ` : ''}{step.distance} m</span></span></li>)}</ol></div>}
      </div>

      {/* legend */}
      <div className={`${legend ? 'block' : 'hidden'} absolute bottom-14 left-3 right-3 z-[500] rounded-2xl border border-white/10 bg-[#0F0F11]/90 p-4 backdrop-blur-xl md:bottom-auto md:left-auto md:right-3 md:top-16 md:block md:w-[210px]`}>
        <div className="mb-2 text-xs font-medium text-muted">Legend · tap to show or hide</div>
        <div className="space-y-1">
          {Object.entries(POI_META).map(([k, m]) => (
            <label key={k} className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-[13px] hover:bg-white/5">
              <span className="flex items-center gap-2"><input type="checkbox" checked={types[k]} onChange={() => setTypes({ ...types, [k]: !types[k] })} className="h-3.5 w-3.5" style={{ accentColor: m.color }} /><span aria-hidden>{m.emoji}</span>{m.label}</span>
              <span className="text-[11px] tabular-nums text-muted">{counts[k] || 0}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 border-t border-white/10 pt-2 text-[11px] text-muted">Click a marker for details. Routes: click to select.</div>
      </div>
    </div>
  );
}
