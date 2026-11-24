import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from './PageHeader';
import { useApp } from '../state/AppContext';
import { useCountUp, useInView } from '../lib/hooks';

const tip = { contentStyle: { background: '#131316', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, fontSize: 12 }, cursor: { stroke: 'rgba(255,255,255,.1)' }, labelStyle: { color: '#fff' } };
const axis = { stroke: '#969696', fontSize: 12, tickLine: false, axisLine: false };
const SAFETY = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'].map((w, i) => ({ w, score: [76, 79, 78, 82, 81, 85, 83, 86][i] }));
const PREF = [{ name: 'Fast', v: 18, c: '#0E5A5D' }, { name: 'Balanced', v: 52, c: '#00C3C9' }, { name: 'Safety', v: 30, c: '#7DE3E7' }];
const INC = [{ n: 'Lighting', v: 14 }, { n: 'Suspicious', v: 9 }, { n: 'Closure', v: 6 }, { n: 'Construction', v: 5 }, { n: 'Accident', v: 4 }, { n: 'Transport', v: 3 }];
const DUR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ d, m: [22, 19, 24, 21, 27, 31, 18][i] }));

function Stat({ label, value }) {
  const [ref, inView] = useInView();
  const n = useCountUp(value, inView);
  return <div ref={ref} className="card card-hover p-5"><div className="text-xs text-muted">{label}</div><div className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">{n}</div></div>;
}
const Chart = ({ title, children }) => <div className="card p-5"><h3 className="mb-4 text-sm font-medium">{title}</h3><div className="h-56">{children}</div></div>;

export default function Analytics() {
  const { stats } = useApp();
  return (
    <div>
      <PageHeader title="Analytics" sub="Your usage at a glance. Trend charts use DEMO DATA." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Routes Planned" value={stats.planned} /><Stat label="Journeys Completed" value={stats.completed} /><Stat label="Safety Checks" value={stats.checks} /><Stat label="Reports Submitted" value={stats.reports} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Chart title="Safety score over time"><ResponsiveContainer><AreaChart data={SAFETY} margin={{ left: -20, right: 8, top: 8 }}>
          <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00C3C9" stopOpacity={0.35} /><stop offset="100%" stopColor="#00C3C9" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="w" {...axis} /><YAxis domain={[60, 100]} {...axis} /><Tooltip {...tip} />
          <Area type="monotone" dataKey="score" stroke="#00C3C9" strokeWidth={2} fill="url(#g)" />
        </AreaChart></ResponsiveContainer></Chart>
        <Chart title="Route preference"><div className="flex h-full items-center gap-6">
          <div className="h-full flex-1"><ResponsiveContainer><PieChart><Pie data={PREF} dataKey="v" nameKey="name" innerRadius="60%" outerRadius="90%" stroke="#0F0F11" strokeWidth={3}>{PREF.map((p) => <Cell key={p.name} fill={p.c} />)}</Pie><Tooltip {...tip} /></PieChart></ResponsiveContainer></div>
          <ul className="space-y-2 text-sm">{PREF.map((p) => <li key={p.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.c }} />{p.name}<span className="text-muted">{p.v}%</span></li>)}</ul>
        </div></Chart>
        <Chart title="Incident categories reported"><ResponsiveContainer><BarChart data={INC} layout="vertical" margin={{ left: 20, right: 8 }}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" horizontal={false} /><XAxis type="number" {...axis} /><YAxis type="category" dataKey="n" {...axis} width={80} /><Tooltip {...tip} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
          <Bar dataKey="v" fill="#00C3C9" radius={[0, 6, 6, 0]} />
        </BarChart></ResponsiveContainer></Chart>
        <Chart title="Journey duration (min)"><ResponsiveContainer><LineChart data={DUR} margin={{ left: -20, right: 8, top: 8 }}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="d" {...axis} /><YAxis {...axis} /><Tooltip {...tip} />
          <Line type="monotone" dataKey="m" stroke="#7DE3E7" strokeWidth={2} dot={{ r: 3, fill: '#00C3C9', strokeWidth: 0 }} />
        </LineChart></ResponsiveContainer></Chart>
      </div>
    </div>
  );
}
