import { Link } from 'react-router-dom';
import { site } from '../config';
import { Logo } from './Logo';

export function Footer() {
  const m = site.merchant;
  return (
    <footer className="footer">
      <div className="footer-top">
        <Logo />
        <span className="footer-tag">игры говорят по-русски ✦ с 2024</span>
      </div>
      <nav className="footer-links">
        <Link to="/offer">Публичная оферта</Link>
        <Link to="/privacy">Политика обработки персональных данных</Link>
        <Link to="/consent">Согласие на обработку персональных данных</Link>
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
      </nav>
      <p className="footer-legal">
        Приём платежей: {m.name}, БИН {m.bin}, дата регистрации {m.registered}, адрес: {m.address}
      </p>
    </footer>
  );
}
