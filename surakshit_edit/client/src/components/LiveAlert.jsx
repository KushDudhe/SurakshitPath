import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../state/AppContext';

export default function LiveAlert() {
  const { alerts, dismissAlert } = useApp();
  return (
    <div className="pointer-events-none fixed right-4 top-[84px] z-[90] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {alerts.map((a) => {
        const Icon = a.type === 'warning' ? AlertTriangle : a.type === 'success' ? CheckCircle2 : Info;
        const tone = a.type === 'warning' ? 'border-amber-400/40 text-amber-300' : a.type === 'success' ? 'border-accent/40 text-accent' : 'border-white/15 text-white';
        return (
          <div key={a.id} className={`slide-in pointer-events-auto flex gap-3 rounded-xl border bg-[#0F0F11]/95 p-3.5 shadow-2xl backdrop-blur-xl ${tone}`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1"><div className="text-sm font-medium text-white">{a.title}</div>{a.body && <div className="mt-0.5 text-xs text-muted">{a.body}</div>}</div>
            <button onClick={() => dismissAlert(a.id)} aria-label="Dismiss" className="h-fit rounded p-1 text-muted hover:text-white"><X className="h-3.5 w-3.5" /></button>
          </div>
        );
      })}
    </div>
  );
}
