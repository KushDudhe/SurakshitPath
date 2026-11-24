import L from 'leaflet';

export const ROUTE_COLORS = { A: '#3B82F6', B: '#22C55E', C: '#A855F7' };
export const ALERT_COLOR = '#FB923C';
export const POI_META = {
  lighting: { label: 'Lighting', emoji: '💡', color: '#FACC15' },
  help: { label: 'Help Point', emoji: '🛡', color: '#34D399' },
  transport: { label: 'Transport', emoji: '🚌', color: '#00C3C9' },
  incident: { label: 'Verified Incident', emoji: '⚠', color: '#F87171' },
  closure: { label: 'Road Closure', emoji: '🚧', color: '#FB923C' },
  police: { label: 'Police', emoji: '👮', color: '#60A5FA' },
  hospital: { label: 'Hospital', emoji: '🏥', color: '#F472B6' },
};
const cache = {};
export function poiIcon(type, pulse = false) {
  const key = type + pulse;
  if (!cache[key]) {
    const m = POI_META[type];
    cache[key] = L.divIcon({ className: 'poi-wrap', html: `<span class="poi ${pulse ? 'pulse' : ''}" style="--c:${m.color}">${m.emoji}</span>`, iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -12] });
  }
  return cache[key];
}
export const pinIcon = (kind) => L.divIcon({ className: 'pin-wrap', html: `<div class="pin pin-${kind}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
