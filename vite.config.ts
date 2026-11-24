import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Если машина ходит в интернет через корпоративный прокси (HTTPS_PROXY) — используем его
const envProxy = process.env.HTTPS_PROXY || process.env.https_proxy;

// Steam Store API не отдаёт CORS-заголовки, поэтому ходим к нему через прокси dev/preview-сервера.
// Когда появится свой API — он должен отдавать эти данные сам (см. src/api/steam.ts).
const steamProxy = {
  '^/(?:[^/]+/)?steam-api/': {
    target: 'https://store.steampowered.com',
    changeOrigin: true,
    ...(envProxy ? { agent: new HttpsProxyAgent(envProxy) } : {}),
    rewrite: (p: string) => p.replace(/^\/(?:[^/]+\/)?steam-api/, '/api'),
  },
};

export default defineConfig({
  // Для GitHub Pages сайт живёт в подпапке /<репозиторий>/ — задаётся через VITE_BASE при сборке
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: { host: true, port: 5173, proxy: steamProxy },
  preview: { host: true, port: 4173, proxy: steamProxy },
});
