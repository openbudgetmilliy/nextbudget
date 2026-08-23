import { Inter, Space_Grotesk } from 'next/font/google';

/**
 * `/11` shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas.
 *
 * `app/fonts.ts` root layout'ga ulangan: u yerga qo'shilgan oila BARCHA
 * kadrlarga tushardi. Bu ikkisi esa faqat `/11` so'ralganda yuklanadi —
 * qolgan o'nta kadr ortiqcha shrift so'rovini ko'tarmaydi.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--f11-body',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--f11-display',
  display: 'swap',
});

export default function KadrOnBirLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${display.variable}`}>{children}</div>;
}
