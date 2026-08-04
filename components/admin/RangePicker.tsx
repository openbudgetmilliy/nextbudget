import Link from 'next/link';

const RANGES = [
  { h: 24, label: '24 soat' },
  { h: 72, label: '3 kun' },
  { h: 168, label: '7 kun' },
  { h: 720, label: '30 kun' },
];

/** Server component — JS yubormaydi, oddiy havolalar */
export default function RangePicker({ base, hours }: { base: string; hours: number }) {
  return (
    <div className="a-nav" role="group" aria-label="Davr">
      {RANGES.map((r) => (
        <Link
          key={r.h}
          href={`${base}?h=${r.h}`}
          aria-current={r.h === hours ? 'page' : undefined}
          scroll={false}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}

export function parseHours(v: string | undefined, fallback = 24): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), 1), 24 * 90);
}
