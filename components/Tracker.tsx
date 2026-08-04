'use client';

import { useEffect } from 'react';
import { initTracking } from '@/lib/track';

/**
 * Landing'dagi YAGONA client component.
 *
 * Hech narsa render qilmaydi — faqat delegation listener'larini o'rnatadi.
 * Shu sabab barcha CTA tugmalari server component bo'lib qoladi va
 * hydration hajmi minimalda saqlanadi.
 */
export default function Tracker() {
  useEffect(() => {
    initTracking();
  }, []);
  return null;
}
