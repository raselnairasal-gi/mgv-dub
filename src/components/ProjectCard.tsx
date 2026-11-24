import { ExternalLink, Heart, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../api';
import { num, steamUrl, tilt } from '../lib/format';
import { useVote } from '../lib/useVote';
import { StateBadge } from './Badge';

export function useOpenProject() {
  const nav = useNavigate();
  return (id: string) => nav(`/game/${id}`);
}

export function ProjectCard({ p, index = 0 }: { p: Project; index?: number }) {
  const open = useOpenProject();
  const { vote, busy } = useVote();
  const t = tilt(p.id, 1.2);
  const extra =
    p.state === 'done' ? p.releasedVersion : p.state === 'in_progress' ? `${p.progress}%` : undefined;

  return (
    <article
      className={`card card-${p.state}`}
      style={{ '--tilt': `${t}deg`, '--i': index } as React.CSSProperties}
    >
      <button className="card-hit" onClick={() => open(p.id)} aria-label={`Открыть проект ${p.name}`} />
      <div className="card-cover">
        <img src={p.coverImage} alt="" loading="lazy" decoding="async" />
        <StateBadge state={p.state} extra={extra} sticker />
      </div>
      {p.state === 'in_progress' && (
        <div className="card-progress" aria-label={`Готово ${p.progress}%`}>
          <span style={{ width: `${Math.max(p.progress, 2)}%` }} />
        </div>
      )}
      <div className="card-body">
        <h3 className="card-title">{p.name}</h3>
        <div className="card-meta">
          {p.state === 'done' && (
            <span className="meta-chip" title="Скачиваний">
              <Download size={14} /> {num(p.downloadCount)}
            </span>
          )}
          {p.state === 'suggested' && (
            <button
              className={`vote-btn ${p.votedByMe ? 'is-on' : ''}`}
              onClick={() => vote(p.id, p.name)}
              disabled={busy === p.id}
              aria-pressed={!!p.votedByMe}
              title={p.votedByMe ? 'Вы просили озвучить эту игру' : 'Проголосовать за озвучку'}
            >
              <Heart size={15} fill={p.votedByMe ? 'currentColor' : 'none'} /> {num(p.voteCount)}
            </button>
          )}
          {p.state === 'in_progress' && <span className="meta-chip">в студии</span>}
          <a className="steam-btn" href={steamUrl(p.steamAppId)} target="_blank" rel="noreferrer" title="Открыть страницу в Steam">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

export function CardSkeleton() {
  return (
    <div className="card card-skel" aria-hidden="true">
      <div className="card-cover" />
      <div className="card-body"><div className="skel-line" /><div className="skel-line short" /></div>
    </div>
  );
}
