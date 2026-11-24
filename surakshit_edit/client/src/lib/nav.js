import { LayoutDashboard, Route as RouteIcon, Map as MapIcon, Clock, FileWarning, Users, BarChart3, Settings } from 'lucide-react';

export const NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Plan Route', to: '/plan', icon: RouteIcon },
  { label: 'Live Map', to: '/map', icon: MapIcon },
  { label: 'My Journeys', to: '/journeys', icon: Clock },
  { label: 'Safety Reports', to: '/report', icon: FileWarning },
  { label: 'Trusted Contacts', to: '/contacts', icon: Users },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
];
export const TOP_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/#features' },
  { label: 'How It Works', to: '/#how' },
  { label: 'Live Map', to: '/map' },
  { label: 'Safety', to: '/#safety' },
  { label: 'About', to: '/about' },
];
export const RESOURCES = [
  { label: 'Safety Methodology', to: '/about#methodology' },
  { label: 'Data Sources', to: '/about#data' },
  { label: 'Documentation', to: '/about#docs' },
  { label: 'FAQ', to: '/about#faq' },
];
