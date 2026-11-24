import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Reveal from '../components/Reveal';
import DashboardMockup from '../components/DashboardMockup';
import { BiasAware, DataSources, Features, HowItWorks } from '../components/Sections';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Hero />
      <Reveal><DashboardMockup /></Reveal>
      <div className="mt-24"><Marquee /></div>
      <HowItWorks />
      <Features />
      <BiasAware />
      <DataSources />
      <section className="mx-auto max-w-[1000px] px-5 pt-8">
        <Reveal>
          <div className="card relative overflow-hidden p-10 text-center sm:p-14">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-2/3 -translate-x-1/2 rounded-full bg-accent/20 blur-[80px]" />
            <h2 className="h2 relative">See the safety trade-off before you go.</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-muted">Plan a safer night journey.</p>
            <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/plan" className="btn-primary px-6 py-3">Plan a Safe Route <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/about" className="btn-ghost px-6 py-3">How scoring works</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
