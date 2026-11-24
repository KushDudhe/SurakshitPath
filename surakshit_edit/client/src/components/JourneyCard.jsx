import { ArrowRight, Clock } from 'lucide-react';
import { scoreTone } from '../lib/scoring';

export default function JourneyCard({ j }) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-center justify-between">
        <span className={`chip ${j.status === 'Completed' ? '!text-accent' : ''}`}>{j.status}</span>
        <span className="text-xs text-muted">{j.date} · {j.time}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight">{j.from}<ArrowRight className="h-4 w-4 text-accent" />{j.to}</div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted"><Clock className="h-3.5 w-3.5" />{j.duration} min</span>
        {j.score != null && <span className="font-semibold tabular-nums" style={{ color: scoreTone(j.score) }}>{j.score}<span className="text-xs font-normal text-muted">/100</span></span>}
      </div>
    </div>
  );
}
