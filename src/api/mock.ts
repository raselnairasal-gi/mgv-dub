import raw from '../mock/projects.json';
import { fetchSteamGameInfo } from './steam';
import type { Api, Project, ProjectDetail, Purchase, ShopOffer, SteamGame, User } from './types';

const delay = (ms = 250 + Math.random() * 350) => new Promise((r) => setTimeout(r, ms));
const LS = 'mgv-mock-state-v1';

interface MockState {
  user: User | null;
  votes: string[];
  owned: string[];
  extra: Project[];
}

function load(): MockState {
  try {
    const s = localStorage.getItem(LS);
    if (s) return JSON.parse(s);
  } catch { /* приватный режим и т.п. */ }
  return { user: null, votes: [], owned: [], extra: [] };
}
let state = load();
const save = () => { try { localStorage.setItem(LS, JSON.stringify(state)); } catch { /* ignore */ } };

const base = raw as Project[];
const all = (): Project[] =>
  [...state.extra, ...base].map((p) => {
    const v = state.votes.includes(p.id);
    return { ...p, voteCount: p.voteCount + (v ? 1 : 0), votedByMe: v };
  });

// детерминированный «рандом» по id — чтобы детали проекта не скакали
function seeded(id: string) {
  let h = 2166136261;
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 10000) / 10000;
}

const blurbs = [
  'Полный русский дубляж: сюжетные катсцены, диалоги в открытом мире и фоновые реплики.',
  'Все сюжетные сцены, побочные задания и случайные диалоги — на русском.',
  'Озвучка ставится поверх лицензии одним установщиком через приложение MGV на ПК.',
  'Синхронизация с липсинком, сведение под игровой микс, субтитры остаются на выбор.',
];

function detail(p: Project): ProjectDetail {
  const r = seeded(p.id);
  const lines = Math.round(4000 + r() * 60000);
  const done = p.state === 'done';
  return {
    ...p,
    description: blurbs.slice(0, 2 + Math.floor(r() * 3)).join(' '),
    linesCount: p.state === 'suggested' ? 0 : lines,
    voicedLines: done ? lines : Math.round((lines * p.progress) / 100),
    price: done ? [199, 249, 299, 349, 399][Math.floor(r() * 5)] : 0,
    includedInSubscription: done,
    changelog: done
      ? [
          { version: p.releasedVersion ?? 'v1.0', date: p.updatedAt, note: 'Исправлены рассинхроны в катсценах, перезаписаны 140 реплик.' },
          { version: 'v0.9', date: p.firstReleasedAt ?? p.createdAt, note: 'Первый публичный релиз.' },
        ]
      : [],
    votedByMe: state.votes.includes(p.id),
    ownedByMe: state.owned.includes(p.id) || !!state.user?.subscription?.active && done,
  };
}

const offers: ShopOffer[] = [
  {
    id: 'sub-month', kind: 'subscription', title: 'Подписка MGV', subtitle: 'Все готовые озвучки', price: 399, period: 'мес',
    perks: ['Все релизы каталога', 'Ранний доступ к бета-версиям', 'Обновления без доплат', '×2 вес голоса в голосовании'],
    accent: 'lime', hot: true,
  },
  {
    id: 'sub-year', kind: 'subscription', title: 'Подписка на год', subtitle: 'Два месяца в подарок', price: 3990, oldPrice: 4788, period: 'год',
    perks: ['Всё из месячной подписки', 'Именная строка в титрах', 'Закрытый канал с превью'], accent: 'pink',
  },
  {
    id: 'bundle-batman', kind: 'bundle', title: 'Набор «Аркхем»', subtitle: 'Origins + City + Knight', price: 599, oldPrice: 897,
    perks: ['Три озвучки навсегда', 'Без подписки'], accent: 'cyan',
  },
];

