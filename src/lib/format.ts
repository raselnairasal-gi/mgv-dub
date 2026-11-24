import type { ProjectState } from '../api';

export const plural = (n: number, one: string, few: string, many: string) => {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
};

export const num = (n: number) => n.toLocaleString('ru-RU');
export const rub = (n: number) => `${num(n)} ₽`;
export const date = (t: number) => new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
export const steamUrl = (id: number) => `https://store.steampowered.com/app/${id}/`;

export const stateMeta: Record<ProjectState, { label: string; tone: 'lime' | 'cyan' | 'pink' }> = {
  done: { label: 'Озвучена', tone: 'lime' },
  in_progress: { label: 'В работе', tone: 'cyan' },
  suggested: { label: 'Голосование', tone: 'pink' },
};

/** Небольшой стабильный наклон для «хаотичных» элементов: одинаковый для одного id */
export const tilt = (seed: string, max = 2) => {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 1000) / 1000 - 0.5) * 2 * max;
};
