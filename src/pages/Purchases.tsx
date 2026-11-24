import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, type Purchase } from '../api';
import { useOpenProject } from '../components/ProjectCard';
import { useAuth } from '../lib/auth';
import { date } from '../lib/format';
import { useToast } from '../lib/toast';

const src = { site: 'куплено на сайте', boosty: 'Boosty', subscription: 'по подписке' };

export function Purchases() {
  const { user, openLogin, loading } = useAuth();
  const [items, setItems] = useState<Purchase[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const open = useOpenProject();
  const toast = useToast();

  useEffect(() => {
    document.title = 'Мои покупки — MGV Dubbing';
    if (!user) return;
    setItems(null);
    api.getPurchases().then(setItems).catch((e) => setErr(e.message));
    return () => { document.title = 'MGV Dubbing — игры говорят по-русски'; };
  }, [user]);

  return (
    <section className="page">
      <div className="section-head">
        <span className="section-num">♪/</span>
        <h1 className="section-title">Мои <span className="hl hl-orange">покупки</span></h1>
      </div>
      {!loading && !user && (
        <div className="empty big">
          <p className="empty-title">Ваши озвучки будут здесь</p>
          <p className="muted">Войдите в аккаунт, чтобы увидеть покупки.</p>
          <button className="btn btn-primary btn-lg" onClick={() => openLogin()}>Войти</button>
        </div>
      )}
      {user && err && <div className="empty"><p>Не удалось загрузить покупки</p></div>}
      {user && !items && !err && <p className="muted pulse">Загружаем озвучки…</p>}
      {items && items.length === 0 && (
        <div className="empty big"><p className="empty-title">Пока нет покупок</p><p className="muted">Выберите игру в каталоге — приобретённая озвучка появится здесь.</p></div>
      )}
      {items && items.length > 0 && (
        <div className="plist">
          {items.map((x) => (
            <div className="prow" key={x.id}>
              <button className="prow-cover" onClick={() => open(x.project.id)}><img src={x.project.coverImage} alt="" /></button>
              <div className="prow-info">
                <b>{x.project.name}</b>
                <small>{x.version} · {src[x.source]} · {date(x.purchasedAt)}</small>
              </div>
              <button className="btn btn-primary" onClick={() => toast('Скачивание идёт через приложение MGV на ПК', 'info')}><Download size={17} /> <span className="hide-sm">Скачать</span></button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
