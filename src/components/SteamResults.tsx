import { Plus, Check, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, type SteamGame } from '../api';
import { useAuth } from '../lib/auth';
import { useProjects } from '../lib/projects';
import { useToast } from '../lib/toast';

export function SteamResults({ query }: { query: string }) {
  const [res, setRes] = useState<SteamGame[] | null>(null);
  const [err, setErr] = useState(false);
  const [added, setAdded] = useState<Record<number, 'busy' | 'done'>>({});
  const [n, setN] = useState(0);
  const { user, openLogin } = useAuth();
  const { add } = useProjects();
  const toast = useToast();

  useEffect(() => {
    if (query.trim().length < 2) return;
    let live = true;
    setRes(null); setErr(false);
    const t = setTimeout(() => {
      api.searchSteam(query.trim()).then((r) => live && setRes(r)).catch(() => live && setErr(true));
    }, 350);
    return () => { live = false; clearTimeout(t); };
  }, [query, n]);

  if (query.trim().length < 2) return <p className="muted center">Введите хотя бы два символа, чтобы найти игру в Steam.</p>;

  const suggest = async (g: SteamGame) => {
    if (!user) return openLogin('Войдите, чтобы добавить игру в голосование за озвучку');
    setAdded((a) => ({ ...a, [g.steamAppId]: 'busy' }));
    try {
      const p = await api.suggestGame(g);
      add(p);
      setAdded((a) => ({ ...a, [g.steamAppId]: 'done' }));
      toast(`«${g.name}» добавлена в голосование. Ваш голос учтён.`, 'ok');
    } catch (e) {
      setAdded((a) => { const x = { ...a }; delete x[g.steamAppId]; return x; });
      toast((e as Error).message, 'err');
    }
  };

  return (
    <div className="steam-box">
      <div className="steam-head">
        <span className="sticker sticker-cyan">Игры из Steam</span>
        <p>Не нашли нужную озвучку? Добавьте игру в голосование.</p>
      </div>
      {err && (
        <p className="muted">Не удалось выполнить поиск в Steam. <button className="link" onClick={() => setN(n + 1)}><RefreshCw size={14} /> Повторить</button></p>
      )}
      {!err && !res && <p className="muted pulse">Ищем в Steam…</p>}
      {res && res.length === 0 && <p className="muted">В Steam по запросу «{query}» ничего не найдено.</p>}
      {res && res.length > 0 && (
        <div className="steam-grid">
          {res.map((g) => (
            <div className="steam-card" key={g.steamAppId}>
              <img src={g.coverImage} alt="" loading="lazy" />
              <div>
                <b>{g.name}</b>
                <button className={`btn btn-sm ${added[g.steamAppId] === 'done' ? 'btn-ghost' : 'btn-pink'}`} disabled={!!added[g.steamAppId]} onClick={() => suggest(g)}>
                  {added[g.steamAppId] === 'done' ? <><Check size={15} /> Добавлено</> : added[g.steamAppId] ? 'Добавляем…' : <><Plus size={15} /> Хочу озвучку</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
