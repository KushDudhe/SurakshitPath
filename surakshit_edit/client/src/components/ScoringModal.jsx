import Modal from './Modal';
import { useApp } from '../state/AppContext';
import { FACTORS, DEFAULT_WEIGHTS, MIN_COVERAGE } from '../lib/scoring';

export default function ScoringModal() {
  const { scoringOpen, setScoringOpen, selected, view } = useApp();
  return (
    <Modal open={scoringOpen} onClose={() => setScoringOpen(false)} title="How scoring works" wide>
      <h3 className="text-xl font-semibold tracking-tight">How scoring works</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">Every route gets a 0–100 estimate built from six route-level factors. Higher means conditions look better right now. The formula is simple on purpose, so you can check it.</p>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[.03] p-3 font-mono text-[12px] text-accent">Safety Score = Σ (factor score × weight) ÷ Σ (weights of factors with enough data)</div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-[13px]">
          <thead className="text-xs text-muted"><tr><th className="pb-2 font-medium">Factor</th><th className="pb-2 font-medium">Default weight</th><th className="pb-2 font-medium">Now (Route {selected.id})</th><th className="pb-2 text-right font-medium">Contributes</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {FACTORS.map((f, i) => { const r = selected.rows[i]; return (
              <tr key={f.key}><td className="py-2">{f.label}</td><td className="py-2 tabular-nums text-muted">{DEFAULT_WEIGHTS[f.key]}%</td><td className="py-2 tabular-nums">{r.known ? r.value : 'Limited data'} <span className="text-muted">× {Math.round(view.weights[f.key] * 100)}%</span></td><td className="py-2 text-right tabular-nums">{r.known ? r.points.toFixed(1) : '—'}</td></tr>
            ); })}
          </tbody>
        </table>
      </div>
      <ul className="mt-5 space-y-2 text-[13px] leading-relaxed text-muted">
        <li><span className="text-white">Data confidence</span> is the weighted share of data we actually have for the route. A low confidence lowers certainty, not the score.</li>
        <li><span className="text-white">Limited data:</span> a factor with less than {Math.round(MIN_COVERAGE * 100)}% coverage is left out and the remaining weights are rescaled. Missing data is never treated as “unsafe”.</li>
        <li><span className="text-white">Preferences and time of night</span> re-weight factors. After 11 PM, lighting and public activity count for more.</li>
        <li><span className="text-white">Context, not labels:</span> scores describe a route right now. No neighbourhood is permanently marked unsafe.</li>
      </ul>
      <p className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-muted">Scores are estimates from demo data and are not guarantees of safety.</p>
    </Modal>
  );
}
