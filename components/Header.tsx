import { Telegram } from './Icons';
import { Wordmark } from './Logo';
import { SITE } from '@/lib/content';

export default function Header({ tg }: { tg: string }) {
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <a href="#top" className="logo" aria-label={SITE.brand}>
          <Wordmark size={30} />
        </a>

        <nav className="hdr-nav" aria-label="Asosiy menyu">
          <a href="#how">Qanday ishlaydi</a>
          <a href="#why">Nega biz</a>
          <a href="#faq">Savollar</a>
        </nav>

        <a
          href={tg}
          className="btn btn-primary btn-sm"
          data-t="cta"
          data-t-id="hdr_cta"
          data-tg
          rel="noopener"
        >
          <Telegram size={16} />
          Botga o’tish
        </a>
      </div>
    </header>
  );
}
