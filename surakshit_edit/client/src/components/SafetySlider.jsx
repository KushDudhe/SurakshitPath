const PRESETS = [{ label: 'FAST', v: 30 }, { label: 'BALANCED', v: 70 }, { label: 'SAFETY', v: 92 }];
const which = (v) => (v < 53 ? 'FAST' : v <= 77 ? 'BALANCED' : 'SAFETY');

export default function SafetySlider({ value, onChange }) {
  const active = which(value);
  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-1.5">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => onChange(p.v)} className={`rounded-lg border py-1.5 text-[11px] font-medium tracking-wider transition ${active === p.label ? 'border-accent/50 bg-accent/10 text-white' : 'border-white/10 text-muted hover:text-white'}`}>{p.label}</button>
        ))}
      </div>
      <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(+e.target.value)} className="sp-range" style={{ '--v': `${value}%` }} aria-label="Safety versus travel time" />
      <div className="mt-2 flex justify-between text-[11px] text-muted"><span>Travel Time</span><span className="hidden sm:inline">←────────●────────→</span><span>Safety Factors</span></div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-white/10 bg-white/[.03] p-3"><div className="text-[11px] text-muted">Travel Time Priority</div><div className="text-lg font-semibold tabular-nums">{100 - value}%</div></div>
        <div className="rounded-xl border border-accent/30 bg-accent/[.06] p-3"><div className="text-[11px] text-muted">Safety Priority</div><div className="text-lg font-semibold tabular-nums text-accent">{value}%</div></div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">You decide the trade-off. Routes are ranked by {value}% safety factors and {100 - value}% travel time.</p>
    </div>
  );
}
