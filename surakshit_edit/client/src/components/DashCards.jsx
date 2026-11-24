import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Loader2, MapPin, Play, RotateCcw, Radio, ShieldCheck, Square, Users, Share2 } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { fmtTime } from '../lib/util';
import { findPlace } from '../lib/data';
import { riskLabel } from '../lib/scoring';
import Bar from './Bar';
import MapView from './MapView';
import RouteCard from './RouteCard';
import SafetySlider from './SafetySlider';
import SafetyScore from './SafetyScore';
import WhyScore from './WhyScore';
import TrustedContactCard from './TrustedContactCard';

export function CurrentJourneyCard() {
  const { start, end, departure, selected, journey, startJourney, finishJourney } = useApp();
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Current Journey</h3>
        <span className={`chip ${journey.active ? '!border-accent/40 !text-accent' : ''}`}><span className={`h-1.5 w-1.5 rounded-full ${journey.active ? 'bg-accent' : 'bg-white/40'}`} />{journey.active ? 'Journey active' : 'Ready to start'}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight">{start}<ArrowRight className="h-5 w-5 text-accent" />{end}</div>
      <p className="mt-1 text-xs text-muted">Route {selected.id} · {selected.tag}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Departure', fmtTime(departure)], ['Estimated', `${selected.time} min`], ['Distance', `${selected.dist} km`], ['Safety Score', selected.score == null ? 'Limited data' : `${selected.score}/100`]].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-white/10 bg-white/[.03] p-3"><div className="text-[11px] text-muted">{l}</div><div className="mt-0.5 text-[15px] font-semibold tabular-nums">{v}</div></div>
        ))}
      </div>
      {journey.active
        ? <button onClick={() => finishJourney('Cancelled')} className="btn-ghost mt-5 w-full"><Square className="h-3.5 w-3.5" />End journey</button>
        : <button onClick={startJourney} className="btn-accent mt-5 w-full"><Play className="h-3.5 w-3.5" />Start Journey</button>}
    </div>
  );
}

export function LiveConditionsCard() {
  const { selected: r } = useApp();
  const known = (k) => r.rows.find((x) => x.key === k)?.known;
  const inc = r.pois.filter((p) => p.type === 'incident').length;
  const road = !known('road') ? 'Limited data' : r.f.road >= 70 ? 'Normal' : r.f.road >= 40 ? 'Slow' : 'Closure ahead';
  const Row = ({ label, children }) => <div className="flex items-center justify-between gap-3 py-2 text-[13px]"><span className="text-muted">{label}</span>{children}</div>;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between"><h3 className="text-sm font-medium">Live Safety Conditions</h3><span className="chip">Route {r.id}</span></div>
      <div className="mt-3 divide-y divide-white/5">
        {[['Lighting', 'lighting'], ['Public Activity', 'activity']].map(([l, k]) => (
          <div key={k} className="py-2.5"><div className="mb-1.5 flex justify-between text-[13px]"><span className="text-muted">{l}</span><span className="font-medium tabular-nums">{known(k) ? `${Math.round(r.f[k])}%` : 'Limited data'}</span></div><Bar value={Math.round(r.f[k])} known={known(k)} /></div>
        ))}
        <Row label="Transport"><span className="font-medium">{!known('transport') ? 'Limited data' : r.f.transport >= 50 ? 'Available' : 'Limited'}</span></Row>
        <Row label="Recent Incidents"><span className="font-medium tabular-nums">{inc}</span></Row>
        <Row label="Road Condition"><span className={`font-medium ${road === 'Closure ahead' ? 'text-amber-300' : ''}`}>{road}</span></Row>
      </div>
      <p className="mt-2 text-[10px] tracking-widest text-white/30">DEMO DATA</p>
    </div>
  );
}

export function RouteIntelligenceCard() {
  const { view, selectedId, selectRoute, pref, setPref } = useApp();
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><h3 className="text-base font-semibold">Route Intelligence</h3><p className="mt-0.5 text-[13px] text-muted">Compare available routes based on current conditions.</p></div>
        <Link to="/compare" className="text-[13px] text-accent hover:underline">Compare in detail →</Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {view.list.map((r) => <RouteCard key={r.id} route={r} selected={r.id === selectedId} recommended={r.id === view.recommendedId} onSelect={selectRoute} />)}
      </div>
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[.02] p-4">
        <h4 className="mb-3 text-sm font-medium">Route Preference</h4>
        <SafetySlider value={pref} onChange={setPref} />
      </div>
    </div>
  );
}

