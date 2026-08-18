import { Inter, Space_Grotesk } from 'next/font/google';

/**
 * Sayt shriftlari — root layout'ga ulanadi.
 *
 * Sayt bitta sahifadan iborat, shuning uchun shriftlar ham shu yerda:
 * ilgari ular `/7` marshrutining o'z layout'ida edi, chunki boshqa
 * variantlar boshqa oilada terilardi va ularga ortiqcha preload tushmasligi
 * kerak edi. Endi bunday muammo yo'q.
 *
 * Space Grotesk — sarlavhalar (700), Inter — matn (400/500/600).
 * Ikkalasi ham `display: swap`: shrift kelguncha matn ko'rinib turadi.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--f-body',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--f-display',
  display: 'swap',
});

export const fontVars = `${body.variable} ${display.variable}`;
