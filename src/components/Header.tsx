import { House, ShoppingBag, Sparkles, User as UserIcon, LogOut, Settings, Crown, LayoutGrid } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { Logo } from './Logo';

function ProfileMenu({ compact }: { compact?: boolean }) {
  const { user, openLogin, signOut } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const sub = user?.subscription;
  const initial = (user?.name || 'Г')[0].toUpperCase();

  return (
    <div className="profile" ref={ref}>
      <button
        className={`profile-trigger ${compact ? 'is-compact' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Профиль"
        onClick={() => (user ? setOpen((o) => !o) : openLogin())}
      >
        {user ? <span className="avatar">{initial}</span> : <UserIcon size={20} />}
        {!compact && <span className="profile-label">{user ? user.name : 'Войти'}</span>}
        {compact && <span className="bn-label">Профиль</span>}
      </button>
      {open && user && (
        <div className="menu" role="menu">
          <div className="menu-head">
            <span className="avatar lg">{initial}</span>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
          </div>
          <div className={`menu-sub ${sub?.active ? 'on' : ''}`}>
            <Crown size={16} />
            {sub?.active ? (
              <span>Подписчик · осталось {sub.daysLeft} дн.{sub.renewPending ? ' · ожидается продление' : ''}</span>
            ) : (
              <span>Без подписки</span>
            )}
          </div>
          <button role="menuitem" onClick={() => { setOpen(false); nav('/purchases'); }}><ShoppingBag size={16} /> Мои покупки</button>
          <button role="menuitem" onClick={() => { setOpen(false); nav('/shop'); }}><Sparkles size={16} /> Подписка и озвучки</button>
          <button role="menuitem" onClick={() => { setOpen(false); toast('Настройки появятся вместе с API', 'info'); }}><Settings size={16} /> Настройки</button>
          <button
            role="menuitem"
            className="danger"
            disabled={leaving}
            onClick={async () => {
              setLeaving(true);
              try { await signOut(); setOpen(false); } catch { toast('Не удалось выйти из аккаунта. Попробуйте ещё раз.', 'err'); }
              setLeaving(false);
            }}
          >
            <LogOut size={16} /> {leaving ? 'Выходим…' : 'Выйти'}
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="MGV Dubbing — на главную"><Logo /></Link>
        <nav className="topnav" aria-label="Основная навигация">
          <NavLink to="/" end>Главная</NavLink>
          <a href={`${import.meta.env.BASE_URL}#catalog`}>Каталог</a>
          <NavLink to="/shop">Подписка</NavLink>
          <NavLink to="/purchases">Мои покупки</NavLink>
        </nav>
        <ProfileMenu />
      </header>

      <nav className="bottomnav" aria-label="Мобильная навигация">
        <NavLink to="/" end><House size={22} /><span className="bn-label">Главная</span></NavLink>
        <a href={`${import.meta.env.BASE_URL}#catalog`}><LayoutGrid size={22} /><span className="bn-label">Каталог</span></a>
        <NavLink to="/shop"><Sparkles size={22} /><span className="bn-label">Подписка</span></NavLink>
        <NavLink to="/purchases"><ShoppingBag size={22} /><span className="bn-label">Покупки</span></NavLink>
        <ProfileMenu compact />
      </nav>
    </>
  );
}
