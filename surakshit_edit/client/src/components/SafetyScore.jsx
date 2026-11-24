import { Info } from 'lucide-react';
import { useCountUp, useInView } from '../lib/hooks';
import { riskLabel } from '../lib/scoring';
import ScoreBreakdown from './ScoreBreakdown';
import Bar from './Bar';

export default function SafetyScore({ route }) {
  const [ref, inView] = useInView();
  const n = useCountUp(route.score ?? 0, inView);
  return (
    <div ref={ref} className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium">Safety Score</h3>
          <p className="text-xs text-muted">Route {route.id} · {route.tag}</p>
        </div>
        <span className="chip">Estimated risk: {riskLabel(route.score)}</span>
      </div>
      {route.score == null ? (
        <div className="my-5 rounded-xl border border-dashed border-white/15 p-4 text-sm text-muted"><span className="font-medium text-white">Limited data available.</span> There is not enough information to score this route. That is not the same as unsafe.</div>
      ) : (
        <div className="my-4 flex items-baseline gap-2">
          <span className="text-6xl font-semibold tracking-tight tabular-nums">{n}</span>
          <span className="text-xl text-muted">/ 100</span>
        </div>
      )}
      <div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-muted">Data Confidence</span><span className="font-medium tabular-nums">{route.confidence}%</span></div>
      <Bar value={route.confidence} color="#00C3C9" />
      {route.limited && route.score != null && (
        <div className="mt-3 flex gap-2 rounded-lg bg-amber-400/10 p-2.5 text-[12px] text-amber-200"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />Limited data available for parts of this route. The score is shown with reduced certainty.</div>
      )}
      <div className="my-5 h-px bg-white/10" />
      <ScoreBreakdown route={route} />
    </div>
  );
}
