/**
 * Kampaniya oynasi — BARCHA kadrlardagi taymerlar shu sanaga sanaydi.
 *
 * Muddat o'tsa kadrlarda «Ovoz berish muddati tugadi» chiqadi — yangi
 * kampaniya boshlanganda SHU QATORNI yangilash kifoya, hamma kadr
 * birdan yangi sanaga o'tadi.
 */
export const CAMPAIGN_END = new Date('2026-08-30T23:59:00+05:00').getTime();

/**
 * Qolgan millisekund — SERVER tomonda hisoblanadi.
 *
 * `components/landing/Countdown` ga boshlang'ich qiymat sifatida beriladi:
 * client birinchi renderda AYNAN shuni chizadi, ya'ni gidratatsiya mos
 * keladi. Kadrlar SSG va keshdan kelgani uchun bu qiymat bir necha daqiqa
 * eskirgan bo'lishi mumkin — client uni mount bo'lgan zahoti to'g'irlaydi.
 */
export function campaignLeft(): number {
  return Math.max(0, CAMPAIGN_END - Date.now());
}

/**
 * Muddat hali tugamaganmi.
 *
 * Tugagan bo'lsa kadr taymerni UMUMAN chizmaydi: nol turgan taymer
 * «aksiya tugadi» degan xabar bo'lib, reklama trafigini bekorga yoqib
 * yuborardi.
 */
export function isOpen(): boolean {
  return campaignLeft() > 0;
}
