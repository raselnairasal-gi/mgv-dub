import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({ onClose, children, label, className = '' }: { onClose: () => void; children: ReactNode; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const o = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = o; prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref}>
        <button className="modal-x" onClick={onClose} aria-label="Закрыть"><X size={20} /></button>
        {children}
      </div>
    </div>
  );
}
