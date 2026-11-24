import { useState } from 'react';
import { AlertTriangle, Check, ChevronDown } from 'lucide-react';
import { useApp } from '../state/AppContext';

export default function WhyScore({ route }) {
  const { setScoringOpen } = useApp();
  const [open, setOpen] = useState(true);
  const f = route.f, k = (key) => route.rows.find((r) => r.key === key)?.known;
  const good = [];
  if (k('lighting') && f.lighting >= 80) good.push('Strong lighting coverage');
  if (k('activity') && f.activity >= 70) good.push('Multiple active public locations');
  if (k('help') && f.help >= 75) good.push('Verified help points nearby');
  if (k('transport') && f.transport >= 65) good.push('Public transport available');
  if (k('road') && f.road >= 80) good.push('Road conditions are normal');
  const inc = route.pois.filter((p) => p.type === 'incident').length;
  const warn = [];
  if (route.changed && f.road < 40) warn.push('Road closure detected ahead – reroute suggested');
  if (inc > 0) warn.push(`Recent reports detected near ${inc === 1 ? 'one segment' : `${inc} segments`}`);
  if (k('lighting') && f.lighting < 60) warn.push('Lighting coverage is limited on parts of this route');
  if (route.unknown.length) warn.push(`Limited data available for: ${route.unknown.join(', ')}`);
  return (
    <div className="card p-5">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between text-left">
        <span className="text-sm font-medium">Why this route received this score</span>
        <ChevronDown className={`h-4 w-4 text-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <ul className="mt-4 space-y-2">
            {good.map((g) => <li key={g} className="flex items-center gap-2 text-[13px]"><Check className="h-4 w-4 text-accent" />{g}</li>)}
            {warn.map((w) => <li key={w} className="flex items-start gap-2 text-[13px] text-amber-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{w}</li>)}
          </ul>
          <p className="mt-4 text-xs text-muted">Score calculated from route-level conditions.</p>
          <button onClick={() => setScoringOpen(true)} className="mt-2 text-[13px] text-accent transition hover:underline">How scoring works →</button>
        </div>
      </div>
    </div>
  );
}
