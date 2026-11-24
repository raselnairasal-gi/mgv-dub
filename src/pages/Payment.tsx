import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type PaymentStatus } from '../api';

const text: Record<PaymentStatus, { t: string; d: string }> = {
  pending: { t: 'Проверяем оплату…', d: 'Узнаём у платёжной системы, чем закончился платёж.' },
  success: { t: 'Спасибо за оплату', d: 'Покупка уже в вашем аккаунте. Спасибо!' },
  fail: { t: 'Оплата не прошла', d: 'Платёж не завершён. Попробуйте ещё раз или выберите другой способ оплаты.' },
  refunded: { t: 'Платёж возвращён', d: 'Деньги по этому заказу вернулись, доступ по нему закрыт.' },
};

export function Payment({ failed }: { failed?: boolean }) {
  const [sp] = useSearchParams();
  const order = sp.get('order');
  const [st, setSt] = useState<PaymentStatus>(failed ? 'fail' : 'pending');
  useEffect(() => {
    if (failed || !order) { if (!order) setSt(failed ? 'fail' : 'success'); return; }
    api.getPaymentStatus(order).then(setSt).catch(() => setSt('fail'));
  }, [order, failed]);
  const Icon = st === 'pending' ? Loader2 : st === 'success' ? CheckCircle2 : XCircle;
  return (
    <section className="page pay">
      <div className={`pay-card pay-${st}`}>
        <Icon size={56} className={st === 'pending' ? 'spin' : ''} />
        <h1>{text[st].t}</h1>
        <p className="muted">{text[st].d}</p>
        {order && <small className="mono">Номер заказа для поддержки: {order}</small>}
        <div className="pay-actions">
          {st === 'success' ? <Link className="btn btn-primary btn-lg" to="/purchases">Мои покупки</Link> : <Link className="btn btn-primary btn-lg" to="/shop">Попробовать снова</Link>}
          <Link className="btn btn-outline btn-lg" to="/">На главную</Link>
        </div>
      </div>
    </section>
  );
}
