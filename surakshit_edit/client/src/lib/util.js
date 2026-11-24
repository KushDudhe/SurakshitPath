export const fmtTime = (t) => {
  const [h, m] = String(t || '21:30').split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const todayStr = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const cx = (...a) => a.filter(Boolean).join(' ');
