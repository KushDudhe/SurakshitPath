import { Trash2 } from 'lucide-react';
import { useApp } from '../state/AppContext';

export default function TrustedContactCard({ contact, compact = false, removable = false }) {
  const { removeContact, sharing } = useApp();
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.03] ${compact ? 'p-2.5' : 'p-4'}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{contact.name[0]?.toUpperCase()}</span>
        <div><div className="text-sm font-medium">{contact.name}</div><div className="text-xs text-muted">{contact.relation}</div></div>
      </div>
      <div className="flex items-center gap-2">
        {!compact && sharing && <span className="chip !text-accent">Sharing</span>}
        {removable && <button onClick={() => removeContact(contact.id)} aria-label={`Remove ${contact.name}`} className="rounded-lg p-2 text-muted transition hover:bg-white/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>}
      </div>
    </div>
  );
}
