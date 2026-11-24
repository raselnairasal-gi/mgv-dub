// Формат совпадает с тем, что отдаёт /api/home на оригинальном сайте.
export type ProjectState = 'done' | 'in_progress' | 'suggested';

export interface Project {
  id: string;
  name: string;
  state: ProjectState;
  steamAppId: number;
  coverImage: string;
  voteCount: number;
  downloadCount: number;
  /** 0–100 для in_progress */
  progress: number;
  releasedVersion?: string;
  firstReleasedAt?: number;
  createdAt: number;
  updatedAt: number;
  /** Есть в ответе, если пользователь авторизован (в mock — всегда) */
  votedByMe?: boolean;
}

export interface ProjectDetail extends Project {
  description: string;
  linesCount: number;
  voicedLines: number;
  price: number; // ₽, 0 — бесплатно / только по подписке
  includedInSubscription: boolean;
  changelog: { version: string; date: number; note: string }[];
  ownedByMe: boolean;
}

export interface SteamGame {
  steamAppId: number;
  name: string;
  coverImage: string;
}

export type Role = 'user' | 'editor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  subscription: { active: boolean; daysLeft: number; renewPending: boolean } | null;
}

export interface Purchase {
  id: string;
  project: Project;
  version: string;
  purchasedAt: number;
  source: 'site' | 'boosty' | 'subscription';
}

export interface ShopOffer {
  id: string;
  kind: 'subscription' | 'bundle';
  title: string;
  subtitle: string;
  price: number;
  oldPrice?: number;
  period?: string;
  perks: string[];
  accent: 'lime' | 'pink' | 'cyan';
  hot?: boolean;
}

export type PaymentStatus = 'pending' | 'success' | 'fail' | 'refunded';

export interface Api {
  getHome(): Promise<Project[]>;
  getProject(id: string): Promise<ProjectDetail>;
  getGameInfo(steamAppId: number): Promise<GameInfo>;
  vote(id: string): Promise<{ voteCount: number; votedByMe: boolean }>;
  searchSteam(query: string): Promise<SteamGame[]>;
  suggestGame(game: SteamGame): Promise<Project>;

  getMe(): Promise<User | null>;
  requestEmailCode(email: string): Promise<void>;
  verifyEmailCode(email: string, code: string): Promise<User>;
  signOut(): Promise<void>;

  getPurchases(): Promise<Purchase[]>;
  getShop(): Promise<ShopOffer[]>;
  checkout(target: { offerId?: string; projectId?: string }): Promise<{ orderId: string; redirectUrl: string }>;
  getPaymentStatus(orderId: string): Promise<PaymentStatus>;
}

export interface Trailer {
  id: number;
  name: string;
  thumbnail: string;
  /** HLS-плейлист (.m3u8) */
  hls?: string;
  /** Прямой mp4, если есть */
  mp4?: string;
}

export interface GameInfo {
  shortDescription: string;
  /** HTML с описанием из Steam (очищенный) */
  aboutHtml: string;
  genres: string[];
  developers: string[];
  publishers: string[];
  releaseDate: string;
  heroImage: string;
  background: string;
  screenshots: { thumb: string; full: string }[];
  trailers: Trailer[];
  metacritic?: number;
}
