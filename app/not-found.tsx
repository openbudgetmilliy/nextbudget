import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';
import { Telegram } from '@/components/Icons';

export const metadata = { title: 'Sahifa topilmadi', robots: { index: false } };

export default function NotFound() {
  return (
    <main className="nf">
      <div className="wrap">
        <span className="eyebrow">404</span>
        <h1 className="nf-title">Bu sahifa topilmadi</h1>
        <p className="nf-sub">
          Havola eskirgan bo’lishi mumkin. To’g’ridan-to’g’ri botga o’tishingiz mumkin.
        </p>

        <div className="btn-row nf-cta">
          <a href="/" className="btn btn-ghost">
            Bosh sahifa
          </a>
          <a href={tgLink(env.BOT, 'web_404')} className="btn btn-primary" rel="noopener">
            <Telegram />
            Botga o’tish
          </a>
        </div>
      </div>
    </main>
  );
}
