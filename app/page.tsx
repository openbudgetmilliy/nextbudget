import Gate from '@/components/Gate';
import Logo from '@/components/Logo';

import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import { env, GATE_ON } from '@/lib/env';

/**
 * Kirish darvozasi — saytning birinchi sahifasi.
 *
 * Oq va sodda: belgi, nom va tekshiruv holati. Foydalanuvchi bu yerda hech
 * narsa bosmaydi va hech narsa o'qimaydi — Turnstile fonda ishlaydi
 * (`appearance: interaction-only`, ya'ni widget odatda ko'rinmaydi), tekshiruv
 * tugashi bilan yashil belgi chiziladi va sahifa `/l` ga o'zi o'tadi.
 *
 * Chiqishda fon landing foniga eriydi — ikkinchi sahifa xuddi shu fonda
 * ochilgani uchun o'tish uzluksiz tuyuladi.
 *
 * To'liq statik: foydalanuvchiga bog'liq hech narsa yo'q, shuning uchun
 * Cloudflare edge'da cache'lanaveradi.
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
    <main className="splash">
      {/*
        Turnstile skripti HTML bilan birga yuklana boshlaydi.

        Nega: `Gate` — client component, uning effekti React bundle yuklanib,
        hidratsiya tugagandan KEYIN ishlaydi. Skript o'sha paytda qo'shilsa
        zanjir ketma-ket bo'lardi. `id` komponentdagi bilan bir xil — u
        ikkinchi nusxani qo'shmaydi. Zaxira `__gateOnload`: skript
        hidratsiyadan oldin tayyor bo'lsa Turnstile mavjud bo'lmagan
        funksiyani chaqirib xato bermasin; bu holda komponent
        `window.turnstile` ni ko'radi va o'zi ulanadi.
      */}
      {siteKey && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: 'window.__gateOnload=window.__gateOnload||function(){}',
            }}
          />
          <script
            id="cf-turnstile"
            async
            defer
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__gateOnload"
          />
        </>
      )}

      <div className="splash-in">
        <Logo size={96} className="splash-logo" />
        <p className="splash-brand">{SITE.brand}</p>
        <Gate siteKey={siteKey} />
      </div>

      <p className="splash-note">Himoya Cloudflare Turnstile orqali</p>

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
