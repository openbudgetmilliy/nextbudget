import { Telegram } from './Icons';

/**
 * Mobil ekranda doim ko'rinadigan CTA — Instagram trafigida konversiyaning
 * asosiy manbasi. CSS bilan yashiriladi/ko'rsatiladi, JS ishlatmaydi.
 */
export default function StickyCta({ tg, label }: { tg: string; label: string }) {
  return (
    <div className="sticky">
      <a
        href={tg}
        className="btn btn-primary"
        data-t="cta"
        data-t-id="sticky_cta"
        data-tg
        rel="noopener"
      >
        <Telegram />
        {label}
      </a>
    </div>
  );
}
