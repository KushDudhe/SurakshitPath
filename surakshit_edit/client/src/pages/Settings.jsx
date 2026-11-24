import PageHeader from './PageHeader';
import { useApp } from '../state/AppContext';
import { DEFAULT_WEIGHTS, FACTORS } from '../lib/scoring';

export default function Settings() {
  const { weights, setWeights, view, pushAlert } = useApp();
  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const reset = () => { try { Object.keys(localStorage).filter((k) => k.startsWith('sp_')).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ } location.reload(); };
  return (
    <div>
      <PageHeader title="Settings" sub="Adjust how much each factor counts. Weights are normalised to 100%." />
      <div className="card max-w-2xl p-6">
        <div className="space-y-5">
          {FACTORS.map((f) => (
            <div key={f.key}>
              <div className="mb-2 flex justify-between text-sm"><label htmlFor={f.key}>{f.label}</label><span className="tabular-nums text-accent">{Math.round((weights[f.key] / total) * 100)}%</span></div>
              <input id={f.key} type="range" min="0" max="40" value={weights[f.key]} onChange={(e) => setWeights({ ...weights, [f.key]: +e.target.value })} className="sp-range" style={{ '--v': `${(weights[f.key] / 40) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setWeights(DEFAULT_WEIGHTS)} className="btn-ghost btn-sm">Reset to defaults</button>
          <button onClick={reset} className="btn-ghost btn-sm">Clear saved data on this device</button>
        </div>
        {view.lateNight && <p className="mt-4 text-xs text-muted">Late-night calibration is active for your departure time.</p>}
      </div>
    </div>
  );
}
