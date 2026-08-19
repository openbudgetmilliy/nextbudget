/**
 * Inline SVG ikonkalar — server component.
 *
 * Nega inline: rasm/sprite so'rovi yo'q, LCP'ga ta'sir qilmaydi va
 * `currentColor` orqali matn rangini oladi.
 *
 * Ikkitadan ko'p emas. Bir ekranli slaydda har bir belgi o'z o'rnini
 * oqlashi kerak — bezak uchun ikonka qo'shilmaydi.
 */

type P = { size?: number; className?: string };

/** 404 sahifasidagi "Botga o'tish" tugmasi uchun */
export function Telegram({ size = 20, className }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M21.6 4.1L2.9 11.3c-1 .4-1 1 .1 1.3l4.7 1.5 1.8 5.5c.2.6.5.7 1 .3l2.6-2.1 4.6 3.4c.8.5 1.3.2 1.5-.7l3-14.1c.2-1-.4-1.5-1.6-1.2zM9.7 14.3l8.1-5.1c.4-.2.7-.1.4.2l-6.6 6-.2 2.7c-.1.2-.2.2-.3 0l-1.4-3.8z" />
    </svg>
  );
}

/** Bosh sahifada tugmalar tomon ishora qiladi (sakraydi) */
export function ArrowDown({ size = 26, className }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 5v14m0 0-6-6m6 6 6-6" />
    </svg>
  );
}
