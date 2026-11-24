import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout, MarketingLayout, ScrollManager } from './components/Layouts';
import LiveAlert from './components/LiveAlert';
import SafetyCheckModal from './components/SafetyCheckModal';
import LoginModal from './components/LoginModal';
import ScoringModal from './components/ScoringModal';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Plan from './pages/Plan';
import Compare from './pages/Compare';
import MapPage from './pages/MapPage';
import Report from './pages/Report';
import Journeys from './pages/Journeys';
import Analytics from './pages/Analytics';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/report" element={<Report />} />
          <Route path="/journeys" element={<Journeys />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <LiveAlert />
      <SafetyCheckModal />
      <LoginModal />
      <ScoringModal />
    </>
  );
}
