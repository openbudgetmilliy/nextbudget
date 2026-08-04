/**
 * Telegram deep link.
 *
 * SSG sahifa foydalanuvchining UTM'ini bilmaydi, shuning uchun server
 * bazaviy `start` qiymatini qo'yadi. Sahifa yuklangach `lib/track.ts`
 * ichidagi `stampTelegramLinks()` uni UTM'dan olingan qiymatga almashtiradi.
 * JS ishlamasa ham havola ishlaydi.
 */
export function tgLink(bot: string, start = 'web'): string {
  const b = bot.replace(/^@/, '');
  const s = start.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 60) || 'web';
  return `https://t.me/${b}?start=${s}`;
}
