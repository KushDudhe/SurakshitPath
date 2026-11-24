import { BadgeCheck, Eye, Layers, Radio, ShieldCheck, SlidersHorizontal, Database } from 'lucide-react';
import Reveal from './Reveal';
import FeatureCard from './FeatureCard';
import Bar from './Bar';

export function SectionHead({ eyebrow, title, sub, center = true }) {
  return (
    <Reveal className={`mb-12 ${center ? 'mx-auto text-center' : ''} max-w-2xl`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="h2">{title}</h2>
      {sub && <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">{sub}</p>}
    </Reveal>
  );
}

const STEPS = [
  ['Enter your journey', 'Choose where you are starting, where you are going and when.'],
  ['Generate multiple routes', 'See a fast, a balanced and a safety-priority option side by side.'],
  ['Understand route factors', 'Every score is broken down into six factors with data confidence.'],
  ['Choose based on your preferences', 'Slide between travel time and safety factors. You stay in control.'],
];
export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1200px] px-5 py-24">
      <SectionHead eyebrow="How it works" title="From a destination to an informed decision" />
      <div className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
        <div className="absolute left-[12.5%] right-[12.5%] top-[22px] hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block" />
        {STEPS.map(([t, d], i) => (
          <Reveal key={t} delay={i * 100} className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center">
            <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/40 bg-[#0B0B0D] text-sm font-semibold text-accent shadow-[0_0_24px_-6px_rgba(0,195,201,.7)]">0{i + 1}</span>
            <div><h3 className="text-[17px] font-semibold tracking-tight">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{d}</p></div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  [Eye, 'Transparent Risk Scores', 'Every score shows its factors, weights and data confidence. No black box.'],
  [Radio, 'Live Route Updates', 'When a road closes or an incident is reported, scores and ETAs recalculate.'],
  [Layers, 'Multi-Factor Analysis', 'Lighting, public activity, transport, help points, incidents and road condition.'],
  [BadgeCheck, 'Verified Help Points', 'See staffed help points, police stations and hospitals along each route.'],
  [ShieldCheck, 'Safety Check', 'An unexpected stop or deviation asks “Are you okay?” and can alert trusted contacts.'],
  [SlidersHorizontal, 'User-Controlled Preferences', 'Choose how much travel time you will trade for safety factors.'],
];
export function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1200px] px-5 py-24">
      <SectionHead eyebrow="Features" title="Everything you need to choose a route with confidence" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([icon, title, desc], i) => <FeatureCard key={title} icon={icon} title={title} desc={desc} delay={(i % 3) * 90} />)}</div>
    </section>
  );
}

export function BiasAware() {
  return (
    <section id="safety" className="mx-auto max-w-[1200px] px-5 py-24">
      <SectionHead eyebrow="Bias-aware by design" title="Context, not labels." sub="SurakshitPath evaluates route-level conditions instead of permanently labeling entire neighborhoods as unsafe." />
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal><div className="card card-hover h-full p-6">
          <div className="flex items-center gap-2 text-sm font-medium"><span className="dot-live h-2 w-2 rounded-full bg-accent" />Current Conditions</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">Lighting, crowd activity and road status are read for the exact route and time, not for a whole area.</p>
          <div className="mt-5 flex flex-wrap gap-1.5">{['Lit at 9:30 PM', 'Buses running', 'Road open'].map((t) => <span key={t} className="chip !text-white/80">{t}</span>)}</div>
        </div></Reveal>
        <Reveal delay={90}><div className="card card-hover h-full p-6">
          <div className="text-sm font-medium">Recent Data</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">Reports fade with age and need verification. One old report does not define a street forever.</p>
          <div className="mt-5 flex h-12 items-end gap-1.5">{[38, 62, 45, 80, 30, 55, 22].map((h, i) => <span key={i} className="flex-1 rounded-sm bg-accent/60" style={{ height: `${h}%`, opacity: 0.35 + i * 0.09 }} />)}</div>
        </div></Reveal>
        <Reveal delay={180}><div className="card card-hover h-full p-6">
          <div className="text-sm font-medium">Data Confidence</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">If there is not enough data, we say “Limited data available”. We never assume a route is unsafe.</p>
          <div className="mt-5"><div className="mb-1.5 flex justify-between text-xs"><span className="text-muted">Coverage</span><span>78%</span></div><Bar value={78} color="#00C3C9" /></div>
        </div></Reveal>
      </div>
    </section>
  );
}

const SOURCES = [
  ['NCRB / Crime in India', 'Aggregate historical statistics, used for context only.', 'Reference · not integrated in this prototype'],
  ['data.gov.in', 'Open government datasets on infrastructure and services.', 'Planned integration'],
  ['OpenStreetMap', 'Roads, lighting tags, transport stops and the base map.', 'Base map in use'],
  ['Simulated real-time data', 'Live incidents, closures and crowd levels.', 'SIMULATED — DEMONSTRATION ONLY'],
];
export function DataSources({ id = 'data' }) {
  return (
    <section id={id} className="mx-auto max-w-[1200px] px-5 py-24">
      <SectionHead eyebrow="Data sources" title="Built on transparent data" sub="Know where every number comes from and what is only a demonstration." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SOURCES.map(([t, d, tag], i) => (
          <Reveal key={t} delay={i * 80}><div className="card card-hover h-full p-5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5"><Database className="h-4 w-4 text-accent" /></span>
            <h3 className="mt-4 text-[15px] font-semibold">{t}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{d}</p>
            <span className={`mt-4 inline-block rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide ${i === 3 ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-white/10 bg-white/5 text-muted'}`}>{tag}</span>
          </div></Reveal>
        ))}
      </div>
    </section>
  );
}
