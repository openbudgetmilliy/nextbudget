'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard'ni fonda yangilab turadi (`router.refresh()` — server component'lar
 * qayta render bo'ladi, sahifa qayta yuklanmaydi).
 * Tab ko'rinmasa yangilanish to'xtaydi — bekorga so'rov ketmaydi.
 */
export default function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [on, seconds, router]);

  return (
    <label
      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6f7b8f' }}
    >
      <span className="a-sw">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
        <span />
      </span>
      {seconds}s da yangilash
    </label>
  );
}
