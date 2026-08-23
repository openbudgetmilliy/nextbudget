import { Inter, Space_Grotesk } from 'next/font/google';

/**
 * `/8` shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas:
 * u yerdagi oila BARCHA kadrlarga preload bo'lib tushardi.
 *
 *   Space Grotesk — sarlavhalar va raqamlar. Grotesk qurilishi, lekin
 *                   harflari kvadratroq va «a» bir qavatli: to'q fonda
 *                   neon gradient bilan aynan shu oila ishlaydi.
 *   Inter         — o'qish matni, yorliqlar, mayda qatorlar.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--f8-body',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--f8-display',
  display: 'swap',
});

export default function NeonLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${display.variable}`}>{children}</div>;
}
