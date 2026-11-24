import { Link } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import PageHeader from './PageHeader';
import MapView from '../components/MapView';
import RouteCard from '../components/RouteCard';
import SafetySlider from '../components/SafetySlider';
import { useApp } from '../state/AppContext';
import { findPlace } from '../lib/data';
import LocationSearch from '../components/LocationSearch';
import { ROUTE_COLORS } from '../lib/poi';

const PREFS = [
  ['lighting', 'Prefer well-lit roads'], ['activity', 'Prefer active/public areas'], ['transport', 'Prefer public transport'],
  ['help', 'Prefer verified help points'], ['incidents', 'Avoid recent incidents'], ['road', 'Avoid road closures'],
];

export default function Plan() {
  const { start, setStart, end, setEnd, startPoint, setStartPoint, endPoint, setEndPoint, departure, setDeparture, pref, setPref, prefs, setPrefs, view, selectedId, selectRoute, planned, planKey, generate, generating, journey } = useApp();
  return (
    <div>
      <PageHeader title="Plan Route" sub="Set your journey, choose what matters, and compare route options." />
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="card space-y-5 p-5">
          <LocationSearch id="s" label="Start location" value={start} placeholder="Search starting address or place" onChange={(v) => { setStart(v); setStartPoint(null); }} onSelect={(p) => { setStart(p.name); setStartPoint(p); }} />
          <LocationSearch id="d" label="Destination" value={end} placeholder="Search destination address or place" onChange={(v) => { setEnd(v); setEndPoint(null); }} onSelect={(p) => { setEnd(p.name); setEndPoint(p); }} />
          <div><label className="label" htmlFor="t">Departure time</label><input id="t" type="time" className="input" value={departure} onChange={(e) => setDeparture(e.target.value)} /></div>
          <div><div className="label">Safety preference</div><SafetySlider value={pref} onChange={setPref} /></div>
          <fieldset>
            <legend className="label">Preferences</legend>
            <div className="space-y-2">
              {PREFS.map(([k, l]) => (
                <label key={k} className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1 text-[13px] text-white/90">
                  <input type="checkbox" checked={!!prefs[k]} onChange={(e) => setPrefs({ ...prefs, [k]: e.target.checked })} className="h-4 w-4 rounded border-white/20 bg-transparent accent-[#00C3C9]" />{l}
                </label>
              ))}
            </div>
          </fieldset>
          <button onClick={generate} disabled={generating} className="btn-accent w-full py-3">{generating ? <><Loader2 className="h-4 w-4 animate-spin" />Analysing conditions…</> : <><Sparkles className="h-4 w-4" />Generate Routes</>}</button>
          <p className="text-[11px] leading-relaxed text-muted">Search any address or place and select a result from the suggestions. Real road routes require a working routing API connection.</p>
        </div>

        <div className="space-y-4">
          <div className="card relative overflow-hidden">
            <MapView routes={planned ? view.list : []} selectedId={selectedId} onSelect={selectRoute} start={startPoint || findPlace(start)} end={endPoint || findPlace(end)} journey={journey} fitKey={`p-${planKey}-${planned}-${start}-${end}`} height={520} className="min-h-[340px]" />
            {planned && <div className="absolute left-3 top-3 z-[450] flex flex-wrap gap-2 rounded-xl border border-white/10 bg-[#09090B]/90 p-2 shadow-xl backdrop-blur">{view.list.map((r) => <button key={r.id} onClick={() => selectRoute(r.id)} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition ${r.id === selectedId ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10'}`}><span className="h-2.5 w-2.5 rounded-full" style={{ background: ROUTE_COLORS[r.id] || '#3B82F6' }} />Route {r.id} · {r.time} min</button>)}</div>}
            {!planned && !generating && (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-white/10 bg-[#09090B]/85 p-4 text-sm text-muted backdrop-blur-xl">Choose your locations and press <span className="text-white">Generate Routes</span> to see three options.</div>
            )}
            {generating && <div className="absolute inset-0 z-[500] grid place-items-center bg-black/50 backdrop-blur-[2px]"><span className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0F0F11] px-4 py-2 text-sm"><Loader2 className="h-4 w-4 animate-spin text-accent" />Scoring routes…</span></div>}
          </div>
          {planned && (
            <div key={planKey}>
              {view.list.some((r) => r.limited) && <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-400/[.06] p-3 text-[13px] text-amber-100">Limited data available for this journey. Scores are shown with reduced certainty. That does not mean the route is unsafe.</div>}
              <div className="grid gap-3 md:grid-cols-3">
                {view.list.map((r, i) => <RouteCard key={r.id} route={r} animate delay={i * 160} selected={r.id === selectedId} recommended={r.id === view.recommendedId} onSelect={selectRoute} />)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2"><Link to="/compare" className="btn-ghost btn-sm">Compare routes</Link><Link to="/dashboard" className="btn-primary btn-sm">Open in dashboard</Link></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
