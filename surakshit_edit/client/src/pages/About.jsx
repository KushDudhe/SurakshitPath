import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import Reveal from '../components/Reveal';
import { BiasAware, DataSources, SectionHead } from '../components/Sections';
import { DEFAULT_WEIGHTS, FACTORS } from '../lib/scoring';

const FAQ = [
  ['Does SurakshitPath guarantee my safety?', 'No. Scores are estimates built from route-level conditions and, in this prototype, demo data. They help you compare options. They are not a guarantee.'],
  ['Why don’t you label neighbourhoods as unsafe?', 'Conditions change by street and by hour. Labelling whole areas causes bias and hides useful detail, so we score routes and show the factors behind each score.'],
  ['What does “Limited data available” mean?', 'We do not have enough information for that part of the route. We say so instead of assuming it is unsafe.'],
  ['Is the real-time data real?', 'Not in this prototype. Live conditions are simulated and labelled DEMO DATA.'],
  ['Does the safety check call the police?', 'No. In this prototype the “Are you okay?” flow is a simulation. In an emergency, call 112.'],
];
const ADDS = ['Lighting', 'Public activity', 'Transport', 'Help points', 'Recent incidents', 'Road conditions', 'Time-of-night calibration'];

export default function About() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <section className="relative px-5 pb-10 pt-20 text-center">
        <div className="pointer-events-none absolute left-1/2 top-6 -z-10 h-[360px] w-[640px] max-w-full -translate-x-1/2 rounded-full bg-accent/15 blur-[110px]" />
        <p className="eyebrow fade-up">About</p>
        <h1 className="fade-up mx-auto mt-4 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]" style={{ animationDelay: '80ms' }}>Navigation should explain the journey, not just draw the route.</h1>
        <p className="fade-up mx-auto mt-5 max-w-2xl text-muted" style={{ animationDelay: '160ms' }}>Traditional navigation often focuses on distance and travel time. SurakshitPath adds the context people actually consider when they travel at night.</p>
      </section>

      <section className="mx-auto max-w-[1000px] px-5 py-10">
        <Reveal><div className="card p-6 sm:p-8">
          <h2 className="text-lg font-semibold">What SurakshitPath adds</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">{ADDS.map((a) => <li key={a} className="flex items-center gap-2.5 text-[15px]"><Check className="h-4 w-4 text-accent" />{a}</li>)}</ul>
          <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/[.06] p-4 text-sm text-amber-100">SurakshitPath provides <strong>estimates, not guarantees</strong>. Use the score and its factors as one input to your own judgement.</div>
        </div></Reveal>
      </section>

      <section id="methodology" className="mx-auto max-w-[1000px] px-5 py-16">
        <SectionHead eyebrow="Methodology" title="An explainable weighted score" sub="Six factors, fixed default weights, and a confidence value that tells you how much data is behind the number." />
        <Reveal><div className="card overflow-x-auto p-6">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead className="text-xs text-muted"><tr><th className="pb-3 font-medium">Factor</th><th className="pb-3 text-right font-medium">Default weight</th></tr></thead>
            <tbody className="divide-y divide-white/5">{FACTORS.map((f) => <tr key={f.key}><td className="py-2.5">{f.label}</td><td className="py-2.5 text-right tabular-nums">{DEFAULT_WEIGHTS[f.key]}%</td></tr>)}</tbody>
          </table>
          <p className="mt-5 text-[13px] leading-relaxed text-muted">Safety Score = weighted factor score. Data Confidence = weighted share of available data. A factor with too little data is left out and the rest are rescaled. After 11 PM, lighting and public activity count for more (time-of-night calibration).</p>
        </div></Reveal>
      </section>

      <BiasAware />
      <DataSources />

      <section id="docs" className="mx-auto max-w-[1000px] px-5 py-16">
        <SectionHead eyebrow="Documentation" title="How the prototype is built" />
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal><div className="card h-full p-6"><h3 className="font-semibold">Client</h3><p className="mt-2 text-sm leading-relaxed text-muted">React + Vite + Tailwind, React Router, Leaflet (OpenStreetMap data, CARTO dark tiles), Recharts and Lucide icons. Scoring lives in <code className="text-accent">src/lib/scoring.js</code> and runs entirely in the browser.</p></div></Reveal>
          <Reveal delay={90}><div className="card h-full p-6"><h3 className="font-semibold">Server (optional)</h3><p className="mt-2 text-sm leading-relaxed text-muted">Node + Express + PostgreSQL (pg). Endpoints: <code className="text-accent">/api/journeys</code>, <code className="text-accent">/api/reports</code>, <code className="text-accent">/api/contacts</code>, <code className="text-accent">/api/score</code>. Without the server, data stays in this browser.</p></div></Reveal>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[800px] px-5 py-16">
        <SectionHead eyebrow="FAQ" title="Questions people ask" />
        <div className="space-y-2">
          {FAQ.map(([q, a], i) => (
            <div key={q} className="card">
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 p-5 text-left text-[15px] font-medium">{q}<ChevronDown className={`h-4 w-4 shrink-0 text-muted transition ${open === i ? 'rotate-180' : ''}`} /></button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}><div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-muted">{a}</p></div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1000px] gap-4 px-5 pb-8 md:grid-cols-2">
        <div id="privacy" className="card p-6"><h3 className="font-semibold">Privacy</h3><p className="mt-2 text-sm leading-relaxed text-muted">This prototype stores journeys, reports and contacts in your browser (and in your own database if you run the server). Trusted-contact sharing is simulated.</p></div>
        <div id="contact" className="card p-6"><h3 className="font-semibold">Contact</h3><p className="mt-2 text-sm leading-relaxed text-muted">SurakshitPath is a college hackathon project. Add your team’s contact details here before submission.</p></div>
      </section>
    </>
  );
}
