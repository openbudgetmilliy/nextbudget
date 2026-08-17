import Logo from '@/components/Logo';
import { Telegram } from '@/components/Icons';
import type { Settings } from '@/lib/data';
import {
  FINALE_BULLETS,
  LANDING_REWARDS,
  LANDING_STEPS,
  landingFaqItems,
  liveStats,
} from '@/lib/landing-sections';

/** Variant pastki bo'limlari uchun CSS class nomlari */
export type VariantSectionClasses = {
  statsSec?: string;
  secIn?: string;
  secHead?: string;
  stats?: string;
  statRow?: string;
  stat?: string;
  statNum?: string;
  statLab?: string;
  sec?: string;
  secSteps?: string;
  secRewards?: string;
  secFaq?: string;
  kicker?: string;
  h2?: string;
  secTitle?: string;
  secSub?: string;
  secAct?: string;
  steps?: string;
  step?: string;
  stepNum?: string;
  stepH?: string;
  stepP?: string;
  stepTitle?: string;
  stepText?: string;
  grid?: string;
  card?: string;
  cardHot?: string;
  cardBadge?: string;
  cardAmt?: string;
  cardNum?: string;
  cardUnit?: string;
  cardCur?: string;
  cardPrice?: string;
  cardTitle?: string;
  cardPer?: string;
  per?: string;
  faq?: string;
  faqList?: string;
  faqItem?: string;
  faqQ?: string;
  faqA?: string;
  faqBody?: string;
  faqIco?: string;
  faqIcon?: string;
  faqMark?: string;
  faqSum?: string;
  finalSec?: string;
  final?: string;
  finEyebrow?: string;
  finalH?: string;
  finalTitle?: string;
  finalHl?: string;
  finalP?: string;
  finalSub?: string;
  finalList?: string;
  finalRow?: string;
  cta?: string;
  btnPop?: string;
  btnBig?: string;
  btnSun?: string;
  btn?: string;
  btnLight?: string;
  foot?: string;
  footIn?: string;
  footBrand?: string;
  footLogo?: string;
  footName?: string;
  footNote?: string;
  footBot?: string;
  legal?: string;
  finalPanel?: string;
  ctaRing?: string;
  ctaArrow?: string;
};

type Props = {
  prefix: string;
  tg: string;
  botClean: string;
  s: Settings;
  c: VariantSectionClasses;
  /** Hero ichida stats bo'lsa (v3) — takrorlanmasin */
  skipStats?: boolean;
};

function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

function SectionHeader({ c, kicker, title, sub }: { c: VariantSectionClasses; kicker: string; title: string; sub: string }) {
  const head = (
    <>
      <p className={c.kicker}>{kicker}</p>
      <h2 className={c.h2 ?? c.secTitle}>{title}</h2>
      {sub ? <p className={c.secSub}>{sub}</p> : null}
    </>
  );
  return c.secHead ? <div className={c.secHead}>{head}</div> : head;
}

