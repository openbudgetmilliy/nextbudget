import { SITE } from '@/lib/content';

/**
 * Brend belgisi — `public/logo-mark.webp`.
 *
 * `next/image` ATAYIN ishlatilmagan: u ish vaqtida `/_next/image` ga so'rov
 * qiladi, bu esa landing'ning "origin'ga tegmaydi" printsipiga zid. Rasm
 * allaqachon kerakli o'lchamda tayyorlangan (`npm run logos`) va oddiy statik
 * fayl sifatida edge'dan beriladi.
 *
 * `width`/`height` majburiy — ularsiz rasm yuklanguncha layout sakraydi (CLS).
 */
export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <img
      src="/logo-mark.webp"
      alt=""
      width={size}
      height={size}
      className="logo-mark"
      decoding="async"
    />
  );
}

/** Belgi + brend nomi — header va darvozada ishlatiladi */
export function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <>
      <Logo size={size} />
      {SITE.brand}
    </>
  );
}
