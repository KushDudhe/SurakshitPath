import { Component, Suspense, lazy } from 'react';
import { Route as RouteIcon } from 'lucide-react';

// The 3D runtime is heavy, so it loads lazily and only when this component renders.
const Spline = lazy(() => import('@splinetool/react-spline'));

// If the scene cannot load (offline, blocked, no WebGL) show a calm fallback instead of a blank box.
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const Fallback = (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-sm text-muted">
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15"><RouteIcon className="h-6 w-6 text-accent" /></span>
    3D scene unavailable right now
  </div>
);

export function SplineScene({ scene, className }) {
  return (
    <SceneBoundary fallback={Fallback}>
      <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><span className="loader" role="status" aria-label="Loading 3D scene" /></div>}>
        <Spline scene={scene} className={className} />
      </Suspense>
    </SceneBoundary>
  );
}
