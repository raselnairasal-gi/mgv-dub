// Скачивает данные игр из Steam (описание, трейлеры, скриншоты) в public/steam/<appid>.json.
// Нужно для статического хостинга (GitHub Pages), где нет прокси к Steam.
// Запуск: npm run steam            — только недостающие
//         npm run steam -- --force — перекачать все
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { HttpsProxyAgent } from 'https-proxy-agent';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'steam');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'src', 'mock', 'projects.json'), 'utf8'));
const force = process.argv.includes('--force');
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

const get = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (body += c));
      res.on('end', () => (res.statusCode === 200 ? resolve(body) : reject(new Error(`HTTP ${res.statusCode}`))));
    }).on('error', reject);
  });

const keep = ['name', 'short_description', 'about_the_game', 'genres', 'developers', 'publishers', 'release_date', 'background_raw', 'screenshots', 'movies', 'metacritic'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(outDir, { recursive: true });
const ids = [...new Set(projects.map((p) => p.steamAppId))];
let ok = 0, skip = 0, fail = 0;

for (const id of ids) {
  const file = path.join(outDir, `${id}.json`);
  if (!force && fs.existsSync(file)) { skip++; continue; }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const j = JSON.parse(await get(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=russian`));
      const v = j[id];
      const data = v?.success ? Object.fromEntries(keep.filter((k) => k in v.data).map((k) => [k, v.data[k]])) : null;
      if (data?.screenshots) data.screenshots = data.screenshots.slice(0, 9);
      if (data?.movies) data.movies = data.movies.slice(0, 6);
      fs.writeFileSync(file, JSON.stringify({ success: !!data, data }));
      ok++;
      break;
    } catch (e) {
      if (attempt === 3) { fail++; console.warn(`✗ ${id}: ${e.message}`); }
      else await sleep(5000 * attempt); // Steam ограничивает частоту запросов
    }
  }
  await sleep(700);
  process.stdout.write(`\r${ok + skip + fail}/${ids.length}`);
}
console.log(`\nготово: скачано ${ok}, уже было ${skip}, ошибок ${fail}`);
