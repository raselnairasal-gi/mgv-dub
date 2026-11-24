import { useState } from 'react';
import { api } from '../api';
import { useAuth } from './auth';
import { useProjects } from './projects';
import { useToast } from './toast';

export function useVote() {
  const { user, openLogin } = useAuth();
  const { patch } = useProjects();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const vote = async (id: string, name: string, onDone?: (r: { voteCount: number; votedByMe: boolean }) => void) => {
    if (!user) return openLogin('Войдите, чтобы проголосовать за озвучку игры');
    setBusy(id);
    try {
      const r = await api.vote(id);
      patch(id, { voteCount: r.voteCount, votedByMe: r.votedByMe });
      onDone?.(r);
      toast(r.votedByMe ? `Голос за «${name}» засчитан` : `Голос за «${name}» отозван`, r.votedByMe ? 'ok' : 'info');
    } catch (e) {
      toast((e as Error).message, 'err');
    } finally {
      setBusy(null);
    }
  };
  return { vote, busy };
}
