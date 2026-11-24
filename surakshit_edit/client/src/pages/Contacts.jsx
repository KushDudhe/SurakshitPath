import { useState } from 'react';
import { Share2 } from 'lucide-react';
import PageHeader from './PageHeader';
import TrustedContactCard from '../components/TrustedContactCard';
import { useApp } from '../state/AppContext';

export default function Contacts() {
  const { contacts, addContact, sharing, setSharing } = useApp();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Friend');
  const add = (e) => { e.preventDefault(); if (!name.trim()) return; addContact({ name: name.trim(), relation }); setName(''); };
  return (
    <div>
      <PageHeader title="Trusted Contacts" sub="People who can follow your journey. Sharing is simulated in this prototype." />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className={`text-sm font-medium ${sharing ? 'text-accent' : 'text-muted'}`}>{sharing ? 'Journey sharing active' : 'Journey sharing paused'}</div>
            <button onClick={() => setSharing(!sharing)} className="btn-accent btn-sm"><Share2 className="h-3.5 w-3.5" />{sharing ? 'Stop sharing' : 'Share Journey'}</button>
          </div>
          <div className="space-y-2.5">{contacts.length ? contacts.map((c) => <TrustedContactCard key={c.id} contact={c} removable />) : <p className="text-sm text-muted">No contacts yet. Add someone you trust.</p>}</div>
        </div>
        <form onSubmit={add} className="card space-y-4 p-6">
          <h3 className="text-sm font-medium">Add a contact</h3>
          <div><label className="label" htmlFor="cn">Name</label><input id="cn" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anita" /></div>
          <div><label className="label" htmlFor="cr">Relationship</label><select id="cr" className="input" value={relation} onChange={(e) => setRelation(e.target.value)}>{['Friend', 'Family', 'Colleague', 'Other'].map((r) => <option key={r} className="bg-[#0F0F11]">{r}</option>)}</select></div>
          <button className="btn-primary w-full" type="submit">Add contact</button>
        </form>
      </div>
    </div>
  );
}
