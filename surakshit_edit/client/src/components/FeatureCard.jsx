import Reveal from './Reveal';

export default function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className="card card-hover group h-full p-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 transition group-hover:shadow-[0_0_24px_-4px_rgba(0,195,201,.6)]"><Icon className="h-5 w-5 text-accent" /></span>
        <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
      </div>
    </Reveal>
  );
}
