import DashboardContent from '../components/DashCards';
import { DashHeader } from '../components/DashboardMockup';
import { useApp } from '../state/AppContext';
import { Play } from 'lucide-react';

export default function Dashboard() {
  const { loadDemo } = useApp();
  return (
    <div>
      <div className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0D]/80"><DashHeader /></div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1><p className="text-sm text-muted">Your night journey at a glance. All conditions are DEMO DATA.</p></div>
        <button onClick={() => loadDemo(false)} className="btn-ghost btn-sm"><Play className="h-3.5 w-3.5" />Launch Demo</button>
      </div>
      <DashboardContent />
    </div>
  );
}
