import type { GameInfo } from './types';

const img = (id: number, f: string) => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/${f}`;

/** Запасной вариант, если Steam недоступен: только картинки по стандартным путям */
export const fallbackGameInfo = (id: number): GameInfo => ({
  shortDescription: '',
  aboutHtml: '',
  genres: [],
  developers: [],
  publishers: [],
  releaseDate: '',
  heroImage: img(id, 'library_hero.jpg'),
  background: img(id, 'page_bg_raw.jpg'),
  screenshots: [],
  trailers: [],
});

// Убираем из HTML Steam всё, кроме безопасной разметки текста
function sanitize(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'IMG']);
  const walk = (el: Element) => {
    for (const c of [...el.children]) {
      if (!allowed.has(c.tagName)) {
        c.replaceWith(...c.childNodes);
        continue;
      }
      for (const a of [...c.attributes]) if (!(c.tagName === 'IMG' && a.name === 'src')) c.removeAttribute(a.name);
      if (c.tagName === 'IMG') {
        const src = c.getAttribute('src') ?? '';
        if (!src.startsWith('https://')) c.remove();
        else c.setAttribute('loading', 'lazy');
      }
      walk(c);
    }
  };
  // несколько проходов, т.к. replaceWith «поднимает» вложенные элементы
  for (let i = 0; i < 4; i++) walk(doc.body);
  return doc.body.innerHTML;
}

type SteamResp = { success: boolean; data: any } | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

function mapSteam(id: number, v: SteamResp): GameInfo {
  if (!v?.success || !v.data) return fallbackGameInfo(id);
  const d = v.data;
  const fb = fallbackGameInfo(id);
  return {
    shortDescription: d.short_description ?? '',
    aboutHtml: sanitize(d.about_the_game ?? ''),
    genres: (d.genres ?? []).map((g: { description: string }) => g.description),
    developers: d.developers ?? [],
    publishers: d.publishers ?? [],
    releaseDate: d.release_date?.date ?? '',
    heroImage: fb.heroImage,
    background: d.background_raw ?? fb.background,
    screenshots: (d.screenshots ?? []).map((s: { path_thumbnail: string; path_full: string }) => ({ thumb: s.path_thumbnail, full: s.path_full })),
    trailers: (d.movies ?? [])
      .map((m: { id: number; name: string; thumbnail: string; hls_h264?: string; mp4?: { max?: string; 480?: string } }) => ({
        id: m.id,
        name: m.name,
        thumbnail: m.thumbnail,
        hls: m.hls_h264,
        mp4: m.mp4?.max ?? m.mp4?.[480],
      }))
      .filter((t: { hls?: string; mp4?: string }) => t.hls || t.mp4),
    metacritic: d.metacritic?.score,
  };
}

const getJson = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error(String(r.status));
    return r.json();
  });

const cache = new Map<number, Promise<GameInfo>>();

/**
 * 1) Заранее скачанный файл public/steam/<id>.json (npm run steam) — работает на любом статическом хостинге.
 * 2) Если файла нет — живой запрос к Steam через прокси dev-сервера / Vercel.
 */
export function fetchSteamGameInfo(id: number): Promise<GameInfo> {
  if (!cache.has(id)) {
    const p = getJson(`${import.meta.env.BASE_URL}steam/${id}.json`)
      .then((v: SteamResp) => mapSteam(id, v))
      .catch(() => getJson(`${import.meta.env.BASE_URL}steam-api/appdetails?appids=${id}&cc=us&l=russian`).then((j) => mapSteam(id, j?.[id])))
      .catch(() => {
        cache.delete(id);
        return fallbackGameInfo(id);
      });
    cache.set(id, p);
  }
  return cache.get(id)!;
}
