import { useInView } from '../lib/hooks';
import { scoreTone } from '../lib/scoring';

export default function Bar({ value, known = true, delay = 0, color, height = 'h-1.5' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`${height} overflow-hidden rounded-full bg-white/10 ${known ? '' : 'border border-dashed border-white/20 bg-transparent'}`} role="progressbar" aria-valuenow={known ? value : undefined} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full" style={{ width: inView && known ? `${value}%` : '0%', background: color || scoreTone(value), transition: 'width 1s cubic-bezier(.2,.8,.2,1)', transitionDelay: `${delay}ms` }} />
    </div>
  );
}
