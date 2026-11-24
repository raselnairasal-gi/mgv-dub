import { fetchSteamGameInfo } from './steam';
import type { Api } from './types';

/**
 * Реальный API. /api/home взят с оригинального сайта; остальное идёт через /api/rpc/<method>
 * (так устроен оригинал: payments.shop, payments.checkTransaction, auth.signOut и т.д.).
 * Когда пришлёте документацию — поправить имена методов можно здесь, в одном месте.
 */
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let msg = `Ошибка сервера (${res.status})`;
    try { const j = await res.json(); msg = j.message ?? j.error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const rpc = <T>(method: string, input?: unknown) =>
  req<T>(`/api/rpc/${method}`, { method: 'POST', body: JSON.stringify(input ?? {}) });

export const httpApi: Api = {
  getHome: () => req('/api/home'),
  getProject: (id) => rpc('projects.get', { id }),
  // Пока берём из Steam через прокси; можно заменить на свой метод API
  getGameInfo: (steamAppId) => fetchSteamGameInfo(steamAppId),
  vote: (id) => rpc('projects.vote', { id }),
  searchSteam: (query) => rpc('steam.search', { query }),
  suggestGame: (game) => rpc('projects.suggest', game),
  getMe: () => rpc('auth.me'),
  requestEmailCode: (email) => rpc('auth.requestEmailCode', { email }),
  verifyEmailCode: (email, code) => rpc('auth.verifyEmailCode', { email, code }),
  signOut: () => rpc('auth.signOut'),
  getPurchases: () => rpc('purchases.list'),
  getShop: () => rpc('payments.shop'),
  checkout: (target) => rpc('payments.checkout', target),
  getPaymentStatus: (orderId) => rpc('payments.checkTransaction', { orderId }),
};
