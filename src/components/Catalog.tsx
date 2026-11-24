import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Project, ProjectState } from '../api';
import { useProjects } from '../lib/projects';
import { CardSkeleton, ProjectCard } from './ProjectCard';
import { SteamResults } from './SteamResults';

type Tab = 'all' | ProjectState;
type Sort = 'default' | 'name' | 'downloads';
const tabs: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Все проекты' },
  { id: 'done', label: 'Озвученные' },
  { id: 'in_progress', label: 'В работе' },
  { id: 'suggested', label: 'Голосование' },
];
const order: Record<ProjectState, number> = { done: 0, in_progress: 1, suggested: 2 };
const PAGE = 12;

export function Catalog({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { projects, error, reload } = useProjects();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('default');
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [tab, q, sort]);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: 0, done: 0, in_progress: 0, suggested: 0 };
    projects?.forEach((p) => { c.all++; c[p.state]++; });
    return c;
  }, [projects]);

  const list = useMemo(() => {
    if (!projects) return null;
    const ql = q.trim().toLowerCase();
    let xs = projects.filter((p) => (tab === 'all' || p.state === tab) && (!ql || p.name.toLowerCase().includes(ql)));
    const cmp: Record<Sort, (a: Project, b: Project) => number> = {
      default: (a, b) =>
        order[a.state] - order[b.state] ||
        (a.state === 'done' ? (b.firstReleasedAt ?? 0) - (a.firstReleasedAt ?? 0)
          : a.state === 'suggested' ? b.voteCount - a.voteCount : b.progress - a.progress),
      name: (a, b) => a.name.localeCompare(b.name, 'ru'),
      downloads: (a, b) => b.downloadCount - a.downloadCount || b.voteCount - a.voteCount,
    };
    xs = [...xs].sort(cmp[sort]);
    return xs;
  }, [projects, tab, q, sort]);

  return (
    <section className="catalog" id="catalog">
      <div className="section-head">
        <span className="section-num">01/</span>
        <h2 className="section-title">Каталог <span className="hl hl-lime">озвучек</span></h2>
      </div>

      <div className="catalog-controls">
        <div className="tabs" role="tablist" aria-label="Фильтр озвучек">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab tab-${t.id} ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}<sup>{counts[t.id]}</sup>
            </button>
          ))}
        </div>
        <div className="catalog-tools">
          <label className="search">
            <Search size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти игру" aria-label="Поиск" />
            {q && <button onClick={() => setQ('')} aria-label="Очистить поиск"><X size={16} /></button>}
          </label>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Сортировка игр">
            <option value="default">По умолчанию</option>
            <option value="name">По имени: А–Я</option>
            <option value="downloads">По скачиваниям</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="empty">
          <p>Не удалось загрузить каталог. Попробуйте ещё раз.</p>
          <button className="btn btn-primary" onClick={reload}>Попробовать снова</button>
        </div>
      )}

      {!error && (
        <div className="grid">
          {!list && Array.from({ length: 8 }, (_, k) => <CardSkeleton key={k} />)}
          {list?.slice(0, limit).map((p, k) => <ProjectCard key={p.id} p={p} index={k % PAGE} />)}
        </div>
      )}

      {list && list.length === 0 && !q && (
        <div className="empty"><p>{tab === 'in_progress' ? 'Новые проекты появятся здесь, как только начнётся работа.' : 'Здесь пока нет готовых озвучек'}</p></div>
      )}

      {list && limit < list.length && (
        <div className="center">
          <button className="btn btn-outline" onClick={() => setLimit((l) => l + PAGE)}>
            Показать ещё <sup>{list.length - limit}</sup>
          </button>
        </div>
      )}

      {list && q.trim() && (
        <>
          {list.length === 0 && <p className="muted center">В каталоге нет совпадений. Ниже — результаты поиска в Steam. Игру можно добавить в голосование.</p>}
          <SteamResults query={q} />
        </>
      )}
    </section>
  );
}
