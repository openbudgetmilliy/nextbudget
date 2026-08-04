import Gate from '@/components/Gate';
import { Wordmark } from '@/components/Logo';
import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import { env, GATE_ON } from '@/lib/env';

/**
 * Kirish darvozasi — saytning birinchi sahifasi.
 *
 * To'liq statik: foydalanuvchiga bog'liq hech narsa yo'q, shuning uchun
 * Cloudflare edge'da cache'lanaveradi. Tekshiruv brauzerda (Turnstile) va
 * `/api/gate` da bo'ladi, bu sahifada emas.
 *
 * Turnstile kalitlari sozlanmagan bo'lsa darvoza o'zi ochiq turadi —
 * `Gate` tugmani darrov yoqadi va middleware ham `/l` ni to'smaydi.
 */
export const revalidate = 3600;
export const dynamic = 'force-static';

export default async function GatePage() {
  const s = await getSettings();
  const siteKey = GATE_ON ? env.TURNSTILE_SITE_KEY : '';

  return (
    <main className="gate">
      <div className="gate-card">
        <div className="gate-head">
          <span className="logo">
            <Wordmark size={28} />
          </span>
          <span className="gate-doc">Kirish</span>
        </div>

        <div className="gate-body">
          <h1 className="gate-title">Tasdiqlang</h1>
          <p className="gate-sub">
            Saytga o‘tishdan oldin siz odam ekaningizni bir marta tasdiqlaymiz. Bir necha soniya
            oladi.
          </p>

          <Gate siteKey={siteKey} label="Kirish" />

          <noscript>
            <p className="gate-status">Davom etish uchun JavaScript yoqilgan bo‘lishi kerak.</p>
          </noscript>
        </div>

        <p className="gate-note">
          Himoya Cloudflare Turnstile orqali. Shaxsiy ma’lumot so‘ralmaydi.
        </p>
      </div>

      {/* Domen qidiruvda ko'rinib tursin — sahifada ko'rinadigan ma'lumot doirasida */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE.brand,
            url: env.SITE_URL,
            description: SITE.description,
            sameAs: [`https://t.me/${s.tg_channel}`],
          }),
        }}
      />
    </main>
  );
}
