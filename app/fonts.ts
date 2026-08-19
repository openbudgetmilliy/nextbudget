import { Inter } from 'next/font/google';

/**
 * Sayt shrifti — root layout'ga ulanadi.
 *
 * Bitta oila, xolos. Bosh sahifa «Energetik» dizaynida sarlavha ham, matn
 * ham Inter bilan teriladi — farq faqat og'irlikda (800 va 400/500).
 * Ilgari sarlavhalar uchun Space Grotesk yuklanardi; sariq slaydda uning
 * o'rni yo'q, shuning uchun u bilan birga ortiqcha shrift so'rovi ham ketdi.
 *
 * `display: swap`: shrift kelguncha matn ko'rinib turadi — reklama
 * trafigida birinchi kadr bo'sh qolmasligi muhim.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--f-body',
  display: 'swap',
});

export const fontVars = body.variable;
