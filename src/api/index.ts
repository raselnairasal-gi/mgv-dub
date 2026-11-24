import { httpApi } from './http';
import { mockApi } from './mock';

export * from './types';

const useMock = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';
export const api = useMock ? mockApi : httpApi;
export const isMock = useMock;
