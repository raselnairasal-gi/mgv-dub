import { ArrowUpRight, Crown, Vote } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectState } from '../api';
import { Catalog } from '../components/Catalog';
import { Hero } from '../components/Hero';
import { Marquee } from '../components/Marquee';
import { Rail } from '../components/Rail';
import { useProjects } from '../lib/projects';

export function Home() {
  const { projects } = useProjects();
  const [tab, setTab] = useState<'all' | ProjectState>('done');

  const { released, inWork, voting } = useMemo(() => {
    const xs = projects ?? [];
    return {
      released: xs.filter((p) => p.state === 'done').sort((a, b) => (b.firstReleasedAt ?? 0) - (a.firstReleasedAt ?? 0)).slice(0, 6),
      inWork: projects ? xs.filter((p) => p.state === 'in_progress').sort((a, b) => b.progress - a.progress) : null,
      voting: projects ? xs.filter((p) => p.state === 'suggested').sort((a, b) => b.voteCount - a.voteCount).slice(0, 10) : null,
    };
  }, [projects]);

  const jump = (t: 'all' | ProjectState) => {
    setTab(t);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Hero items={released} />
      <Marquee items={['игры говорят по-русски', 'трейлеры и описания', 'русский дубляж', 'голосуйте за следующую', 'ставится в один клик']} />
      <Catalog tab={tab} setTab={setTab} />
      <Rail num="02/" title="В работе" accent="cyan" items={inWork} onAll={() => jump('in_progress')} note="← пишем прямо сейчас" />
      <Rail num="03/" title="Голосование" accent="pink" items={voting} onAll={() => jump('suggested')} note="решаете вы ♥" />
      <section className="cta-row">
        <button className="cta cta-pink" onClick={() => jump('all')}>
          <Vote size={28} />
          <span>Все проекты и предложения игр</span>
          <ArrowUpRight className="cta-arrow" />
        </button>
        <Link className="cta cta-lime" to="/shop">
          <Crown size={28} />
          <span>Подписка и озвучки</span>
          <ArrowUpRight className="cta-arrow" />
        </Link>
      </section>
    </>
  );
}
