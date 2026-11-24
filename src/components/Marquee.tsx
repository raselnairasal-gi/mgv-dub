export function Marquee({ items, tone = 'lime', reverse }: { items: string[]; tone?: 'lime' | 'pink' | 'cyan'; reverse?: boolean }) {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className={`marquee marquee-${tone} ${reverse ? 'is-rev' : ''}`} aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i}>{t}<i>✦</i></span>
        ))}
      </div>
    </div>
  );
}
