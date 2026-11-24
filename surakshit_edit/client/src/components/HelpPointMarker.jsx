import { Marker } from 'react-leaflet';
import { poiIcon } from '../lib/poi';
import { PoiPopup } from './PoiMarker';

// help points, police stations and hospitals
export default function HelpPointMarker({ poi }) {
  return <Marker position={poi.pos} icon={poiIcon(poi.type, poi.type === 'help')} zIndexOffset={300}><PoiPopup poi={poi} /></Marker>;
}
