/**
 * Telegram deep link.
 *
 * SSG sahifa foydalanuvchining UTM'ini bilmaydi, shuning uchun server
 * bazaviy `start` qiymatini qo'yadi. Sahifa yuklangach `lib/track.ts`
 * ichidagi `stampTelegramLinks()` uning ustiga trafik manbasini qo'shadi.
 * JS ishlamasa ham havola ishlaydi.
 *
 * Havola YETTALA kadrda bitta manbadan keladi — `bot_username` sozlamasi
 * (`/admin/settings`). Admin uni o'zgartirsa, `refreshLanding()` hamma
 * kadrni qayta build qiladi va tugmalar birdek yangi botga ketadi.
 */

/**
 * Sozlamadagi qiymatdan toza username ajratadi.
 *
 * Admin u yerga nima yozishini oldindan bilib bo'lmaydi: kimdir `@Bot`,
 * kimdir `Bot`, kimdir brauzerdan nusxa olib to'liq `https://t.me/Bot?start=x`
 * ni qo'yadi. Uchalasi ham ishlashi kerak — aks holda tugma butun saytda
 * buzuq havolaga aylanadi va buni faqat mijoz sezadi.
 */
export function botUsername(raw: string): string {
  const v = (raw || '').trim();
  // To'liq havola (yoki `t.me/...` sxemasiz) — yo'lning birinchi bo'lagini olamiz
  const m = v.match(/(?:^|\/\/|\s)(?:t(?:elegram)?\.me|telegram\.dog)\/([^/?#\s]+)/i);
  const name = m ? m[1] : v;
  return name.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
}

/**
 * @param bot   sozlamadagi xom qiymat (`@Bot`, `Bot` yoki to'liq havola)
 * @param start qaysi kadrdan kelgani — `lib/pages.ts` dagi `slug` (`p1`…`p7`).
 *              Bot tomonda «bu odam qaysi reklamadan keldi» shundan bilinadi.
 */
export function tgLink(bot: string, start = 'web'): string {
  const b = botUsername(bot);
  const s = start.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 60) || 'web';
  return `https://t.me/${b}?start=${s}`;
}
