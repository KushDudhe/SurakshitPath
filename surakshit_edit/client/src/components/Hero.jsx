import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { SplineScene } from '@/components/ui/splite';
import { Spotlight } from '@/components/ui/spotlight';

export default function Hero() {
  const { loadDemo } = useApp();
  return (
    <section className="relative flex min-h-[calc(100vh-72px)] items-center px-5 pb-16 pt-12">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[420px] w-[820px] max-w-full -translate-x-1/2 rounded-full bg-accent/15 blur-[110px]" />
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 lg:grid-cols-2 lg:gap-6">
        <div className="text-center lg:text-left">
          <div className="fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[.14em] text-muted backdrop-blur">
            Safe &amp; Smart Communities • SDG 5 + SDG 11
          </div>
          <h1 className="fade-up mt-7 text-[clamp(2.25rem,5.2vw,60px)] font-semibold leading-[1.05] tracking-[-0.03em]" style={{ animationDelay: '80ms' }}>
            Find a safer path.<br />Understand every route.
          </h1>
          <p className="fade-up mt-5 text-lg text-white/80" style={{ animationDelay: '140ms' }}>Transparent route planning for night travel.</p>
          <p className="fade-up mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base lg:mx-0" style={{ animationDelay: '200ms' }}>
            SurakshitPath compares routes using lighting, public activity, transport access, verified help points, recent incidents and road conditions — while giving you control over the safety versus travel-time trade-off.
          </p>
          <div className="fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: '260ms' }}>
            <Link to="/plan" className="btn-primary px-6 py-3">Plan a Safe Route <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/map" className="btn-ghost px-6 py-3">Explore Live Map</Link>
          </div>
          <div className="fade-up mt-9 flex flex-col items-center gap-1 lg:items-start" style={{ animationDelay: '340ms' }}>
            <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[.16em] text-accent"><span className="dot-live h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_#00C3C9]" />LIVE ROUTE INTELLIGENCE</span>
            <span className="text-xs text-muted">Route conditions update dynamically</span>
          </div>
        </div>

        <div>
          {/* No box: the scene's dark backdrop is blended away (screen) and the edges fade into the page grid */}
          <div className="relative h-[340px] w-full mix-blend-screen sm:h-[440px] lg:h-[560px] [mask-image:radial-gradient(ellipse_72%_72%_at_50%_50%,#000_55%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_72%_72%_at_50%_50%,#000_55%,transparent_100%)]">
            <Spotlight className="-top-20 left-0 from-cyan-300 via-cyan-400 to-cyan-600 md:left-40" size={220} intensity={0.16} />
            <div className="h-full w-full">
              <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
