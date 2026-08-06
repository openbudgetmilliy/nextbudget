import { SITE } from '@/lib/content';

/**
 * Brend belgisi — `public/logo-mark.webp` (`npm run logos` yasaydi).
 *
 * MUHIM: belgining rombllari oqdan tealga o'tuvchi gradient. Ya'ni u faqat
 * OQ/yorug' fonda to'g'ri ko'rinadi — to'q fonda oq uchlari dog' bo'lib qoladi.
 * Shu sabab header oq, darvozada esa belgi oq plita ustida turadi.
 *
 * `next/image` ATAYIN ishlatilmagan: u ish vaqtida `/_next/image` ga so'rov
 * qiladi, bu esa landing'ning "origin'ga tegmaydi" printsipiga zid. Rasm
 * allaqachon kerakli o'lchamda va oddiy statik fayl sifatida beriladi.
 *
 * `width`/`height` majburiy — ularsiz rasm yuklanguncha layout sakraydi (CLS).
 */
export default function Logo({ size = 34, className = 'brand-mark' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo-mark.webp"
      alt=""
      width={size}
      height={size}
      className={className}
      decoding="async"
    />
  );
}

/** Belgi + brend nomi — header'da ishlatiladi */
export function Wordmark({ size = 34 }: { size?: number }) {
  return (
    <>
      <Logo size={size} />
      <span>{SITE.brand}</span>
    </>
  );
}
