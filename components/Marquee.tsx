/**
 * Ko'k lenta — bo'limlar orasidagi ritm belgisi.
 *
 * Ro'yxat IKKI MARTA takrorlanadi va `-50%` ga suriladi — shu tarzda halqa
 * uzluksiz ko'rinadi. Sof CSS animatsiya, JS yo'q; `prefers-reduced-motion`
 * global qoida orqali to'xtatiladi.
 */

const ITEMS = [
  'Tanishtiruv sahifasi',
  'Maqsadli e’lon',
  'Qamrov hisoboti',
  'Humo · Uzcard · Payme',
  'Telegram bot',
];

function Row() {
  return (
    <span>
      {ITEMS.map((t) => (
        <span key={t}>
          {t}
          <i aria-hidden>✸</i>
        </span>
      ))}
    </span>
  );
}

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        <Row />
        <Row />
      </div>
    </div>
  );
}
