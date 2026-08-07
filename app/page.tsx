import Gate from '@/components/Gate';
import Logo from '@/components/Logo';

import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import { env, GATE_ON } from '@/lib/env';

/**
 * Kirish darvozasi — saytning birinchi sahifasi.
 *
 * Foydalanuvchi bu yerda hech narsa bosmaydi: Turnstile fonda ishlaydi
 * (`appearance: interaction-only`, ya'ni widget odatda ko'rinmaydi),
 * tekshiruv tugashi bilan halqa yashil belgiga aylanadi va sahifa `/l` ga
 * o'zi o'tadi. Chiqishda fon landing foniga eriydi.
 *
 * MUHIM: bu bizning sahifamiz, Cloudflare'ning tizim sahifasi EMAS. Shuning
 * uchun tepada bizning brendimiz turadi, Cloudflare esa pastda xizmat
 * sifatida ko'rsatiladi — tekshiruvni haqiqatan o'sha bajaradi. Sahifani
 * Cloudflare'niki qilib ko'rsatish foydalanuvchini chalg'itardi.
 *
 * To'liq statik: Cloudflare edge'da cache'lanaveradi.
 */
export const revalidate = 3600;
export const dynamic = 'force-static';

/** Cloudflare bulut belgisi — xizmat atributsiyasi uchun */
function CloudflareMark() {
  return (
    <svg viewBox="0 0 48 22" className="cf-mark" aria-hidden="true">
      <g fill="#f6821f">
        <circle cx="18" cy="10" r="7.5" />
        <circle cx="29" cy="12" r="5.5" />
        <rect x="11" y="12" width="26" height="7.5" rx="3.75" />
      </g>
      <circle cx="35.5" cy="13.5" r="4" fill="#fbad41" />
    </svg>
  );
}

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
        funksiyani chaqirib xato bermasin.
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
        <div className="card">
          <span className="card-edge" aria-hidden="true" />

          <Logo size={72} className="card-logo" />
          <p className="card-brand">{SITE.brand}</p>
          <p className="card-sub">Saytga kirishdan oldin bir marta tekshiramiz</p>

          <Gate siteKey={siteKey} />

          <p className="card-foot">
            <CloudflareMark />
            Cloudflare Turnstile himoyasi
          </p>
        </div>

        <p className="splash-host">{SITE.domain}</p>
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
