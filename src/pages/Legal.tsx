import { Link } from 'react-router-dom';

const titles = { offer: 'Публичная оферта', privacy: 'Политика обработки персональных данных', consent: 'Согласие на обработку персональных данных' };

export function Legal({ kind }: { kind: keyof typeof titles }) {
  return (
    <section className="page legal">
      <Link to="/" className="link">← На главную</Link>
      <h1 className="section-title">{titles[kind]}</h1>
      <p className="muted">Текст документа будет подгружаться из API. Сейчас это заглушка.</p>
      {Array.from({ length: 4 }, (_, k) => (
        <div key={k}>
          <h3>{k + 1}. Раздел</h3>
          <p className="muted">Lorem ipsum — здесь будет текст раздела {k + 1}.</p>
        </div>
      ))}
    </section>
  );
}

export function NotFound() {
  return (
    <section className="page pay">
      <div className="pay-card">
        <h1 className="huge">404</h1>
        <p className="muted">Этой страницы нет даже в космосе.</p>
        <Link className="btn btn-primary btn-lg" to="/">На главную</Link>
      </div>
    </section>
  );
}
