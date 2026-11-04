import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function ProductRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setOverflow(max > 1); setProgress(max > 0 ? el.scrollLeft / max * 100 : 0);
    };
    const observer = new ResizeObserver(update); observer.observe(el);
    el.addEventListener('scroll', update, { passive: true }); update();
    return () => { observer.disconnect(); el.removeEventListener('scroll', update); };
  }, []);
  const shift = (direction: number) => {
    const el = ref.current!;
    const card = el.firstElementChild as HTMLElement;
    el.scrollBy({ left: direction * (card.offsetWidth + 18), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <div className="rail-wrap">
    <div id="new-in-products" className="rail" ref={ref} aria-label="Новые товары">{children}</div>
    {overflow && <div className="rail-controls">
      <span className="rail-hint">ЛИСТАЙТЕ КОЛЛЕКЦИЮ</span>
      <input className="rail-progress" aria-label="Положение товарной ленты" type="range" min="0" max="100" value={progress} onChange={e => {
        const el = ref.current!; el.scrollTo({ left: Number(e.target.value) / 100 * (el.scrollWidth - el.clientWidth), behavior: 'instant' });
      }} style={{ '--progress': `${progress}%` } as React.CSSProperties} />
      <div className="rail-arrows"><button aria-label="Предыдущие товары" aria-controls="new-in-products" disabled={progress < 1} onClick={() => shift(-1)}><ArrowLeft size={19}/></button><button aria-label="Следующие товары" aria-controls="new-in-products" disabled={progress > 99} onClick={() => shift(1)}><ArrowRight size={19}/></button></div>
    </div>}
  </div>;
}