export const mockApi: Api = {
  async getHome() { await delay(); return all(); },

  getGameInfo: (steamAppId) => fetchSteamGameInfo(steamAppId),

  async getProject(id) {
    await delay(150);
    const p = all().find((x) => x.id === id);
    if (!p) throw new Error('Проект не найден');
    return detail(p);
  },

  async vote(id) {
    await delay(200);
    if (!state.user) throw new Error('Войдите, чтобы проголосовать за озвучку игры');
    const voted = state.votes.includes(id);
    state.votes = voted ? state.votes.filter((v) => v !== id) : [...state.votes, id];
    save();
    const p = all().find((x) => x.id === id)!;
    return { voteCount: p.voteCount, votedByMe: !voted };
  },

  async searchSteam(q) {
    await delay(500);
    const pool: SteamGame[] = [
      [1091500, 'Cyberpunk 2077'], [292030, 'The Witcher 3: Wild Hunt'], [1245620, 'ELDEN RING'],
      [990080, 'Hogwarts Legacy'], [1086940, "Baldur's Gate 3"], [2050650, 'Resident Evil 4'],
      [1817070, "Marvel's Spider-Man Remastered"], [1593500, 'God of War'], [1888930, 'The Last of Us Part I'],
      [2358720, 'Black Myth: Wukong'], [377160, 'Fallout 4'], [489830, 'The Elder Scrolls V: Skyrim Special Edition'],
      [1716740, 'Starfield'], [601150, 'Devil May Cry 5'], [1659040, 'HITMAN World of Assassination'],
    ].map(([id, name]) => ({ steamAppId: id as number, name: name as string, coverImage: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg` }));
    const ql = q.toLowerCase();
    const known = new Set(all().map((p) => p.steamAppId));
    return pool.filter((g) => g.name.toLowerCase().includes(ql) && !known.has(g.steamAppId));
  },

  async suggestGame(g) {
    await delay();
    if (!state.user) throw new Error('Войдите, чтобы добавить игру в голосование за озвучку');
    const now = Date.now();
    const p: Project = {
      id: 'proj_' + Math.random().toString(36).slice(2, 12), name: g.name, state: 'suggested', steamAppId: g.steamAppId,
      coverImage: g.coverImage, voteCount: 0, downloadCount: 0, progress: 0, createdAt: now, updatedAt: now,
    };
    state.extra.unshift(p);
    state.votes.push(p.id);
    save();
    return { ...p, voteCount: 1, votedByMe: true };
  },

  async getMe() { await delay(120); return state.user; },
  async requestEmailCode() { await delay(600); },
  async verifyEmailCode(email, code) {
    await delay(500);
    if (code.trim().length < 4) throw new Error('Неверный код. В mock-режиме подойдёт любой из 4+ цифр.');
    state.user = {
      id: 'u_' + email, name: email.split('@')[0], email, role: 'user',
      subscription: { active: true, daysLeft: 17, renewPending: false },
    };
    save();
    return state.user;
  },
  async signOut() { await delay(200); state.user = null; save(); },

  async getPurchases() {
    await delay();
    if (!state.user) throw new Error('Войдите, чтобы увидеть свои покупки');
    const ps = all();
    const list: Purchase[] = [];
    const done = ps.filter((p) => p.state === 'done');
    for (const p of done.slice(0, 3)) list.push({ id: 'ord_' + p.id, project: p, version: p.releasedVersion ?? 'v1.0', purchasedAt: p.updatedAt, source: 'subscription' });
    for (const id of state.owned) {
      const p = ps.find((x) => x.id === id);
      if (p && !list.some((l) => l.project.id === id)) list.unshift({ id: 'ord_' + id, project: p, version: p.releasedVersion ?? 'v1.0', purchasedAt: Date.now(), source: 'site' });
    }
    return list;
  },

  async getShop() { await delay(); return offers; },

  async checkout({ projectId }) {
    await delay(700);
    if (!state.user) throw new Error('Войдите, чтобы оформить покупку');
    const orderId = 'MGV-' + Math.floor(100000 + Math.random() * 900000);
    if (projectId && !state.owned.includes(projectId)) { state.owned.push(projectId); save(); }
    return { orderId, redirectUrl: `/payment/success?order=${orderId}` };
  },

  async getPaymentStatus() { await delay(1200); return 'success'; },
};
