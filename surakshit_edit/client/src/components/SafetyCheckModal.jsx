import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldQuestion } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../state/AppContext';

export default function SafetyCheckModal() {
  const { safetyCheck: sc, resolveSafetyCheck, closeSafetyCheck, contacts } = useApp();
  const [sec, setSec] = useState(30);
  useEffect(() => {
    if (!sc.open || sc.result) return undefined;
    let s = 30; setSec(30);
    const id = setInterval(() => { s -= 1; setSec(s); if (s <= 0) { clearInterval(id); resolveSafetyCheck('timeout'); } }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [sc.open, sc.result]);
  const names = contacts.map((c) => c.name).join(' and ') || 'your trusted contacts';
  const reason = sc.reason === 'stop' ? 'Your vehicle has stopped unexpectedly.' : 'Your route has deviated from the planned path.';

  return (
    <Modal open={sc.open} onClose={closeSafetyCheck} persistent hideClose={!sc.result} title="Safety check">
      {!sc.result ? (
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10"><ShieldQuestion className="h-7 w-7 text-accent" /></span>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight">Are you okay?</h3>
          <p className="mt-1.5 text-sm text-muted">{reason} Let us know you are fine.</p>
          <div className="mt-5 flex flex-col gap-2.5">
            <button onClick={() => resolveSafetyCheck('safe')} className="btn-accent w-full">I'm Safe</button>
            <button onClick={() => resolveSafetyCheck('help')} className="btn-ghost w-full !border-red-400/40 !text-red-300">Need Help</button>
            <button onClick={() => resolveSafetyCheck('contact')} className="btn-ghost w-full">Contact Trusted Person</button>
          </div>
          <p className="mt-4 text-xs text-muted">No response in <span className="tabular-nums text-white">{sec}s</span> will simulate an escalation to your trusted contacts.</p>
          <p className="mt-2 text-[11px] text-white/30">Prototype simulation. Nobody is contacted.</p>
        </div>
      ) : (
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10"><CheckCircle2 className="h-7 w-7 text-accent" /></span>
          <h3 className="mt-4 text-xl font-semibold tracking-tight">{sc.result === 'help' ? 'Help request simulated' : sc.result === 'contact' ? 'Trusted contact notified (simulated)' : 'No response · escalation simulated'}</h3>
          <p className="mt-2 text-sm text-muted">
            {sc.result === 'help' ? 'In a real deployment this would share your live location with your trusted contacts and surface local emergency options. In a real emergency, call 112 now.' : `In a real deployment, ${names} would receive your live location and route. Nothing was sent in this demo.`}
          </p>
          <button onClick={closeSafetyCheck} className="btn-primary mt-5 w-full">Back to journey</button>
        </div>
      )}
    </Modal>
  );
}
