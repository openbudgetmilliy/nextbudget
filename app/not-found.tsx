import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';
import { Telegram } from '@/components/Icons';

/**
 * 404. Sayt bitta sahifadan iborat, shuning uchun bu yerga faqat eskirgan
 * havola yoki skaner tushadi — sahifa ataylab qisqa.
 *
 * Uslublar `globals.css` da (`.nf-*`): bu marshrut uchun alohida CSS modul
 * yuklashning ma'nosi yo'q, u baribir deyarli ochilmaydi.
 */
export const metadata = { title: 'Sahifa topilmadi', robots: { index: false } };

export default function NotFound() {
  return (
    <main className="nf">
      <div>
        <span className="nf-code">404</span>
        <h1 className="nf-title">Bu sahifa topilmadi</h1>
        <p className="nf-sub">
          Havola eskirgan bo’lishi mumkin. Bosh sahifaga qayting yoki
          to’g’ridan-to’g’ri botga o’ting.
        </p>

        <div className="nf-act">
          <a href="/" className="nf-btn nf-btn-ghost">
            Bosh sahifa
          </a>
          <a
            href={tgLink(env.BOT, 'web_404')}
            className="nf-btn nf-btn-gold"
            rel="noopener"
          >
            <Telegram size={17} />
            Botga o’tish
          </a>
        </div>
      </div>
    </main>
  );
}