export function MapCard({ height = 380 }) {
  const { view, selectedId, selectRoute, start, end, journey, planKey } = useApp();
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pb-3 pt-4"><h3 className="text-sm font-medium">Route Map</h3><span className="chip">DEMO DATA</span></div>
      <MapView routes={view.list} selectedId={selectedId} onSelect={selectRoute} start={findPlace(start)} end={findPlace(end)} journey={journey} fitKey={`d-${planKey}-${start}-${end}`} height={height} />
    </div>
  );
}

export function LiveSimCard() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Live Conditions</h3>
        <span className="chip"><span className="dot-live h-1.5 w-1.5 rounded-full bg-accent" />Monitoring route conditions</span>
      </div>
      <p className="mt-2 text-[13px] text-muted">
        No live alerts right now. Road closures and incidents on your route will appear here.
      </p>
    </div>
  );
}

export function SafetyCheckCard() {
  const { journey, selected, end, start, triggerSafetyCheck, startJourney, finishJourney } = useApp();
  const eta = Math.max(0, Math.round(selected.time * (1 - journey.progress)));
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between"><h3 className="text-sm font-medium">Journey Safety Check</h3><ShieldCheck className="h-4 w-4 text-accent" /></div>
      {journey.active ? (
        <>
          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-accent"><span className="dot-live h-2 w-2 rounded-full bg-accent" />Journey Active</div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
            <div><div className="text-[11px] text-muted">Current location</div><div className="font-medium">{journey.progress < 0.08 ? start : 'En route'}</div></div>
            <div><div className="text-[11px] text-muted">Destination</div><div className="font-medium">{end}</div></div>
            <div><div className="text-[11px] text-muted">ETA</div><div className="font-medium tabular-nums">{eta} min</div></div>
          </div>
          <div className="mt-3"><Bar value={Math.round(journey.progress * 100)} color="#00C3C9" /></div>
        </>
      ) : (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/15 p-3 text-[13px] text-muted">
          <span>No active journey. Start one to enable live safety checks.</span>
          <button onClick={startJourney} className="btn-ghost btn-sm shrink-0"><Play className="h-3 w-3" />Start</button>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {journey.active && <button onClick={() => finishJourney('Cancelled')} className="btn-ghost btn-sm">End journey</button>}
      </div>
      {journey.log.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-white/10 pt-3 text-[12px] text-muted">
          {journey.log.slice(0, 3).map((l) => <li key={l.t + l.text}>• {l.text}</li>)}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-white/30">Prototype: nobody is contacted and no emergency service is called.</p>
    </div>
  );
}

export function TrustedContactsCard() {
  const { contacts, sharing, setSharing } = useApp();
  const nav = useNavigate();
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between"><h3 className="text-sm font-medium">Trusted Contacts</h3><Users className="h-4 w-4 text-accent" /></div>
      <div className="mt-3 space-y-2">{contacts.slice(0, 3).map((c) => <TrustedContactCard key={c.id} contact={c} compact />)}</div>
      <div className={`mt-3 flex items-center gap-2 text-[13px] ${sharing ? 'text-accent' : 'text-muted'}`}><MapPin className="h-3.5 w-3.5" />{sharing ? 'Journey sharing active' : 'Journey sharing paused'}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setSharing(!sharing)} className="btn-accent btn-sm"><Share2 className="h-3.5 w-3.5" />{sharing ? 'Stop sharing' : 'Share Journey'}</button>
        <button onClick={() => nav('/contacts')} className="btn-ghost btn-sm">Manage Contacts</button>
      </div>
    </div>
  );
}

export function PlanningSpinner() { return <Loader2 className="h-4 w-4 animate-spin" />; }

export default function DashboardContent() {
  const { selected, view } = useApp();
  return (
    <div className="space-y-4">
      {view.lateNight && <div className="rounded-xl border border-accent/30 bg-accent/[.06] p-3 text-[13px]">Late-night calibration is active: lighting and public activity carry more weight after 11 PM.</div>}
      <div className="grid gap-4 lg:grid-cols-2"><CurrentJourneyCard /><LiveConditionsCard /></div>
      <RouteIntelligenceCard />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <MapCard height={420} />
        <div className="space-y-4"><SafetyScore route={selected} /></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2"><WhyScore route={selected} /><LiveSimCard /></div>
      <div className="grid gap-4 lg:grid-cols-2"><SafetyCheckCard /><TrustedContactsCard /></div>
    </div>
  );
}
