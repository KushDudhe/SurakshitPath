import { Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import DashboardContent from './DashCards';
import { useApp } from '../state/AppContext';

export function DashHeader({ inner = true }) {
  const { user } = useApp();
  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
      <div className="text-[13px]"><span className="text-muted">SurakshitPath</span><span className="mx-2 text-white/20">/</span><span className="font-medium">Night Journey</span></div>
      <div className="flex items-center gap-3.5">
        <span className="hidden items-center gap-2 text-xs text-muted sm:flex"><span className="dot-live h-1.5 w-1.5 rounded-full bg-accent" />System Online</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 text-xs font-semibold text-accent">{(user?.name || 'D')[0].toUpperCase()}</span>
      </div>
    </div>
  );
}

export default function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-[1180px] px-4">
      <div className="pointer-events-none absolute inset-x-10 -top-10 h-40 rounded-full bg-accent/25 blur-[90px]" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0D] shadow-[0_40px_120px_-30px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.03)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="flex h-[600px] md:h-[660px]">
          <aside className="hidden w-[220px] shrink-0 border-r border-white/10 bg-white/[.02] p-3 md:block"><Sidebar mock showLogo /></aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <DashHeader />
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5"><DashboardContent /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
