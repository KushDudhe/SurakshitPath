import { Marker } from 'react-leaflet';
import { poiIcon } from '../lib/poi';
import { PoiPopup } from './PoiMarker';

// incidents and road closures pulse so they draw the eye
export default function IncidentMarker({ poi }) {
  return <Marker position={poi.pos} icon={poiIcon(poi.type, true)} zIndexOffset={500}><PoiPopup poi={poi} /></Marker>;
}
