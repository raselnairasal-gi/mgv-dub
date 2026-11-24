import { ArrowRight } from 'lucide-react';
import type { Project } from '../api';
import { CardSkeleton, ProjectCard } from './ProjectCard';

export function Rail({ num, title, accent, items, onAll, note }: {
  num: string; title: string; accent: 'cyan' | 'pink'; items: Project[] | null; onAll: () => void; note?: string;
}) {
  return (
    <section className={`rail rail-${accent}`}>
      <div className="section-head">
        <span className="section-num">{num}</span>
        <h2 className="section-title"><span className={`hl hl-${accent}`}>{title}</span></h2>
        {note && <span className="scribble">{note}</span>}
        <button className="btn btn-ghost btn-sm push" onClick={onAll}>Смотреть все <ArrowRight size={16} /></button>
      </div>
      <div className="rail-track">
        {!items && Array.from({ length: 5 }, (_, k) => <CardSkeleton key={k} />)}
        {items?.map((p, k) => <ProjectCard key={p.id} p={p} index={k} />)}
      </div>
    </section>
  );
}
