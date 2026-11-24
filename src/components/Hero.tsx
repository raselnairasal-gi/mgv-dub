import { ArrowRight, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Project } from '../api';
import { num } from '../lib/format';
import { useOpenProject } from './ProjectCard';

export function Hero({ items }: { items: Project[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const open = useOpenProject();
  const n = items.length;

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), 6500);
    return () => clearTimeout(t);
  }, [i, paused, n]);

  if (!n) return <section className="hero hero-skel" aria-hidden="true" />;
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const cur = items[i];

  return (
    <section
      className="hero"
      aria-roledescription="карусель"
      aria-label="Последние релизы озвучек"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-intro">
        <span className="kicker">✦ последние релизы</span>
        <h1 className="hero-title">
          <span className="ht-1">Игры говорят</span>
          <span className="ht-2">по-русски<span className="ht-dot">.</span></span>
        </h1>
        <p className="hero-sub">Откройте любимые миры с родными голосами</p>
        <div className="hero-nav">
          <button className="icon-btn" onClick={() => go(-1)} aria-label="Предыдущий релиз"><ChevronLeft /></button>
          <span className="hero-count"><b>{String(i + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}</span>
          <button className="icon-btn" onClick={() => go(1)} aria-label="Следующий релиз"><ChevronRight /></button>
        </div>
      </div>

      <div className="hero-stage">
        {items.map((p, k) => {
          const off = ((k - i + n + 1) % n) - 1; // -1, 0, 1 … остальные скрыты
          const pos = off === 0 ? 'cur' : off === -1 ? 'prev' : off === 1 ? 'next' : 'hide';
          return (
            <div key={p.id} className={`hero-slide is-${pos}`} aria-hidden={pos !== 'cur'}>
              <button className="hero-cover" tabIndex={pos === 'cur' ? 0 : -1} onClick={() => (pos === 'cur' ? open(p.id) : setI(k))} aria-label={pos === 'cur' ? `Открыть проект ${p.name}` : `Показать ${p.name}`}>
                <img src={p.coverImage} alt="" />
              </button>
            </div>
          );
        })}
        <div className="hero-caption" key={cur.id}>
          <span className="sticker sticker-lime">Озвучена {cur.releasedVersion}</span>
          <h2>{cur.name}</h2>
          <div className="hero-caption-row">
            <button className="btn btn-primary" onClick={() => open(cur.id)}>Открыть проект <ArrowRight size={18} /></button>
            <span className="meta-chip"><Download size={14} /> {num(cur.downloadCount)}</span>
          </div>
        </div>
      </div>

      <div className="hero-dots" role="tablist" aria-label="Переключение релизов">
        {items.map((p, k) => (
          <button key={p.id} role="tab" aria-selected={k === i} aria-label={`Выбрать ${p.name}`} className={k === i ? 'is-active' : ''} onClick={() => setI(k)}>
            {k === i && !paused && <span className="dot-fill" />}
          </button>
        ))}
      </div>
    </section>
  );
}
