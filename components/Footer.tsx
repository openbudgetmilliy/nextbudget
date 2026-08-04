import { SITE } from '@/lib/content';
import type { Settings } from '@/lib/data';

export default function Footer({ s }: { s: Settings }) {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <div>
          <span className="ftr-brand">{SITE.brand}</span>
          <p className="ftr-note">
            {new Date().getFullYear()} · {SITE.domain}
            <br />
            Mustaqil vositachi xizmat. Rasmiy «Tashabbusli budjet» portali — openbudget.uz.
            Ushbu sayt rasmiy davlat resursi emas.
          </p>
        </div>

        <nav className="ftr-links" aria-label="Qo’shimcha havolalar">
          <a
            href={`https://t.me/${s.tg_channel}`}
            data-t="click"
            data-t-id="ftr_channel"
            rel="noopener nofollow"
          >
            Kanal
          </a>
          <a
            href={`https://t.me/${s.support_username}`}
            data-t="click"
            data-t-id="ftr_support"
            rel="noopener nofollow"
          >
            Yordam
          </a>
          <a href="#how">Qanday ishlaydi</a>
          <a href="#faq">Savollar</a>
        </nav>
      </div>
    </footer>
  );
}
