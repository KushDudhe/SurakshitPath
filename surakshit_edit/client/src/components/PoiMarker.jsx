import { Marker, Popup } from 'react-leaflet';
import { POI_META, poiIcon } from '../lib/poi';

export function PoiPopup({ poi }) {
  const m = POI_META[poi.type];
  return (
    <Popup>
      <div className="min-w-[170px]">
        <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: m.color }}>{m.label}</div>
        <div className="mt-0.5 text-sm font-semibold">{poi.title}</div>
        <div className="mt-0.5 text-xs text-white/60">{poi.note}</div>
        {poi.verified != null && <div className="mt-1.5 text-[11px]" style={{ color: poi.verified ? '#34D399' : '#FBBF24' }}>{poi.verified ? '✓ Verified' : 'Unverified · pending review'}</div>}
        <div className="mt-2 text-[9px] tracking-widest text-white/35">DEMO DATA</div>
      </div>
    </Popup>
  );
}

// lighting + transport markers
export default function PoiMarker({ poi }) {
  return <Marker position={poi.pos} icon={poiIcon(poi.type)}><PoiPopup poi={poi} /></Marker>;
}
