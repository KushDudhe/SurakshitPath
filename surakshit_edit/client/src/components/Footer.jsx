import { Link } from 'react-router-dom';
import { Logo } from './Navbar';

const COLS = [
  { title: 'Product', links: [['Plan Route', '/plan'], ['Live Map', '/map'], ['Safety Check', '/dashboard'], ['Journey History', '/journeys']] },
  { title: 'Resources', links: [['Data Sources', '/about#data'], ['Methodology', '/about#methodology'], ['FAQ', '/about#faq'], ['Documentation', '/about#docs']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/about#contact'], ['Privacy', '/about#privacy']] },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#0F0F11]/60">
      <div className="mx-auto max-w-[1200px] px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">Transparent route planning for safer night travel.</p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 text-sm font-medium">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map(([label, to]) => <li key={label}><Link to={to} className="text-sm text-muted transition hover:text-white">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 SurakshitPath</span>
          <span>Safety scores are estimates and are not guarantees.</span>
        </div>
      </div>
    </footer>
  );
}
