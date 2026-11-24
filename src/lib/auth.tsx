import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type User } from '../api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  loginOpen: boolean;
  openLogin: (reason?: string) => void;
  closeLogin: () => void;
  loginReason?: string;
  setUser: (u: User | null) => void;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setReason] = useState<string>();

  useEffect(() => {
    api.getMe().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const openLogin = useCallback((reason?: string) => { setReason(reason); setLoginOpen(true); }, []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);
  const signOut = useCallback(async () => { await api.signOut(); setUser(null); }, []);

  return (
    <Ctx.Provider value={{ user, loading, loginOpen, openLogin, closeLogin, loginReason, setUser, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);
