import {
  ArrowLeft, Calendar, Check, ChevronLeft, ChevronRight, Crown, Download, ExternalLink, Heart, MessageSquareText,
  Mic, Play, ShoppingCart, Sparkles, Volume2, VolumeX, X, Building2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type GameInfo, type ProjectDetail, type Trailer } from '../api';
import { fallbackGameInfo } from '../api/steam';
import { StateBadge } from '../components/Badge';
import { HlsVideo } from '../components/HlsVideo';
import { ProjectCard } from '../components/ProjectCard';
import { useAuth } from '../lib/auth';
import { date, num, plural, rub, stateMeta, steamUrl } from '../lib/format';
import { useProjects } from '../lib/projects';
import { useToast } from '../lib/toast';
import { useVote } from '../lib/useVote';

export function Game() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const { user, openLogin } = useAuth();
  const { projects } = useProjects();
  const { vote, busy } = useVote();
  const toast = useToast();

  const [p, setP] = useState<ProjectDetail | null>(null);
  const [info, setInfo] = useState<GameInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [theater, setTheater] = useState<Trailer | null>(null);
  const [shot, setShot] = useState<number | null>(null);
  const [buying, setBuying] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const bgVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setP(null); setErr(null); setInfo(null); setVideoReady(false); setMuted(true);
    api.getProject(id).then((x) => {
      setP(x);
      document.title = `${x.name} — русская озвучка · MGV Dubbing`;
      api.getGameInfo(x.steamAppId).then(setInfo).catch(() => setInfo(fallbackGameInfo(x.steamAppId)));
    }).catch((e) => setErr(e.message));
    return () => { document.title = 'MGV Dubbing — игры говорят по-русски'; };
  }, [id, user]);

  const related = useMemo(
    () => (projects && p ? projects.filter((x) => x.id !== p.id && x.state === p.state).slice(0, 8) : []),
    [projects, p],
  );

  if (err) {
    return (
      <section className="page pay"><div className="pay-card">
        <h1>Проект не найден</h1><p className="muted">{err}</p>
        <Link className="btn btn-primary btn-lg" to="/">На главную</Link>
      </div></section>
    );
  }

  const g = info ?? (p ? fallbackGameInfo(p.steamAppId) : null);
  const heroTrailer = info?.trailers[0];
  const tone = p ? stateMeta[p.state].tone : 'lime';

  const buy = async () => {
    if (!p) return;
    if (!user) return openLogin('Войдите, чтобы купить озвучку');
    setBuying(true);
    try { const r = await api.checkout({ projectId: p.id }); nav(r.redirectUrl); } catch (e) { toast((e as Error).message, 'err'); }
    setBuying(false);
  };

  const toggleSound = () => {
    const v = bgVideo.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  return (
    <div className={`game game-${tone}`}>
      {/* ===== Видео-hero во весь экран ===== */}
      <section className="ghero">
        <div className="ghero-media">
          {g && <img className={`ghero-poster ${videoReady ? 'is-hidden' : ''}`} src={g.heroImage} alt="" onError={(e) => {
            const el = e.currentTarget;
            if (p && el.src !== p.coverImage) el.src = p.coverImage;
            else el.style.display = 'none';
          }} />}
          {heroTrailer && (
            <HlsVideo
              key={heroTrailer.id}
              ref={bgVideo}
              trailer={heroTrailer}
              maxHeight={720}
              autoPlay
              muted
              loop
              className={`ghero-video ${videoReady ? 'is-ready' : ''}`}
              onPlaying={() => setVideoReady(true)}
            />
          )}
          <div className="ghero-shade" />
        </div>

        <div className="ghero-top">
          <button className="chip-btn" onClick={() => (history.length > 1 ? nav(-1) : nav('/'))}><ArrowLeft size={18} /> Назад</button>
          {heroTrailer && videoReady && (
            <button className="chip-btn" onClick={toggleSound} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />} <span className="hide-sm">{muted ? 'Со звуком' : 'Без звука'}</span>
            </button>
          )}
        </div>

        <div className="ghero-content">
          {!p ? (
            <div className="ghero-skel"><div className="skel-line" /><div className="skel-line short" /></div>
          ) : (
            <>
              <div className="ghero-stickers">
                <StateBadge state={p.state} extra={p.state === 'done' ? p.releasedVersion : p.state === 'in_progress' ? `${p.progress}%` : undefined} sticker />
                {p.includedInSubscription && <span className="sticker sticker-pink"><Crown size={13} /> в подписке</span>}
                {g?.genres.slice(0, 2).map((x) => <span key={x} className="sticker sticker-ghost">{x}</span>)}
              </div>
              <h1 className="ghero-title">{p.name}</h1>
              {g?.shortDescription && <p className="ghero-lead">{g.shortDescription}</p>}
              <div className="ghero-actions">
                {p.state === 'done' && (p.ownedByMe ? (
                  <button className="btn btn-primary btn-xl" onClick={() => toast('Скачивание идёт через приложение MGV на ПК', 'info')}>
                    <Download size={20} /> Скачать озвучку {p.releasedVersion}
                  </button>
                ) : (
                  <button className="btn btn-primary btn-xl" onClick={buy} disabled={buying}>
                    <ShoppingCart size={20} /> {buying ? 'Открываем оплату…' : <>Купить озвучку · {rub(p.price)}</>}
                  </button>
                ))}
                {p.state !== 'done' && (
                  <button className={`btn btn-xl ${p.votedByMe ? 'btn-ghost' : 'btn-pink'}`} disabled={busy === p.id} onClick={() => vote(p.id, p.name, (r) => setP({ ...p, ...r }))}>
                    <Heart size={20} fill={p.votedByMe ? 'currentColor' : 'none'} /> {p.votedByMe ? 'Ваш голос учтён' : 'Хочу озвучку'}
                  </button>
                )}
                {heroTrailer && (
                  <button className="btn btn-glass btn-xl" onClick={() => setTheater(heroTrailer)}><Play size={20} fill="currentColor" /> Трейлер</button>
                )}
              </div>
            </>
          )}
        </div>
        <div className="ghero-scroll" aria-hidden="true"><span /></div>
      </section>

      {p && (
        <div className="game-body">
          {/* ===== Цифры ===== */}
          <div className="gstats">
            <div className="gstat"><MessageSquareText /><b>{p.linesCount ? num(p.linesCount) : '—'}</b><small>{p.linesCount ? plural(p.linesCount, 'реплика', 'реплики', 'реплик') : 'реплик пока нет'}</small></div>
            {p.state === 'done' && <div className="gstat"><Sparkles /><b>{p.releasedVersion}</b><small>текущая версия</small></div>}
            {p.state === 'in_progress' && <div className="gstat"><Mic /><b>{p.progress}%</b><small>готово</small></div>}
            <div className="gstat"><Heart /><b>{num(p.voteCount)}</b><small>{plural(p.voteCount, 'голос', 'голоса', 'голосов')}</small></div>
            <div className="gstat"><Download /><b>{num(p.downloadCount)}</b><small>скачиваний</small></div>
          </div>

          {p.state === 'in_progress' && (
            <div className="bigprogress wide">
              <div className="bp-row"><span><Mic size={15} /> Записано {num(p.voicedLines)} из {num(p.linesCount)} реплик</span><b>{p.progress}%</b></div>
              <div className="bp-bar"><span style={{ width: `${Math.max(p.progress, 1.5)}%` }} /></div>
            </div>
          )}

          <div className="gcols">
            <div className="gmain">
              {/* ===== Об озвучке ===== */}
              <section className="gblock">
                <h2 className="gh"><span className="hl hl-lime">Об озвучке</span></h2>
                <p className="glead">
                  {p.state === 'suggested'
                    ? 'Игра в голосовании. Чем больше голосов — тем раньше студия возьмёт её в работу. Добавьте свой голос!'
                    : p.description}
                </p>
                {p.state === 'done' && (
                  <ul className="checks">
                    <li><Check size={18} /> Сюжет, катсцены и побочные диалоги</li>
                    <li><Check size={18} /> Установка в один клик через приложение MGV</li>
                    <li><Check size={18} /> Обновления версии бесплатно</li>
                  </ul>
                )}
              </section>

              {/* ===== Трейлеры ===== */}
              {info && info.trailers.length > 0 && (
                <section className="gblock">
                  <h2 className="gh"><span className="hl hl-pink">Видео</span></h2>
                  <div className="trailers">
                    {info.trailers.slice(0, 6).map((t, k) => (
                      <button key={t.id} className={`trailer ${k === 0 ? 'is-main' : ''}`} onClick={() => setTheater(t)}>
                        <img src={t.thumbnail.replace('movie.293x165', 'movie.600x337')} onError={(e) => { e.currentTarget.src = t.thumbnail; }} alt="" loading="lazy" />
                        <span className="trailer-play"><Play size={k === 0 ? 30 : 20} fill="currentColor" /></span>
                        <span className="trailer-name">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* ===== Скриншоты ===== */}
              {info && info.screenshots.length > 0 && (
                <section className="gblock">
                  <h2 className="gh"><span className="hl hl-cyan">Скриншоты</span></h2>
                  <div className="shots">
                    {info.screenshots.slice(0, 9).map((s, k) => (
                      <button key={s.full} className="shot" onClick={() => setShot(k)} style={{ '--r': `${(k % 3 - 1) * 0.8}deg` } as React.CSSProperties}>
                        <img src={s.thumb} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* ===== Об игре ===== */}
              {info?.aboutHtml && (
                <section className="gblock">
                  <h2 className="gh"><span className="hl hl-orange">Об игре</span></h2>
                  <div className="about" dangerouslySetInnerHTML={{ __html: info.aboutHtml }} />
                </section>
              )}
            </div>

            {/* ===== Боковая панель ===== */}
            <aside className="gside">
              <div className="gcard">
                <img src={p.coverImage} alt="" className="gcard-cover" />
                <dl>
                  {g?.developers.length ? <><dt><Building2 size={15} /> Разработчик</dt><dd>{g.developers.join(', ')}</dd></> : null}
                  {g?.publishers.length ? <><dt><Building2 size={15} /> Издатель</dt><dd>{g.publishers.join(', ')}</dd></> : null}
                  {g?.releaseDate ? <><dt><Calendar size={15} /> Выход игры</dt><dd>{g.releaseDate}</dd></> : null}
                  {p.firstReleasedAt ? <><dt><Sparkles size={15} /> Релиз озвучки</dt><dd>{date(p.firstReleasedAt)}</dd></> : null}
                </dl>
                {g && g.genres.length > 0 && <div className="tags">{g.genres.map((x) => <span key={x}>{x}</span>)}</div>}
                {info?.metacritic && <div className="metacritic"><b>{info.metacritic}</b> Metacritic</div>}
                <a className="btn btn-outline w100" href={steamUrl(p.steamAppId)} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Страница в Steam</a>
              </div>

              {p.state === 'done' && !p.ownedByMe && (
                <Link to="/shop" className="gpromo">
                  <Crown size={26} />
                  <b>Все озвучки по подписке</b>
                  <span>Эта и ещё {Math.max((projects?.filter((x) => x.state === 'done').length ?? 1) - 1, 0)} игр — от 399 ₽/мес</span>
                </Link>
              )}

              {p.changelog.length > 0 && (
                <div className="changelog gcard">
                  <h3>История версий</h3>
                  {p.changelog.map((c) => (
                    <div key={c.version} className="cl-row">
                      <span className="cl-ver">{c.version}</span>
                      <div><small>{date(c.date)}</small><p>{c.note}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>

          {related.length > 0 && (
            <section className="rail">
              <div className="section-head">
                <h2 className="section-title" style={{ fontSize: 'clamp(24px,3vw,36px)' }}>Ещё <span className={`hl hl-${tone}`}>{stateMeta[p.state].label.toLowerCase()}</span></h2>
              </div>
              <div className="rail-track">{related.map((x, k) => <ProjectCard key={x.id} p={x} index={k} />)}</div>
            </section>
          )}
        </div>
      )}

      {/* ===== Кинотеатр ===== */}
      {theater && (
        <div className="theater" onMouseDown={(e) => e.target === e.currentTarget && setTheater(null)}>
          <button className="modal-x" onClick={() => setTheater(null)} aria-label="Закрыть"><X size={20} /></button>
          <div className="theater-box">
            <HlsVideo key={theater.id} trailer={theater} autoPlay controls className="theater-video" onLoadedData={() => bgVideo.current?.pause()} />
            <div className="theater-title">{theater.name}</div>
          </div>
          <TheaterKeys onClose={() => { setTheater(null); bgVideo.current?.play().catch(() => {}); }} />
        </div>
      )}

      {/* ===== Просмотр скриншотов ===== */}
      {shot !== null && info && (
        <div className="theater" onMouseDown={(e) => e.target === e.currentTarget && setShot(null)}>
          <button className="modal-x" onClick={() => setShot(null)} aria-label="Закрыть"><X size={20} /></button>
          <button className="lb-nav lb-prev" onClick={() => setShot((shot - 1 + info.screenshots.length) % info.screenshots.length)} aria-label="Предыдущий"><ChevronLeft /></button>
          <img className="lb-img" src={info.screenshots[shot].full} alt="" />
          <button className="lb-nav lb-next" onClick={() => setShot((shot + 1) % info.screenshots.length)} aria-label="Следующий"><ChevronRight /></button>
          <TheaterKeys
            onClose={() => setShot(null)}
            onPrev={() => setShot((s) => ((s ?? 0) - 1 + info.screenshots.length) % info.screenshots.length)}
            onNext={() => setShot((s) => ((s ?? 0) + 1) % info.screenshots.length)}
          />
        </div>
      )}
    </div>
  );
}

function TheaterKeys({ onClose, onPrev, onNext }: { onClose: () => void; onPrev?: () => void; onNext?: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    document.addEventListener('keydown', h);
    const o = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = o; };
  }, [onClose, onPrev, onNext]);
  return null;
}
