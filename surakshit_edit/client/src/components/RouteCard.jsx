import { ArrowRight, Star } from 'lucide-react';
import { riskLabel, scoreTone } from '../lib/scoring';
import Bar from './Bar';

export default function RouteCard({ route, selected, recommended, onSelect, delay = 0, animate = false }) {
  const changedScore = route.changed && route.baseScore !== route.score;
  const changedTime = route.changed && route.baseTime !== route.time;
  return (
    <button onClick={() => onSelect(route.id)} aria-pressed={selected} style={animate ? { animationDelay: `${delay}ms` } : undefined}
      className={`card card-hover w-full p-4 text-left ${animate ? 'fade-up' : ''} ${selected ? '!border-accent/60 bg-accent/[.06] shadow-[0_0_40px_-16px_rgba(0,195,201,.7)]' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-[.14em] text-muted">ROUTE {route.id}</span>
        {recommended && <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent"><Star className="h-2.5 w-2.5" />Recommended</span>}
      </div>
      <div className="mt-1 text-sm font-medium">{route.tag}</div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold tabular-nums">
            {changedTime && <span className="mr-1.5 text-sm font-normal text-muted line-through">{route.baseTime}</span>}{route.time}<span className="ml-1 text-sm font-normal text-muted">min</span>
          </div>
          <div className="text-xs text-muted">{route.dist} km</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted">Safety</div>
          {route.score == null ? <div className="text-sm font-medium">Limited data</div> : (
            <div className="text-xl font-semibold tabular-nums" style={{ color: scoreTone(route.score) }}>
              {changedScore && <span className="mr-1 text-xs font-normal text-muted line-through">{route.baseScore}</span>}{route.score}<span className="text-xs font-normal text-muted">/100</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3"><Bar value={route.score ?? 0} known={route.score != null} /></div>
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted">
        <span>Estimated risk: <span className="text-white/80">{riskLabel(route.score)}</span></span>
        {changedScore && <span className="inline-flex items-center gap-1 text-amber-300">updated <ArrowRight className="h-3 w-3" /></span>}
      </div>
    </button>
  );
}
