/**
 * Kichik User-Agent parser.
 *
 * Nega tashqi kutubxona emas (`ua-parser-js` va h.k.):
 *  · Bizga faqat uch narsa kerak — device / os / browser guruhi.
 *  · Asosiy trafik Instagram in-app WebView'dan keladi, ammo u o'zini
 *    "Safari" yoki "Chrome" deb ko'rsatadi. Umumiy kutubxonalar shu
 *    holatni aniqlay olmaydi — biz esa aynan shu farqni bilishimiz kerak,
 *    chunki WebView'da konversiya boshqacha bo'ladi.
 *  · Nol dependency, nol tur muammosi, worker bundle'i kichik qoladi.
 *
 * Tartib MUHIM: in-app brauzerlar eng oldin tekshiriladi.
 */

export type UaInfo = { device: string; os: string | null; browser: string | null };

const BROWSERS: [RegExp, string][] = [
  // ── In-app WebView'lar (birinchi navbatda) ──
  [/Instagram/i, 'instagram'],
  [/\[FB(AN|AV|_IAB)|FBAV|FBIOS/i, 'facebook'],
  [/Telegram/i, 'telegram'],
  [/TikTok|BytedanceWebview|musical_ly/i, 'tiktok'],
  [/Line\//i, 'line'],
  [/Snapchat/i, 'snapchat'],
  [/Twitter|TwitterAndroid/i, 'twitter'],

  // ── Oddiy brauzerlar ──
  [/YaBrowser|YaSearchBrowser/i, 'yandex'],
  [/OPR\/|Opera|OPT\//i, 'opera'],
  [/Edg[eA]?\//i, 'edge'],
  [/SamsungBrowser/i, 'samsung'],
  [/UCBrowser|UBrowser/i, 'uc'],
  [/MiuiBrowser/i, 'miui'],
  [/Firefox|FxiOS/i, 'firefox'],
  [/CriOS/i, 'chrome'],
  [/Chrome|Chromium/i, 'chrome'],
  [/Safari/i, 'safari'],

  // ── Botlar ──
  [/bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|headless/i, 'bot'],
];

const OSES: [RegExp, string][] = [
  [/iPhone|iPod/i, 'iOS'],
  [/iPad/i, 'iPadOS'],
  [/Android/i, 'Android'],
  [/Windows NT/i, 'Windows'],
  [/Mac OS X|Macintosh/i, 'macOS'],
  [/CrOS/i, 'ChromeOS'],
  [/Linux|X11/i, 'Linux'],
  [/HarmonyOS/i, 'HarmonyOS'],
];

const MOBILE = /Mobile|Android|iPhone|iPod|Windows Phone|Opera Mini|IEMobile/i;
const TABLET = /iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i;

function match(ua: string, table: [RegExp, string][]): string | null {
  for (const [re, name] of table) if (re.test(ua)) return name;
  return null;
}

export function parseUa(ua: string | null | undefined): UaInfo {
  if (!ua) return { device: 'unknown', os: null, browser: null };

  const device = TABLET.test(ua) ? 'tablet' : MOBILE.test(ua) ? 'mobile' : 'desktop';

  return {
    device,
    os: match(ua, OSES),
    browser: match(ua, BROWSERS),
  };
}
