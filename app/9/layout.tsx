import { Inter, Sora } from 'next/font/google';

/**
 * Variant 9 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas.
 *
 * `app/fonts.ts` root layout'ga ulangan: u yerga qo'shilgan har bir oila
 * BARCHA sahifalarga (jumladan `/l` va darvozaga) preload bo'lib tushardi.
 * Asosiy landing bitta Archivo bilan yashaydi, shuning uchun bu ikki oila
 * faqat `/9` so'ralganda yuklanadi.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--f9-body',
  display: 'swap',
});

const display = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--f9-display',
  display: 'swap',
});

export default function VariantNineLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${display.variable}`}>{children}</div>;
}
