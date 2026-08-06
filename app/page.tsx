import Gate from '@/components/Gate';
import Header from '@/components/Header';
import Poster from '@/components/Poster';

import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import { tgLink } from '@/lib/tg';
import { env, GATE_ON } from '@/lib/env';

/**
 * Kirish darvozasi — saytning birinchi sahifasi.
 *
 * Foydalanuvchi bu yerda HECH NARSA bosmaydi: Turnstile fonda ishlaydi va
 * tekshiruv tugashi bilan sahifa `/l` ga o'zi o'tadi. Widget odatda umuman
 * ko'rinmaydi (`appearance: interaction-only`).
 *
 * Sahifa landing bilan bir xil plakatni ko'rsatadi — farqi faqat harakat
 * uyasida: tugma o'rnida tekshiruv chizig'i turadi. Shu sabab kutish vaqti
 * bo'sh o'tmaydi va `/l` ga o'tish sezilmaydi.
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
  const tg = tgLink(s.bot_username || env.BOT, 'gate');

  return (
    <>
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

      <Header tg={tg} label="Botga o’tish" />

      <main>
        <Poster s={s} action={<Gate siteKey={siteKey} />} />
      </main>

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
    </>
  );
}
