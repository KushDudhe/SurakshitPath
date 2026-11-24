import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { searchLocations } from '../lib/api';

// Address search backed by the server-side geocoding endpoint. A location is
// considered selected only after the user chooses a result with coordinates.
export default function LocationSearch({ id, label, value, onChange, onSelect, placeholder = 'Search an address or place', icon = 'start' }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef(null);
  const sequence = useRef(0);

  useEffect(() => {
    const query = String(value || '').trim();
    const requestId = ++sequence.current;
    clearTimeout(timer.current);
    if (query.length < 2) { setResults([]); setError(''); setLoading(false); setOpen(false); return; }
    // Clear previous matches immediately so stale results never appear under a new query.
    setResults([]);
    setError('');
    timer.current = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const found = await searchLocations(query);
        if (requestId !== sequence.current) return;
        setResults(found);
        setOpen(true);
        if (!found.length) setError('No match found. Try adding the area, city or PIN code, or use a nearby landmark.');
      } catch {
        if (requestId === sequence.current) setError('Location search is unavailable. Check that the backend is running.');
      } finally { if (requestId === sequence.current) setLoading(false); }
    }, 1000);
    return () => clearTimeout(timer.current);
  }, [value]);

  const choose = (place) => {
    onSelect({ ...place, lat: Number(place.lat), lng: Number(place.lng), q: 0.5 });
    setResults([]); setOpen(false); setError('');
  };

  return <div className="relative">
    {label && <label className="label" htmlFor={id}>{label}</label>}
    <div className="relative">
      <MapPin className="absolute left-3 top-3 h-4 w-4 text-accent" />
      <input id={id} autoComplete="off" className="input !pl-9 !pr-9" value={value} placeholder={placeholder}
        onFocus={() => { if (results.length) setOpen(true); }}
        onBlur={() => { window.setTimeout(() => setOpen(false), 140); }}
        onChange={(e) => { onChange(e.target.value); setResults([]); setError(''); setOpen(true); }}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter' && results[0]) { e.preventDefault(); choose(results[0]); } }} />
      {loading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted" />}
    </div>
    {open && (results.length > 0 || error) && <div className="absolute inset-x-0 top-full z-[700] mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#151518] p-1 shadow-2xl">
      {results.map((place, i) => <button type="button" key={`${place.lat}-${place.lng}-${i}`} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(place)} className="block w-full rounded-lg px-3 py-2.5 text-left text-xs leading-relaxed text-white/90 hover:bg-white/10">
        <span className="block font-medium">{place.name.split(',').slice(0, 2).join(',')}</span><span className="mt-0.5 block text-[10px] text-muted">{place.name}{place.source ? ` · ${place.source}` : ''}</span>
      </button>)}
      {error && <p className="px-3 py-2 text-xs text-muted">{error}</p>}
    </div>}
    {value?.trim().length >= 2 && !loading && !results.length && !error && <p className="mt-1 text-[10px] text-muted">Search for a place, then choose a result.</p>}
  </div>;
}
