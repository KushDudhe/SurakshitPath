import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, Route as RouteIcon, X } from 'lucide-react';
import { RESOURCES, TOP_LINKS } from '../lib/nav';
import { useApp } from '../state/AppContext';

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="SurakshitPath home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent shadow-[0_0_20px_-4px_rgba(0,195,201,.8)]"><RouteIcon className="h-4 w-4 text-white" strokeWidth={2.5} /></span>
      <span className="text-[17px] font-semibold tracking-tight">SurakshitPath</span>
    </Link>
  );
}

export default function Navbar() {
  const { pathname, hash } = useLocation();
  const { setLoginOpen, user } = useApp();
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setOpen(false); setRes(false); }, [pathname, hash]);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setRes(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const active = (to) => {
    const [p, h] = to.split('#');
    return pathname === p && (h ? hash === '#' + h : !hash);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-white/10 bg-[#09090B]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {TOP_LINKS.map((l) => (
            <Link key={l.label} to={l.to} className={`rounded-full px-3 py-1.5 text-[13.5px] transition ${active(l.to) ? 'bg-white/5 text-white' : 'text-muted hover:text-white'}`}>{l.label}</Link>
          ))}
          <div className="relative" ref={ref}>
            <button onClick={() => setRes(!res)} aria-expanded={res} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13.5px] text-muted transition hover:text-white">
              Resources <ChevronDown className={`h-3.5 w-3.5 transition ${res ? 'rotate-180' : ''}`} />
            </button>
            {res && (
              <div className="dropdown-enter absolute left-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#0F0F11]/95 p-1.5 shadow-2xl backdrop-blur-xl">
                {RESOURCES.map((r) => (
                  <Link key={r.label} to={r.to} className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-white">{r.label}</Link>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setLoginOpen(true)} className="hidden rounded-full px-3 py-1.5 text-[13.5px] text-muted transition hover:text-white sm:block">
            {user ? user.name : 'Login'}
          </button>
          <Link to="/plan" className="btn-primary btn-sm hidden sm:inline-flex">Plan a Route <ArrowRight className="h-3.5 w-3.5" /></Link>
          <button className="rounded-lg p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open && (
        <div className="dropdown-enter absolute inset-x-0 top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto border-b border-white/10 bg-[#09090B]/95 p-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1">
            {TOP_LINKS.map((l) => <Link key={l.label} to={l.to} className={`rounded-lg px-3 py-2.5 text-sm ${active(l.to) ? 'bg-white/5 text-white' : 'text-muted'}`}>{l.label}</Link>)}
            <div className="mt-2 px-3 text-[11px] uppercase tracking-widest text-white/30">Resources</div>
            {RESOURCES.map((r) => <Link key={r.label} to={r.to} className="rounded-lg px-3 py-2.5 text-sm text-muted">{r.label}</Link>)}
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setOpen(false); setLoginOpen(true); }} className="btn-ghost flex-1">{user ? user.name : 'Login'}</button>
              <Link to="/plan" className="btn-primary flex-1">Plan a Route <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
