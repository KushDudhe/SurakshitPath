import { Link, useLocation } from 'react-router-dom';
import { Route as RouteIcon } from 'lucide-react';
import { NAV } from '../lib/nav';

export default function Sidebar({ mock = false, showLogo = false }) {
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Dashboard">
      {showLogo && (
        <div className="mb-4 flex items-center gap-2.5 px-2 py-1">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent"><RouteIcon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} /></span>
          <span className="text-[15px] font-semibold tracking-tight">SurakshitPath</span>
        </div>
      )}
      {NAV.map((n) => {
        const active = mock ? n.to === '/dashboard' : pathname === n.to;
        const Icon = n.icon;
        return (
          <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition ${active ? 'bg-white/5 text-white' : 'text-muted hover:bg-white/[.03] hover:text-white'}`}>
            <Icon className={`h-4 w-4 ${active ? 'text-accent' : ''}`} />{n.label}
          </Link>
        );
      })}
    </nav>
  );
}
