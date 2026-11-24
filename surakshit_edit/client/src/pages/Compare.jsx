import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from './PageHeader';
import { useApp } from '../state/AppContext';
import { FACTORS } from '../lib/scoring';
import { ROUTE_COLORS } from '../lib/poi';

const tip = { contentStyle: { background: '#131316', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, fontSize: 12 }, cursor: { fill: 'rgba(255,255,255,.04)' }, labelStyle: { color: '#fff' } };
const axis = { stroke: '#969696', fontSize: 12, tickLine: false, axisLine: false };

export default function Compare() {
  const { view, selectedId, selectRoute } = useApp();
  const L = view.list;
  const inc = (r) => r.pois.filter((p) => p.type === 'incident').length;
  const best = (fn, min = false) => { const vals = L.map(fn).filter((v) => v != null); const t = min ? Math.min(...vals) : Math.max(...vals); return (r) => fn(r) === t; };
  const rows = [
    ['Travel Time', (r) => `${r.time} min`, best((r) => r.time, true), (r) => r.time],
    ['Distance', (r) => `${r.dist} km`, best((r) => r.dist, true)],
    ['Safety Score', (r) => (r.score == null ? 'Limited data' : `${r.score}/100`), best((r) => r.score)],
    ['Data Confidence', (r) => `${r.confidence}%`, best((r) => r.confidence)],
    ...FACTORS.filter((f) => f.key !== 'incidents' && f.key !== 'road').map((f) => [f.label, (r) => (r.rows.find((x) => x.key === f.key).known ? Math.round(r.f[f.key]) : 'Limited data'), best((r) => Math.round(r.f[f.key]))]),
    ['Recent Incidents', (r) => `${inc(r)} reports (${Math.round(r.f.incidents)})`, best(inc, true)],
    ['Road Conditions', (r) => `${r.f.road >= 70 ? 'Normal' : r.f.road >= 40 ? 'Slow' : 'Closure'} (${Math.round(r.f.road)})`, best((r) => Math.round(r.f.road))],
  ];
  const scoreData = L.map((r) => ({ name: `Route ${r.id}`, id: r.id, score: r.score ?? 0 }));
  const factorData = FACTORS.map((f) => ({ name: f.label.replace('Public ', '').replace('Recent ', '').replace(' Points', ''), ...Object.fromEntries(L.map((r) => [`Route ${r.id}`, Math.round(r.f[f.key])])) }));

  return (
    <div>
      <PageHeader title="Compare Routes" sub="Every factor side by side. Best value in each row is highlighted." />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-muted">
              <th className="p-4 font-medium">Factor</th>
              {L.map((r) => <th key={r.id} className="p-4 font-medium"><button onClick={() => selectRoute(r.id)} className={`rounded-full px-2.5 py-1 ${r.id === selectedId ? 'bg-accent/15 text-accent' : 'hover:text-white'}`}>Route {r.id} · {r.tag}{r.id === view.recommendedId ? ' ★' : ''}</button></th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map(([label, fmt, isBest]) => (
              <tr key={label}><td className="p-4 text-muted">{label}</td>{L.map((r) => <td key={r.id} className={`p-4 tabular-nums ${isBest(r) ? 'font-semibold text-accent' : ''}`}>{fmt(r)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">Values in brackets are factor scores (higher is better). ★ = recommended for your current time/safety preference. DEMO DATA.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-medium">Safety score comparison</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreData} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="name" {...axis} /><YAxis domain={[0, 100]} {...axis} /><Tooltip {...tip} />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>{scoreData.map((d) => <Cell key={d.id} fill={ROUTE_COLORS[d.id]} fillOpacity={d.id === selectedId ? 1 : 0.55} />)}</Bar>
            </BarChart>
          </ResponsiveContainer></div>
        </div>
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-medium">Factor comparison</h3>
          <div className="overflow-x-auto"><div className="h-64 min-w-[520px]"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={factorData} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="name" {...axis} /><YAxis domain={[0, 100]} {...axis} /><Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12, color: '#969696' }} />
              {L.map((r) => <Bar key={r.id} dataKey={`Route ${r.id}`} fill={ROUTE_COLORS[r.id]} radius={[4, 4, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer></div></div>
        </div>
      </div>
    </div>
  );
}
