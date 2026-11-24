import { useEffect, useRef, useState } from 'react';

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { setInView(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.15, ...options });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line
  }, []);
  return [ref, inView];
}

export function useCountUp(target, active = true, duration = 1100) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (!active) return undefined;
    if (reduced()) { setV(target); from.current = target; return undefined; }
    let raf;
    const start = performance.now(), a = from.current;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const val = a + (target - a) * (1 - Math.pow(1 - p, 3));
      setV(val); from.current = val;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return Math.round(v);
}
