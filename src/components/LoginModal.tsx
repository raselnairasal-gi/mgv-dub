import { Mail, Send, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, isMock } from '../api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { Logo } from './Logo';
import { Modal } from './Modal';

export function LoginModal() {
  const { loginOpen, closeLogin, loginReason, setUser } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!loginOpen) return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try { await api.requestEmailCode(email); setStep('code'); } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const u = await api.verifyEmailCode(email, code);
      setUser(u); closeLogin(); toast(`Привет, ${u.name}!`, 'ok');
      setStep('email'); setCode('');
    } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  };

  return (
    <Modal onClose={closeLogin} label="Вход в MGV" className="login">
      <div className="login-top">
        <Logo />
        <h2>Вход в MGV</h2>
        <p className="muted">{loginReason ?? 'Один аккаунт для сайта и приложения MGV на ПК.'}</p>
      </div>

      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Даю <Link to="/consent" onClick={closeLogin}>согласие на обработку персональных данных</Link></span>
      </label>

      {step === 'email' ? (
        <form onSubmit={send} className="login-form">
          <label className="field">
            <span>Почта</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.ru" autoComplete="email" />
          </label>
          <button className="btn btn-primary btn-lg w100" disabled={!consent || busy}>
            <Mail size={18} /> {busy ? 'Отправляем…' : 'Получить код'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="login-form">
          <button type="button" className="link" onClick={() => setStep('email')}><ArrowLeft size={14} /> {email}</button>
          <label className="field">
            <span>Код из письма</span>
            <input inputMode="numeric" autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" className="code-input" />
          </label>
          {isMock && <small className="muted">Mock-режим: подойдёт любой код из 4+ цифр.</small>}
          <button className="btn btn-primary btn-lg w100" disabled={busy || code.length < 4}>{busy ? 'Проверяем…' : 'Войти'}</button>
        </form>
      )}
      {err && <p className="form-err">{err}</p>}

      <div className="or"><span>или</span></div>
      <button className="btn btn-cyan btn-lg w100" disabled={!consent} onClick={() => toast('Вход через Telegram подключится вместе с API', 'info')}>
        <Send size={18} /> Войти через Telegram
      </button>
      {!consent && <small className="muted center block">Отметьте согласие выше — появится кнопка входа через бота</small>}

      <div className="boosty">
        <b>Купили озвучку на Boosty?</b> Входите с той же почтой, что и на Boosty — тогда покупка появится в аккаунте сама.
      </div>
    </Modal>
  );
}
