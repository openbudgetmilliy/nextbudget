import { Archivo } from 'next/font/google';

/**
 * Neo-brutalist tipografika — bitta display shrift yetadi.
 *
 * Qo'llanmada Clash Display (Fontshare CDN) ko'rsatilgan, lekin u ish vaqtida
 * uchinchi domenga so'rov qiladi va bu loyihaning "tashqi shrift yo'q"
 * printsipini buzadi. Qo'llanmaning O'Z muqobillari ro'yxatidan (Space Grotesk,
 * Archivo, Anton, Bricolage Grotesque) Archivo tanlandi: 900 og'irligi bor
 * (`font-black` uchun shart), `next/font` orqali o'z domenimizdan beriladi.
 *
 * Asosiy matn — tizim sans stack'i, aynan qo'llanmadagidek. Yuklab olinadigan
 * fayl yo'q, raqamlar `tabular-nums` bilan hizalanadi.
 */
export const display = Archivo({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const fontVars = display.variable;
