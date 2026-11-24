import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_WEIGHTS, applyEvents, effectiveWeights, isLateNight, rankScore, scoreRoute } from '../lib/scoring';
import { SEED_CONTACTS, SEED_HISTORY, SEED_REPORTS, applyRealGeometry, eventPoi, findPlace, generateRoutes } from '../lib/data';
import { fmtTime, todayStr } from '../lib/util';
import { api, fetchRealRoutes } from '../lib/api';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const load = (k, d) => { try { const v = localStorage.getItem('sp_' + k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem('sp_' + k, JSON.stringify(v)); } catch { /* ignore */ } };

const INIT_J = { active: false, progress: 0, paused: false, routeId: 'B', log: [] };
const CLOSED_SC = { open: false, reason: '', result: null };
const EVENTS = {
  closure: { routeId: 'B', kind: 'closure', delta: { road: -80, incidents: -27, activity: -12, transport: -12 }, time: 8 },
  incident: { routeId: 'C', kind: 'incident', delta: { incidents: -25, activity: -6, lighting: -3 }, time: 2 },
};
const demoRoutes = () => generateRoutes(findPlace('Pimpri'), findPlace('Hinjawadi'));

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const [start, setStart] = useState('Pimpri');
  const [end, setEnd] = useState('Hinjawadi');
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [departure, setDeparture] = useState('21:30');
  const [pref, setPref] = useState(70); // % given to safety factors
  const [prefs, setPrefs] = useState({});
  const [weights, setWeights] = useState(() => load('weights', DEFAULT_WEIGHTS));
  const [routes, setRoutes] = useState(demoRoutes);
  const [planned, setPlanned] = useState(false);
  const [planKey, setPlanKey] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState('B');
  const [events, setEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [journey, setJourney] = useState(INIT_J);
  const [safetyCheck, setSafetyCheck] = useState(CLOSED_SC);
  const [alerts, setAlerts] = useState([]);
  const [contacts, setContacts] = useState(() => load('contacts', SEED_CONTACTS));
  const [sharing, setSharing] = useState(true);
  const [history, setHistory] = useState(() => load('history', SEED_HISTORY));
  const [reports, setReports] = useState(() => load('reports', SEED_REPORTS));
  const [stats, setStats] = useState(() => load('stats', { planned: 42, completed: 37, checks: 9, reports: 6 }));
  const [user, setUser] = useState(() => load('user', null));
  const [loginOpen, setLoginOpen] = useState(false);
  const [scoringOpen, setScoringOpen] = useState(false);

  useEffect(() => save('contacts', contacts), [contacts]);
  useEffect(() => save('history', history), [history]);
  useEffect(() => save('reports', reports), [reports]);
  useEffect(() => save('stats', stats), [stats]);
  useEffect(() => save('weights', weights), [weights]);
  useEffect(() => save('user', user), [user]);

  const pushAlert = useCallback((a) => {
    const id = Math.random().toString(36).slice(2);
    setAlerts((x) => [...x.slice(-3), { id, ...a }]);
    setTimeout(() => setAlerts((x) => x.filter((y) => y.id !== id)), a.ttl || 7000);
  }, []);
  const dismissAlert = (id) => setAlerts((x) => x.filter((y) => y.id !== id));
  const bump = (k, n = 1) => setStats((s) => ({ ...s, [k]: s[k] + n }));

  // ---- derived: scored + ranked routes (everything is recomputed from base data + weights + events)
  const view = useMemo(() => {
    const w = effectiveWeights(weights, { prefs, departure });
    const list0 = routes.map((r) => {
      const base = scoreRoute(r, w);
      const a = applyEvents(r, events);
      const sc = scoreRoute(a, w);
      const pois = [...r.pois, ...events.filter((e) => e.routeId === r.id).map((e) => eventPoi(r, e))];
      return { ...a, ...sc, pois, baseScore: base.score, baseTime: r.time, changed: events.some((e) => e.routeId === r.id) };
    });
    const minT = Math.min(...list0.map((r) => r.time));
    const list = list0.map((r) => ({ ...r, rank: rankScore(r, pref, minT) }));
    const recommendedId = [...list].sort((a, b) => b.rank - a.rank)[0].id;
    return { list, recommendedId, weights: w, lateNight: isLateNight(departure) };
  }, [routes, events, weights, prefs, departure, pref]);
  const selected = view.list.find((r) => r.id === selectedId) || view.list[0];

  // moving the slider (or generating routes) selects the top-ranked route
  useEffect(() => { setSelectedId(view.recommendedId); /* eslint-disable-next-line */ }, [pref, planKey]);

  const logJ = (text) => setJourney((j) => ({ ...j, log: [{ t: Date.now(), text }, ...j.log].slice(0, 6) }));

  // ---- planning
  const generate = async () => {
    const s = startPoint || findPlace(start), e = endPoint || findPlace(end);
    if (!s || !e) { pushAlert({ type: 'warning', title: 'Choose both locations', body: 'Search for an address or click the map to set both points.' }); return; }
    if (s.name === e.name) { pushAlert({ type: 'warning', title: 'Start and destination are the same', body: 'Pick two different places.' }); return; }
    setGenerating(true);
    const minWait = new Promise((r) => setTimeout(r, 900));
    Promise.all([fetchRealRoutes(s, e), minWait]).then(([real]) => {
      const base = generateRoutes(s, e);
      // Only display routes returned by the real routing provider; never substitute demo geometry.
      const next = applyRealGeometry(base.slice(0, real.length), real, s, e);
      setRoutes(next); setEvents([]); setLastUpdate(null); setJourney(INIT_J);
      setPlanned(true); setPlanKey((k) => k + 1); setGenerating(false); bump('planned');
      const provider = real[0]?.provider || 'routing provider';
      const trafficNote = real[0]?.trafficAware ? 'Current traffic was included in route estimates.' : 'Traffic-aware routing is not enabled for this provider.';
      pushAlert({ type: 'success', title: `${next.length} real road route${next.length === 1 ? '' : 's'} generated`, body: `${s.name} → ${e.name} · ${provider}. ${trafficNote} Safety scores still contain modelled/demo factors.` });
    }).catch((err) => {
      setGenerating(false);
      pushAlert({ type: 'error', title: 'Could not calculate real routes', body: `${err.message}. Add/configure a routing API key in server/.env and restart the backend. No fake routes were generated.` });
    });
  };
  const selectRoute = (id) => setSelectedId(id);

  // ---- live simulation
  const simulate = (kind) => {
    if (events.some((e) => e.kind === kind)) { pushAlert({ type: 'info', title: 'Already applied', body: 'Reset the simulation to run it again.' }); return; }
    const tmpl = EVENTS[kind], ev = { ...tmpl, id: Date.now() };
    const r = routes.find((x) => x.id === tmpl.routeId);
    const cur = applyEvents(r, events), nxt = applyEvents(r, [...events, ev]);
    const before = scoreRoute(cur, view.weights).score, after = scoreRoute(nxt, view.weights).score;
    setEvents([...events, ev]);
    setLastUpdate({ kind, routeId: r.id, beforeScore: before, afterScore: after, beforeEta: cur.time, afterEta: nxt.time });
    pushAlert({ type: 'warning', title: kind === 'closure' ? '⚠ New road condition detected' : '⚠ New verified incident reported', body: kind === 'closure' ? `Road closure detected 500m ahead on Route ${r.id}.` : `Verified incident reported along Route ${r.id}.` });
    setTimeout(() => pushAlert({ type: 'info', title: 'Route conditions recalculated.', body: `Route ${r.id}: ${before} → ${after} · ETA ${cur.time} → ${nxt.time} min` }), 1300);
  };
  const resetSim = () => { setEvents([]); setLastUpdate(null); pushAlert({ type: 'info', title: 'Simulation reset', body: 'Route conditions are back to the baseline.' }); };

  // ---- journey
  const startJourney = () => {
    setJourney({ active: true, progress: 0, paused: false, routeId: selectedId, log: [{ t: Date.now(), text: `Journey started on Route ${selectedId}` }] });
    pushAlert({ type: 'success', title: 'Journey started', body: sharing ? 'Journey sharing is active with your trusted contacts (simulated).' : 'Sharing is off.' });
  };
  const finishJourney = (status) => {
    const r = view.list.find((x) => x.id === journey.routeId) || selected;
    setHistory((h) => [{ id: 'h' + Date.now(), from: start, to: end, date: todayStr(), time: fmtTime(departure), duration: r.time, score: r.score, status }, ...h]);
    if (status === 'Completed') bump('completed');
    setJourney(INIT_J);
    pushAlert({ type: status === 'Completed' ? 'success' : 'info', title: status === 'Completed' ? 'Journey completed' : 'Journey ended', body: `${start} → ${end} was saved to My Journeys.` });
  };
  useEffect(() => {
    if (!journey.active || journey.paused || safetyCheck.open) return undefined;
    const id = setInterval(() => setJourney((j) => (j.active ? { ...j, progress: Math.min(1, j.progress + 0.012) } : j)), 1000);
    return () => clearInterval(id);
  }, [journey.active, journey.paused, safetyCheck.open]);
  useEffect(() => { if (journey.active && journey.progress >= 1) finishJourney('Completed'); /* eslint-disable-next-line */ }, [journey.progress]);

  // ---- safety check (simulation only – nobody is contacted)
  const triggerSafetyCheck = (reason) => {
    setJourney((j) => (j.active ? j : { active: true, progress: 0.25, paused: false, routeId: selectedId, log: [] }));
    logJ(reason === 'stop' ? 'Unexpected stop detected (simulated)' : 'Route deviation detected (simulated)');
    setSafetyCheck({ open: true, reason, result: null });
    bump('checks');
  };
  const resolveSafetyCheck = (choice) => {
    if (choice === 'safe') {
      setSafetyCheck(CLOSED_SC); logJ('You confirmed you are safe');
      pushAlert({ type: 'success', title: 'Safety check cleared', body: 'Glad you are okay. The journey continues.' });
      return;
    }
    logJ(choice === 'help' ? 'Help requested (simulated)' : choice === 'contact' ? 'Trusted contact notified (simulated)' : 'No response – escalation simulated');
    setSafetyCheck((s) => ({ ...s, result: choice }));
  };
  const closeSafetyCheck = () => setSafetyCheck(CLOSED_SC);

  // ---- reports, contacts
  const addReport = (r) => {
    const rep = { id: 'r' + Date.now(), status: 'Pending Verification', date: todayStr(), ...r };
    setReports((x) => [rep, ...x]); bump('reports'); api.post('/reports', rep);
    return rep;
  };
  const addContact = (c) => { const n = { id: 'c' + Date.now(), ...c }; setContacts((x) => [...x, n]); api.post('/contacts', n); };
  const removeContact = (id) => { setContacts((x) => x.filter((c) => c.id !== id)); api.del('/contacts/' + id); };

  // ---- demo
  const loadDemo = (go = true) => {
    setStart('Pimpri'); setEnd('Hinjawadi'); setDeparture('21:30'); setPref(70); setPrefs({});
    setRoutes(demoRoutes()); setEvents([]); setLastUpdate(null); setJourney(INIT_J); setSafetyCheck(CLOSED_SC);
    setPlanned(true); setPlanKey((k) => k + 1);
    if (go) navigate('/dashboard');
    pushAlert({ type: 'success', title: go ? 'Demo loaded' : 'Demo reset', body: 'Pimpri → Hinjawadi · Route A 18 min / 68, Route B 21 min / 84, Route C 25 min / 91.' });
  };

  const value = {
    start, setStart, end, setEnd, startPoint, setStartPoint, endPoint, setEndPoint, departure, setDeparture, pref, setPref, prefs, setPrefs, weights, setWeights,
    routes, view, selected, selectedId, selectRoute, planned, planKey, generating, generate,
    events, lastUpdate, simulate, resetSim,
    journey, startJourney, finishJourney, triggerSafetyCheck, safetyCheck, resolveSafetyCheck, closeSafetyCheck,
    alerts, pushAlert, dismissAlert,
    contacts, addContact, removeContact, sharing, setSharing,
    history, reports, addReport, stats, user, setUser, loginOpen, setLoginOpen, scoringOpen, setScoringOpen,
    loadDemo,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
