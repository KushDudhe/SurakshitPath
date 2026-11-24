import { useState } from 'react';
import { CheckCircle2, Upload } from 'lucide-react';
import PageHeader from './PageHeader';
import { useApp } from '../state/AppContext';

const TYPES = ['Suspicious activity', 'Poor lighting', 'Road closure', 'Accident', 'Construction', 'Transport issue', 'Other'];

export default function Report() {
  const { addReport, reports } = useApp();
  const [f, setF] = useState({ type: TYPES[1], location: '', description: '' });
  const [img, setImg] = useState(null);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!f.location.trim() || !f.description.trim()) { setErr('Add a location and a short description.'); return; }
    setErr(''); setDone(addReport({ ...f, image: img?.name || null }));
    setF({ type: TYPES[1], location: '', description: '' }); setImg(null);
  };
  return (
    <div>
      <PageHeader title="Report a Route Condition" sub="Reports describe conditions at a location and time. They are verified before they affect any score." />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card p-6">
          {done ? (
            <div className="fade-up py-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10"><CheckCircle2 className="h-7 w-7 text-accent" /></span>
              <h2 className="mt-4 text-xl font-semibold">Report submitted for verification.</h2>
              <p className="mt-1 text-sm text-muted">{done.type} · {done.location}</p>
              <span className="chip mt-4 !text-amber-300">Status: Pending Verification</span>
              <div><button onClick={() => setDone(null)} className="btn-ghost mt-6">Submit another report</button></div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div><label className="label" htmlFor="ty">Incident type</label><select id="ty" className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{TYPES.map((t) => <option key={t} className="bg-[#0F0F11]">{t}</option>)}</select></div>
              <div><label className="label" htmlFor="lo">Location</label><input id="lo" className="input" placeholder="Street, landmark or junction" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
              <div><label className="label" htmlFor="de">Description</label><textarea id="de" rows={4} className="input resize-none" placeholder="What did you see? Keep to facts about the place and time." value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
              <div>
                <span className="label">Image (optional)</span>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 p-4 text-sm text-muted transition hover:border-accent/50"><Upload className="h-4 w-4 text-accent" />{img ? img.name : 'Choose an image'}<input type="file" accept="image/*" className="sr-only" onChange={(e) => setImg(e.target.files?.[0] || null)} /></label>
                <p className="mt-1 text-[11px] text-white/30">Prototype: the image is not uploaded.</p>
              </div>
              {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
              <button className="btn-accent w-full py-3" type="submit">Submit Report</button>
            </form>
          )}
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium">Your reports</h3>
          <ul className="mt-4 space-y-3">
            {reports.slice(0, 6).map((r) => (
              <li key={r.id} className="rounded-xl border border-white/10 bg-white/[.03] p-3.5">
                <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{r.type}</span><span className={`chip ${r.status === 'Verified' ? '!text-accent' : '!text-amber-300'}`}>{r.status}</span></div>
                <p className="mt-1 text-xs text-muted">{r.location} · {r.date}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
