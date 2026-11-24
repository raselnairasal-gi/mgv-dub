import type { ProjectState } from '../api';
import { stateMeta } from '../lib/format';

export function StateBadge({ state, extra, sticker }: { state: ProjectState; extra?: string; sticker?: boolean }) {
  const m = stateMeta[state];
  return (
    <span className={`badge badge-${m.tone} ${sticker ? 'badge-sticker' : ''}`}>
      <i className="dot" />
      {m.label}
      {extra ? <b>{extra}</b> : null}
    </span>
  );
}
