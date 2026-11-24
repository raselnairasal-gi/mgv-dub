# MGV Dubbing — фронтенд

React 18 + Vite + TypeScript. Сейчас работает на mock-данных (138 проектов, снятых с /api/home оригинала).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Подключение настоящего API
1. В `.env`: `VITE_USE_MOCK=false`, `VITE_API_URL=https://ваш-домен`.
2. Контракт описан в `src/api/types.ts` (интерфейс `Api`). Реальные вызовы — `src/api/http.ts`:
   `/api/home` как у оригинала, остальное через `/api/rpc/<method>` — имена методов поправить там.
3. Реквизиты/почта поддержки — `src/config.ts`.

## Структура
- `src/api` — типы, mock, http-клиент
- `src/components` — космический фон, hero-карусель, каталог, карточки, модалки проекта и входа
- `src/pages` — Главная, Мои покупки, Подписка, оплата, юр. страницы
- `src/styles/global.css` — вся тема (цвета в `:root`)
