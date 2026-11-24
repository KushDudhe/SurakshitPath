import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHeader from './PageHeader';
import JourneyCard from '../components/JourneyCard';
import { useApp } from '../state/AppContext';

export default function Journeys() {
  const { history } = useApp();
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const list = history.filter((j) => (status === 'All' || j.status === status) && `${j.from} ${j.to}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="My Journeys" sub={`${history.length} journeys saved on this device.`} right={<Link to="/plan" className="btn-primary btn-sm">Plan a Route</Link>} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {['All', 'Completed', 'Cancelled'].map((s) => <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-3.5 py-1.5 text-xs transition ${status === s ? 'border-accent/50 bg-accent/10 text-white' : 'border-white/10 text-muted hover:text-white'}`}>{s}</button>)}
        <div className="relative ml-auto w-full sm:w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" /><input className="input !py-2 !pl-9" placeholder="Filter by place" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter journeys" /></div>
      </div>
      {list.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((j) => <JourneyCard key={j.id} j={j} />)}</div>
        : <div className="card p-10 text-center text-sm text-muted">No journeys match. Start a journey from the dashboard to see it here.</div>}
    </div>
  );
}
