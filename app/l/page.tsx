import type { Metadata } from 'next';

import Header from '@/components/Header';
import Poster from '@/components/Poster';
import Tracker from '@/components/Tracker';
import Logo from '@/components/Logo';
import { Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import {
  FINALE_BULLETS,
  LANDING_REWARDS,
  LANDING_STEPS,
  LANDING_TRUST,
  LIVE_STATS,
  landingFaqItems,
} from '@/lib/landing-sections';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import x from './extra.module.css';

export const revalidate = 60;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  robots: { index: false, follow: false },
};

const REWARD_ACCENT = ['green', 'blue', 'ink'] as const;

export default async function Landing() {
  const s = await getSettings();
  const bot = s.bot_username || env.BOT;
  const botClean = bot.replace(/^@/, '');
  const tg = tgLink(bot, 'web');

  return (
    <>
      <Header tg={tg} label="Botga o'tish" />

      <main>
        <Poster
          s={s}
          action={
            <div className="act">
              <a href={tg} className="btn" data-t="cta" data-t-id="hero_cta" data-tg rel="noopener">
                <Telegram />
                {s.cta_primary}
              </a>
            </div>
          }
        />

        {/* ── Jonli ko'rsatkichlar ── */}
        <section className={`wrap ${x.band}`} aria-label="Ko'rsatkichlar">
          <div className={x.statsGrid}>
            {LIVE_STATS.map((item) => (
              <div key={item.lab} className={x.stat}>
                <p className={`${x.statNum} tnum`}>{item.num}</p>
                <p className={x.statLab}>{item.lab}</p>
              </div>
            ))}
          </div>

          <ul className={x.trustRow}>
            {LANDING_TRUST.map((t) => (
              <li key={t} className={x.trustChip}>
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* ── 3 qadam ── */}
        <section className={`wrap ${x.band}`}>
          <p className="eyebrow">Jarayon</p>
          <h2 className={x.xh2}>3 qadam, xolos</h2>
          <p className={x.xsub}>
            Ro'yxatdan o'tish yo'q. Hujjat yo'q. Faqat ovoz va to'lov.
          </p>
          <ol className={x.how}>
            {LANDING_STEPS.map((step) => (
              <li key={step.n}>
                <span className={`${x.hnum} tnum`}>{step.n}</span>
                <h3 className={x.howH}>{step.title}</h3>
                <p className={x.howP}>{step.text}</p>
              </li>
            ))}
          </ol>
          <div className={x.secAct}>
            <a href={tg} className="btn" data-t="cta" data-t-id="steps_cta" data-tg rel="noopener">
              <Telegram />
              Hoziroq boshlash
            </a>
          </div>
        </section>

        {/* ── Mukofotlar ── */}
        <section className={`wrap ${x.band}`}>
          <p className="eyebrow">Mukofot</p>
          <h2 className={x.xh2}>Nima olasiz</h2>
          <p className={x.xsub}>Ovoz bergandan so'ng avtomatik to'lanadi.</p>
          <ul className={x.rewards}>
            {LANDING_REWARDS.map((r, i) => (
              <li
                key={r.tag}
                className={`${x.reward} ${x[`reward_${REWARD_ACCENT[i]}`]}`}
              >
                <span className={x.rewardTag}>{r.tag}</span>
                <h3 className={x.rewardTitle}>{r.title}</h3>
                <p className={x.rewardFig}>
                  <span className={`${x.rewardNum} tnum`}>{r.amount}</span>
                  {r.unit && <span className={x.rewardUnit}>{r.unit}</span>}
                </p>
                <p className={x.rewardDesc}>{r.desc}</p>
              </li>
            ))}
          </ul>
          <div className={x.secAct}>
            <a href={tg} className="btn" data-t="cta" data-t-id="rewards_cta" data-tg rel="noopener">
              <Telegram />
              Mukofot olishni boshlash
            </a>
          </div>
        </section>

        {/* ── Savol-javob ── */}
        <section className={`wrap ${x.band}`}>
          <p className="eyebrow">Savol-javob</p>
          <h2 className={x.xh2}>Savollarga javob</h2>
          <div className={x.faq}>
            {landingFaqItems(s).map((item) => (
              <details key={item.q} className={x.qa}>
                <summary>{item.q}</summary>
                <p className={x.qaA}>
                  {'supportLink' in item && item.supportLink ? (
                    <>
                      <a
                        href={`https://t.me/${s.support_username}`}
                        rel="noopener"
                        data-t="click"
                        data-t-id="support"
                      >
                        @{s.support_username}
                      </a>{' '}
                      ga yozing — holatingizni tekshirib, tez yordam beramiz.
                    </>
                  ) : (
                    item.a
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Yakuniy da'vat ── */}
        <section className={`wrap ${x.band} ${x.bandLast}`}>
          <div className={x.finale}>
            <p className={x.finEyebrow}>Hali kech emas</p>
            <h2 className={x.finH}>
              Ovoz bering.
              <br />
              Pul oling. <span>Shu.</span>
            </h2>
            <p className={x.finP}>
              {s.reviews_count} dan ortiq odam allaqachon to'lov oldi. Navbat sizda.
            </p>
            <ul className={x.finList}>
              {FINALE_BULLETS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className={x.finRow}>
              <a href={tg} className="btn" data-t="cta" data-t-id="final_cta" data-tg rel="noopener">
                <Telegram />
                Hoziroq boshlash
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className={x.siteFoot}>
        <div className={`wrap ${x.siteFootIn}`}>
          <a href="#top" className={x.footBrand} aria-label={SITE.brand}>
            <Logo size={40} className={x.footLogo} />
            <span className={x.footName}>Milliy jamoasi</span>
          </a>
          <p className={x.footNote}>
            To'lovlar Telegram bot orqali amalga oshiriladi. Barcha huquqlar himoyalangan.
          </p>
          <a
            href={tg}
            className={x.footBot}
            data-t="cta"
            data-t-id="foot_bot"
            data-tg
            rel="noopener"
          >
            @{botClean}
          </a>
        </div>
      </footer>

      <Tracker />

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
