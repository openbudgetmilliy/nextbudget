import { Inter, Orbitron } from 'next/font/google';

/**
 * Variant 8 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas.
 *
 * `app/fonts.ts` root layout'ga ulangan: u yerga qo'shilgan har bir oila
 * BARCHA sahifalarga (jumladan `/l` va darvozaga) preload bo'lib tushardi.
 * Asosiy landing bitta Archivo bilan yashaydi, shuning uchun bu ikki oila
 * faqat `/8` so'ralganda yuklanadi.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--f8-body',
  display: 'swap',
});

const display = Orbitron({
  subsets: ['latin'],
  weight: ['600', '800'],
  variable: '--f8-display',
  display: 'swap',
});

export default function VariantEightLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${display.variable}`}>{children}</div>;
}
