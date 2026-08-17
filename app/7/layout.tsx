import { Inter, Space_Grotesk } from 'next/font/google';

/**
 * Variant 7 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas.
 *
 * `app/fonts.ts` root layout'ga ulangan: u yerga qo'shilgan har bir oila
 * BARCHA sahifalarga (jumladan `/l` va darvozaga) preload bo'lib tushardi.
 * Asosiy landing bitta Archivo bilan yashaydi, shuning uchun bu ikki oila
 * faqat `/7` so'ralganda yuklanadi.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--f7-body',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--f7-display',
  display: 'swap',
});

export default function VariantSevenLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${display.variable}`}>{children}</div>;
}
