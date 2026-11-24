import { Check, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type ShopOffer } from '../api';
import { useAuth } from '../lib/auth';
import { rub, tilt } from '../lib/format';
import { useToast } from '../lib/toast';

export function Shop() {
  const [offers, setOffers] = useState<ShopOffer[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { user, openLogin } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  useEffect(() => { api.getShop().then(setOffers).catch((e) => toast(e.message, 'err')); }, [toast]);

  const buy = async (o: ShopOffer) => {
    if (!user) return openLogin('Войдите, чтобы оформить подписку');
    setBusy(o.id);
    try { const r = await api.checkout({ offerId: o.id }); nav(r.redirectUrl); } catch (e) { toast((e as Error).message, 'err'); }
    setBusy(null);
  };

  return (
    <section className="page">
      <div className="section-head">
        <span className="section-num">$/</span>
        <h1 className="section-title">Подписка <span className="hl hl-pink">и озвучки</span></h1>
      </div>
      {user?.subscription?.active && (
        <div className="sub-now">Подписка активна · осталось <b>{user.subscription.daysLeft} дн.</b></div>
      )}
      <div className="offers">
        {!offers && Array.from({ length: 3 }, (_, k) => <div key={k} className="offer offer-skel" />)}
        {offers?.map((o) => (
          <div key={o.id} className={`offer offer-${o.accent}`} style={{ '--tilt': `${tilt(o.id, 1.5)}deg` } as React.CSSProperties}>
            {o.hot && <span className="offer-hot"><Flame size={14} /> хит</span>}
            <small className="offer-kind">{o.kind === 'subscription' ? 'подписка' : 'набор'}</small>
            <h3>{o.title}</h3>
            <p className="muted">{o.subtitle}</p>
            <div className="offer-price">
              <b>{rub(o.price)}</b>{o.period && <span>/{o.period}</span>}
              {o.oldPrice && <s>{rub(o.oldPrice)}</s>}
            </div>
            <ul>{o.perks.map((x) => <li key={x}><Check size={16} /> {x}</li>)}</ul>
            <button className="btn btn-primary btn-lg w100" disabled={busy === o.id} onClick={() => buy(o)}>
              {busy === o.id ? 'Открываем оплату…' : o.kind === 'subscription' ? 'Оформить' : 'Купить'}
            </button>
          </div>
        ))}
      </div>
      <p className="fine center">Оплачивая, вы принимаете условия публичной оферты. Возврат — по разделу 6 оферты.</p>
    </section>
  );
}
