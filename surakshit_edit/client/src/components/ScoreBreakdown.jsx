import Bar from './Bar';

export default function ScoreBreakdown({ route }) {
  return (
    <div className="space-y-3">
      {route.rows.map((r, i) => (
        <div key={r.key}>
          <div className="mb-1.5 flex items-center justify-between text-[13px]">
            <span className="text-white/90">{r.label} <span className="text-[11px] text-muted">· {Math.round(r.weight * 100)}% weight</span></span>
            {r.known ? <span className="font-medium tabular-nums">{r.value}</span> : <span className="text-[11px] text-muted">Limited data</span>}
          </div>
          <Bar value={r.value} known={r.known} delay={i * 80} />
        </div>
      ))}
    </div>
  );
}
