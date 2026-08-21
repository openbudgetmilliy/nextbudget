import type { Metadata, Viewport } from 'next';

import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import TurnstileGuard from '@/components/TurnstileGuard';
import Logo from '@/components/Logo';
import { Telegram } from '@/components/Icons';

import { getSettings, pagePixels } from '@/lib/data';
import { SITE } from '@/lib/content';
import { botUsername, tgLink } from '@/lib/tg';
import { pageAt } from '@/lib/pages';
import { env, GATE_ON } from '@/lib/env';

import c from './page.module.css';

/**
 * `/9` — «Banknota» kadri: to'q fon, 100 ming so'mlik, qizil tugma.
 *
 * Uslub manbasi — foydalanuvchi ko'rsatgan story-kreativ: qop-qora fon,
 * markazda 100 000 so'mlik banknota (rasmiy tasvir, Wikimedia'dan),
 * ko'k urg'uli sarlavha, pastda katta qizil «Pul ishlash» tugmasi va
 * ostida qizil nur. Matnlar QO'LDA — kreativ nusxasi; tavsif buyurtma
 * bo'yicha: «Faqat biz har bir ovoz uchun haqiqiy to'lov qilamiz».
 *
 * Reklama kampaniyalarida muqobil kadr — `/2`–`/8` kabi index'lanmaydi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

const PAGE = pageAt('/9');

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0c0e12',
  colorScheme: 'dark',
};

export default async function BanknotaPage() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, PAGE.slug);
  // botUsername(): admin to'liq havola yozsa ham JSON-LD'ga toza username tushsin
  const bot = botUsername(s.bot_username || env.BOT);
  const channel = (s.tg_channel || '').replace(/^@/, '');

  return (
    <div className={c.screen}>
      {/* Global body foni oq — bu kadr qora, overscroll mos tursin */}
      <style>{'body{background:#0c0e12}'}</style>
      <div className={c.glow} aria-hidden />

      <div className={c.wrap}>
        <header className={c.head}>
          <span className={c.mark}>
            <Logo size={30} className="" />
          </span>
          <span className={c.brand}>Milliy Jamoasi</span>
        </header>

        <div className={c.mid}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/banknota-100k.webp"
            alt=""
            width={880}
            height={470}
            fetchPriority="high"
            decoding="async"
            className={c.note100}
          />

          <h1 className={c.title}>
            Har bitta ovoz uchun
            <br />
            <b className={c.hl}>100 000 so‘m</b> gacha!
          </h1>

          <p className={c.sub}>Faqat biz har bir ovoz uchun haqiqiy to‘lov qilamiz.</p>
        </div>

        <div className={c.cta}>
          <a
            href={tg}
            className={c.btn}
            data-t="cta"
            data-t-id="pul"
            data-tg
            rel="noopener"
          >
            <Telegram size={20} />
            Pul ishlash
            <span className={c.arrow} aria-hidden>
              →
            </span>
          </a>
          <p className={c.note}>To‘lovlar Telegram bot orqali amalga oshiriladi</p>
        </div>
      </div>

      <Tracker />
      <MetaPixel ids={pagePixels(s, PAGE.slug)} />

      {/* Fonda ishlaydigan Turnstile — sahifani to'smaydi, odatda ko'rinmaydi */}
      <TurnstileGuard siteKey={GATE_ON ? env.TURNSTILE_SITE_KEY : ''} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE.brand,
            url: env.SITE_URL,
            description: SITE.description,
            sameAs: [bot, channel].filter(Boolean).map((u) => `https://t.me/${u}`),
            // `<` qochiriladi: qiymatlar admin formasidan keladi
          }).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}