function StatsBlock({ c, s }: { c: VariantSectionClasses; s: Settings }) {
  const wrapClass = c.stats ?? c.statRow;
  return (
    <>
      <div className={wrapClass}>
        {liveStats(s).map((item) => (
          <div key={item.lab} className={c.stat}>
            <span className={cx(c.statNum, 'tnum')}>{item.num}</span>
            <span className={c.statLab}>{item.lab}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function StepsBlock({
  prefix,
  tg,
  c,
  ctaClass,
}: {
  prefix: string;
  tg: string;
  c: VariantSectionClasses;
  ctaClass?: string;
}) {
  const stepTitleClass = c.stepH ?? c.stepTitle;
  const stepTextClass = c.stepP ?? c.stepText;

  return (
    <>
      <SectionHeader c={c} kicker="Jarayon" title="3 qadam, xolos" sub="Ro'yxatdan o'tish yo'q. Hujjat yo'q. Faqat ovoz va to'lov." />
      <ol className={c.steps}>
        {LANDING_STEPS.map((step) => (
          <li key={step.n} className={c.step}>
            <span className={cx(c.stepNum, 'tnum')}>{step.n}</span>
            {stepTitleClass && <h3 className={stepTitleClass}>{step.title}</h3>}
            {stepTextClass && <p className={stepTextClass}>{step.text}</p>}
          </li>
        ))}
      </ol>
      {c.secAct && ctaClass && (
        <div className={c.secAct}>
          <a
            href={tg}
            className={cx(ctaClass, c.btnBig)}
            data-t="cta"
            data-t-id={`${prefix}_steps`}
            data-tg
            rel="noopener"
          >
            <Telegram size={20} />
            Hoziroq boshlash
          </a>
        </div>
      )}
    </>
  );
}

function RewardsBlock({
  prefix,
  tg,
  c,
  ctaClass,
}: {
  prefix: string;
  tg: string;
  c: VariantSectionClasses;
  ctaClass?: string;
}) {
  const titleClass = c.cardTitle ?? c.cardPrice;
  const descClass = c.cardPer ?? c.per;

  return (
    <>
      <SectionHeader c={c} kicker="Mukofot" title="Nima olasiz" sub="Ovoz bergandan so'ng avtomatik to'lanadi." />
      <ul className={c.grid}>
        {LANDING_REWARDS.map((r, i) => (
          <li key={r.tag} className={cx(c.card, i === 2 && c.cardHot)}>
            <span className={c.cardBadge}>{r.tag}</span>
            <p className={c.cardAmt}>
              <span className={cx(c.cardNum, 'tnum')}>{r.amount}</span>
              {r.unit && <span className={c.cardUnit ?? c.cardCur}>{r.unit}</span>}
            </p>
            {titleClass && <p className={titleClass}>{r.title}</p>}
            {descClass && <p className={descClass}>{r.desc}</p>}
          </li>
        ))}
      </ul>
      {c.secAct && ctaClass && (
        <div className={c.secAct}>
          <a
            href={tg}
            className={cx(ctaClass, c.btnBig)}
            data-t="cta"
            data-t-id={`${prefix}_rewards`}
            data-tg
            rel="noopener"
          >
            <Telegram size={20} />
            Mukofot olishni boshlash
          </a>
        </div>
      )}
    </>
  );
}

function FaqBlock({
  s,
  c,
  faq,
  faqWrap,
  faqItemClass,
  faqSummaryClass,
  faqAnswerClass,
}: {
  s: Settings;
  c: VariantSectionClasses;
  faq: ReturnType<typeof landingFaqItems>;
  faqWrap?: string;
  faqItemClass?: string;
  faqSummaryClass?: string;
  faqAnswerClass?: string;
}) {
  return (
    <>
      <SectionHeader c={c} kicker="Savol-javob" title="Savollarga javob" sub="" />
      <div className={faqWrap}>
        {faq.map((item) => (
          <details key={item.q} className={faqItemClass}>
            <summary className={faqSummaryClass}>
              {item.q}
              {(c.faqIco || c.faqIcon || c.faqMark) && (
                <span className={c.faqIco ?? c.faqIcon ?? c.faqMark} aria-hidden />
              )}
            </summary>
            <p className={faqAnswerClass}>
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
    </>
  );
}

function FinaleContent({
  s,
  tg,
  prefix,
  c,
  ctaClass,
}: {
  s: Settings;
  tg: string;
  prefix: string;
  c: VariantSectionClasses;
  ctaClass?: string;
}) {
  const finalHClass = c.finalH ?? c.finalTitle;
  const finalPClass = c.finalP ?? c.finalSub;

  return (
    <>
      {c.finEyebrow && <p className={c.finEyebrow}>Hali kech emas</p>}
      <h2 className={finalHClass}>
        Ovoz bering.
        {c.finalHl ? (
          <>
            {' '}
            Pul oling. <span className={c.finalHl}>Shu.</span>
          </>
        ) : (
          <>
            <br />
            Pul oling. <span>Shu.</span>
          </>
        )}
      </h2>
      <p className={finalPClass}>
        {s.reviews_count} dan ortiq odam allaqachon to'lov oldi. Navbat sizda.
      </p>
      {c.finalList && (
        <ul className={c.finalList}>
          {FINALE_BULLETS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      <div className={c.finalRow ?? c.ctaRing}>
        <a
          href={tg}
          className={cx(ctaClass, c.btnBig, c.btnSun, c.btnLight)}
          data-t="cta"
          data-t-id={`${prefix}_final`}
          data-tg
          rel="noopener"
        >
          <Telegram size={20} />
          Hoziroq boshlash
          {c.ctaArrow && (
            <span className={c.ctaArrow} aria-hidden>
              →
            </span>
          )}
        </a>
      </div>
    </>
  );
}

export default function VariantSections({ prefix, tg, botClean, s, c, skipStats }: Props) {
  const faq = landingFaqItems(s);
  const ctaClass = c.cta ?? c.btnPop ?? c.btn ?? c.btnLight;
  const faqWrap = c.faqList ?? c.faq;
  const faqItemClass = c.faqItem ?? c.faq;
  const faqSummaryClass = c.faqQ ?? c.faqSum;
  const faqAnswerClass = c.faqA ?? c.faqBody;

  return (
    <>
      {!skipStats && (
        <section className={c.statsSec} aria-label="Ko'rsatkichlar">
          {c.secIn ? (
            <div className={c.secIn}>
              <StatsBlock c={c} s={s} />
            </div>
          ) : (
            <StatsBlock c={c} s={s} />
          )}
        </section>
      )}

      <section className={c.secSteps ?? c.sec}>
        {c.secIn ? (
          <div className={c.secIn}>
            <StepsBlock prefix={prefix} tg={tg} c={c} ctaClass={ctaClass} />
          </div>
        ) : (
          <StepsBlock prefix={prefix} tg={tg} c={c} ctaClass={ctaClass} />
        )}
      </section>

      <section className={c.secRewards ?? c.sec} id="mukofot">
        {c.secIn ? (
          <div className={c.secIn}>
            <RewardsBlock prefix={prefix} tg={tg} c={c} ctaClass={ctaClass} />
          </div>
        ) : (
          <RewardsBlock prefix={prefix} tg={tg} c={c} ctaClass={ctaClass} />
        )}
      </section>

      <section className={c.secFaq ?? c.sec}>
        {c.secIn ? (
          <div className={c.secIn}>
            <FaqBlock
              s={s}
              c={c}
              faq={faq}
              faqWrap={faqWrap}
              faqItemClass={faqItemClass}
              faqSummaryClass={faqSummaryClass}
              faqAnswerClass={faqAnswerClass}
            />
          </div>
        ) : (
          <FaqBlock
            s={s}
            c={c}
            faq={faq}
            faqWrap={faqWrap}
            faqItemClass={faqItemClass}
            faqSummaryClass={faqSummaryClass}
            faqAnswerClass={faqAnswerClass}
          />
        )}
      </section>

      <section className={cx(c.finalSec, c.finalPanel)}>
        {c.final ? (
          <div className={c.final}>
            <FinaleContent s={s} tg={tg} prefix={prefix} c={c} ctaClass={ctaClass} />
          </div>
        ) : (
          <FinaleContent s={s} tg={tg} prefix={prefix} c={c} ctaClass={ctaClass} />
        )}
      </section>

      <footer className={c.foot}>
        {c.footIn ? (
          <div className={c.footIn}>
            {c.footBrand ? (
              <>
                <a href="#top" className={c.footBrand} aria-label="Milliy jamoasi">
                  <Logo size={40} className={c.footLogo} />
                  <span className={c.footName}>Milliy jamoasi</span>
                </a>
                <p className={c.footNote}>
                  To'lovlar Telegram bot orqali amalga oshiriladi. Barcha huquqlar himoyalangan.
                </p>
                <a
                  href={tg}
                  className={c.footBot}
                  data-t="cta"
                  data-t-id={`${prefix}_foot_bot`}
                  data-tg
                  rel="noopener"
                >
                  @{botClean}
                </a>
              </>
            ) : (
              <p className={c.legal}>
                To'lovlar Telegram bot orqali amalga oshiriladi. Barcha huquqlar himoyalangan.{' '}
                <a href={tg} data-t="cta" data-t-id={`${prefix}_foot_bot`} data-tg rel="noopener">
                  @{botClean}
                </a>
              </p>
            )}
          </div>
        ) : (
          <p className={c.legal}>
            To'lovlar Telegram bot orqali amalga oshiriladi. Barcha huquqlar himoyalangan.{' '}
            <a href={tg} data-t="cta" data-t-id={`${prefix}_foot_bot`} data-tg rel="noopener">
              @{botClean}
            </a>
          </p>
        )}
      </footer>
    </>
  );
}
