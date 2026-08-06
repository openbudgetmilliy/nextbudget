import Gate from '@/components/Gate';
import Logo from '@/components/Logo';
import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import { env, GATE_ON } from '@/lib/env';

/**
 * Kirish darvozasi — saytning birinchi sahifasi.
 *
 * Foydalanuvchi bu yerda HECH NARSA bosmaydi: Turnstile fonda ishlaydi va
 * tekshiruv tugashi bilan sahifa `/l` ga o'zi o'tadi. Odatda bu bir necha
 * soniya va widget umuman ko'rinmaydi (`appearance: interaction-only`).
 *
 * To'liq statik: foydalanuvchiga bog'liq hech narsa yo'q, shuning uchun
 * Cloudflare edge'da cache'lanaveradi. Tekshiruv brauzerda va `/api/gate` da
 * bo'ladi, bu sahifada emas.
 *
 * Turnstile kalitlari sozlanmagan bo'lsa darvoza o'zi ochiq: sahifa darrov
 * `/l` ga o'tadi va middleware ham to'smaydi.
 */
export const revalidate = 3600;
export const dynamic = 'force-static';

export default async function GatePage() {
  const s = await getSettings();
  const siteKey = GATE_ON ? env.TURNSTILE_SITE_KEY : '';

  return (
    <main className="gate">
      <div className="gate-in">
        <p className="gate-brand">
          <Logo size={52} className="" />
          {SITE.brand}
        </p>

        <h1 className="gate-title">Tashabbusli budjet ovozi</h1>

        <Gate siteKey={siteKey} />

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
