const ITEMS = ['OpenStreetMap', 'data.gov.in', 'NCRB', 'Open Routing', 'Transparent AI', 'Community Reports'];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <section className="border-y border-white/10 py-9" aria-label="Data and technology">
      <p className="mb-6 text-center text-sm text-muted">Powered by open mapping &amp; transparent data</p>
      <div className="marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {row.map((t, i) => <span key={i} className="mx-8 whitespace-nowrap text-xl font-medium tracking-tight text-white/35 transition hover:text-white/80">{t}</span>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
