import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './state/AppContext.jsx';

vi.mock('@splinetool/react-spline', () => ({ default: () => <div data-spline /> }));
vi.mock('react-leaflet', () => {
  const C = ({ children }) => <div data-map>{children}</div>;
  const N = ({ children }) => <>{children}</>;
  return { MapContainer: C, TileLayer: N, Polyline: N, Marker: N, Tooltip: N, Popup: N, useMap: () => ({ invalidateSize() {}, fitBounds() {}, setView() {}, flyTo() {}, getContainer: () => document.createElement('div') }) };
});
globalThis.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
globalThis.IntersectionObserver = class { constructor(cb) { this.cb = cb; } observe(el) { this.cb([{ isIntersecting: true, target: el }]); } disconnect() {} unobserve() {} };
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
window.scrollTo = () => {}; Element.prototype.scrollIntoView = () => {};

const mount = (path) => render(<MemoryRouter initialEntries={[path]}><AppProvider><App /></AppProvider></MemoryRouter>);

describe('routes render', () => {
  for (const p of ['/', '/about', '/dashboard', '/plan', '/compare', '/map', '/report', '/journeys', '/analytics', '/contacts', '/settings']) {
    it(p, () => { const { container, unmount } = mount(p); expect(container.textContent.length).toBeGreaterThan(200); unmount(); });
  }
});
describe('flows', () => {
  it('dashboard shows spec numbers and closure simulation updates B 84 -> 67', async () => {
    const { container } = mount('/dashboard');
    expect(container.textContent).toContain('Pimpri');
    expect(container.textContent).toContain('84');
    await act(async () => { fireEvent.click(screen.getAllByText('Simulate Live Update')[0]); });
    expect(container.textContent).toContain('84 → 67');
    expect(container.textContent).toContain('21 min → 29 min');
    await act(async () => { fireEvent.click(screen.getAllByText('Reset Simulation')[0]); });
  });
  it('safety check modal opens', async () => {
    mount('/dashboard');
    await act(async () => { fireEvent.click(screen.getAllByText('Simulate Unexpected Stop')[0]); });
    expect(screen.getByText('Are you okay?')).toBeTruthy();
    await act(async () => { fireEvent.click(screen.getByText("I'm Safe")); });
    expect(screen.queryByText('Are you okay?')).toBeNull();
  });
  it('scoring modal opens', async () => {
    mount('/dashboard');
    await act(async () => { fireEvent.click(screen.getAllByText('How scoring works →')[0]); });
    expect(screen.getAllByText('How scoring works').length).toBeGreaterThan(0);
  });
});
