import { Archivo } from 'next/font/google';

/**
 * Plakat tipografikasi — Archivo, `wdth` o'qi bilan.
 *
 * Archivo o'zgaruvchan shrift: kenglik 62% dan 125% gacha, og'irlik 100–900.
 * Sarlavha 62% kenglik + 900 og'irlikda teriladi — bu ko'chadagi plakat
 * harflari: tor, qalin, baland. Shu bitta oiladan asosiy matn ham olinadi
 * (100% kenglik, 400), ya'ni ikkinchi shrift fayli yuklanmaydi.
 *
 * Nega Anton emas: Anton aynan shu ko'rinish uchun eng ko'p ishlatiladigan
 * shrift va bitta og'irligi bor. `wdth` o'qi esa kenglikni qo'lda boshqarish
 * imkonini beradi — sarlavha tor, yorliqlar keng bo'lib, bitta oila ichida
 * qarama-qarshilik hosil qiladi.
 */
export const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-display',
  display: 'swap',
});

export const fontVars = display.variable;
