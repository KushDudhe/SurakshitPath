import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import Modal from './Modal';
import { NAV } from '../lib/nav';

export function GridBg() {
  return (
    <>
      <div className="grid-bg" />
      <div className="pointer-events-none fixed left-1/2 top-[-260px] -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]" />
    </>
  );
}

export function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);
  return null;
}

export function MarketingLayout() {
  return (
    <div className="relative">
      <GridBg />
      <Navbar />
      <main className="pt-[72px]"><Outlet /></main>
      <Footer />
    </div>
  );
}

export function AppLayout() {
  const { pathname } = useLocation();
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [pathname]);
  const main = NAV.slice(0, 4);
  return (
    <div className="relative">
      <GridBg />
      <Navbar />
      <aside className="fixed bottom-0 left-0 top-[72px] z-30 hidden w-[220px] flex-col border-r border-white/10 bg-[#0B0B0D]/80 p-3 backdrop-blur-xl lg:flex">
        <Sidebar />
      </aside>
      <main className="pb-[76px] pt-[72px] lg:pb-0 lg:pl-[220px]">
        <div className="mx-auto max-w-[1200px] p-4 md:p-6"><Outlet /></div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[60px] grid-cols-5 border-t border-white/10 bg-[#09090B]/90 backdrop-blur-xl lg:hidden" aria-label="Mobile">
        {main.map((n) => {
          const Icon = n.icon, a = pathname === n.to;
          return <Link key={n.to} to={n.to} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] ${a ? 'text-white' : 'text-muted'}`}><Icon className={`h-5 w-5 ${a ? 'text-accent' : ''}`} />{n.label.replace('My ', '').replace(' Route', '')}</Link>;
        })}
        <button onClick={() => setMore(true)} className="flex flex-col items-center justify-center gap-0.5 text-[10px] text-muted"><MoreHorizontal className="h-5 w-5" />More</button>
      </nav>
      <Modal open={more} onClose={() => setMore(false)} title="More">
        <h3 className="mb-3 text-lg font-semibold">Menu</h3>
        <div className="grid grid-cols-2 gap-2">
          {NAV.slice(4).map((n) => { const Icon = n.icon; return <Link key={n.to} to={n.to} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm"><Icon className="h-4 w-4 text-accent" />{n.label}</Link>; })}
          <Link to="/compare" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm">Compare Routes</Link>
        </div>
      </Modal>
    </div>
  );
}
