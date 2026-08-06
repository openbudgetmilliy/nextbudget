import { Telegram } from './Icons';
import { Wordmark } from './Logo';
import { SITE } from '@/lib/content';

/**
 * Header — brend belgisi va botga o'tish tugmasi.
 *
 * Navigatsiya yo'q: sahifa bitta ekran, o'tadigan bo'lim yo'q. Bir joyga
 * olib boradigan menyu havolasi foydalanuvchini chalg'itadi, xolos.
 */
export default function Header({ tg, label }: { tg: string; label: string }) {
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <a href="#top" className="brand" aria-label={SITE.brand}>
          <Wordmark size={36} />
        </a>

        <a
          href={tg}
          className="btn btn-sm"
          data-t="cta"
          data-t-id="hdr_cta"
          data-tg
          rel="noopener"
        >
          <Telegram size={16} />
          {label}
        </a>
      </div>
    </header>
  );
}
