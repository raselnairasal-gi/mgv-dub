import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type Project } from '../api';

interface ProjectsCtx {
  projects: Project[] | null;
  error: string | null;
  reload: () => void;
  patch: (id: string, p: Partial<Project>) => void;
  add: (p: Project) => void;
}
const Ctx = createContext<ProjectsCtx>(null!);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    setError(null);
    api.getHome().then(setProjects).catch((e) => setError(e.message || 'Не удалось загрузить каталог'));
  }, []);
  useEffect(reload, [reload]);
  const patch = useCallback((id: string, p: Partial<Project>) =>
    setProjects((xs) => xs && xs.map((x) => (x.id === id ? { ...x, ...p } : x))), []);
  const add = useCallback((p: Project) => setProjects((xs) => (xs ? [p, ...xs] : [p])), []);
  return <Ctx.Provider value={{ projects, error, reload, patch, add }}>{children}</Ctx.Provider>;
}
export const useProjects = () => useContext(Ctx);
