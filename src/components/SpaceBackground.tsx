import { useEffect, useRef } from 'react';

/**
 * Космический фон: редкие мерцающие звёзды, медленный параллакс и иногда падающая звезда.
 * Всё приглушено — фон не должен спорить с обложками игр.
 */
export function SpaceBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, raf = 0, scroll = 0;
    type Star = { x: number; y: number; r: number; a: number; s: number; d: number; c: string };
    let stars: Star[] = [];
    let meteor: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    const tints = ['255,255,255', '255,255,255', '255,255,255', '198,255,61', '255,46,136', '61,240,255'];

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 5200);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.92 ? Math.random() * 0.9 + 0.2 : Math.random() * 1.4 + 0.9,
        a: Math.random() * 0.5 + 0.15,
        s: Math.random() * 0.002 + 0.0005,
        d: Math.random() * 0.25 + 0.03, // глубина для параллакса
        c: tints[Math.floor(Math.random() * tints.length)],
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * s.s + s.x);
        let y = (s.y - scroll * s.d) % h;
        if (y < 0) y += h;
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = `rgb(${s.c})`;
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) {
        if (!meteor && Math.random() < 0.0016) {
          meteor = { x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.4, vx: -7, vy: 3.2, life: 1 };
        }
        if (meteor) {
          const m = meteor;
          const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
          g.addColorStop(0, `rgba(255,255,255,${0.7 * m.life})`);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14);
          ctx.stroke();
          m.x += m.vx; m.y += m.vy; m.life -= 0.012;
          if (m.life <= 0) meteor = null;
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onScroll = () => { scroll = scrollY; };
    resize();
    addEventListener('resize', resize);
    addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(draw);
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div className="space" aria-hidden="true">
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      <canvas ref={ref} />
      <div className="grain" />
    </div>
  );
}
