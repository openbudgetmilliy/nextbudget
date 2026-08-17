import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';

/**
 * Variant 6 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas.
 *
 * `app/fonts.ts` root layout'ga ulangan: u yerga qo'shilgan har bir oila
 * BARCHA sahifalarga (jumladan `/l` va darvozaga) preload bo'lib tushardi.
 * Asosiy landing bitta Archivo bilan yashaydi va shu tezligini yo'qotmasligi
 * kerak, shuning uchun bu uch oila faqat `/6` so'ralganda yuklanadi.
 *
 * Uchtasi uch vazifa bajaradi va bittasi ham ortiqcha emas:
 *   Bricolage Grotesque — sarlavhalar (tor, qattiq, manfiy trekingli)
 *   Hanken Grotesk      — o'qish matni
 *   JetBrains Mono      — mayda yorliqlar, badge'lar va to'q panel ichi
 */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--f6-display',
  display: 'swap',
});

const body = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--f6-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--f6-mono',
  display: 'swap',
});

export default function VariantSixLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</div>;
}
