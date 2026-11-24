import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, wide = false, persistent = false, hideClose = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !persistent) onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, persistent, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={persistent ? undefined : onClose} />
      <div className={`fade-up card relative max-h-[90vh] w-full overflow-y-auto border-white/15 bg-[#0F0F11] p-6 shadow-[0_0_80px_-20px_rgba(0,195,201,.35)] ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        {!hideClose && (
          <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
        )}
        {children}
      </div>
    </div>
  );
}
