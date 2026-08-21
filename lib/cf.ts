import 'server-only';
import { revalidatePath } from 'next/cache';
import { env } from './env';
import { LANDING_PATHS } from './pages';

/**
 * Narx o'zgarganda ikki qatlamli cache'ni tozalash.
 *
 *   1) Next ISR (disk) — `revalidatePath('/')`
 *   2) Cloudflare edge — URL bo'yicha purge
 *
 * MUHIM (PM2 cluster, 2 instance): Next'ning in-memory ISR keshi o'chirilgan
 * (`cacheMaxMemorySize: 0`), shuning uchun revalidate diskka yoziladi va
 * ikkinchi instance ham darhol yangi HTML'ni ko'radi. Aks holda bir instance
 * eski narxni ko'rsatib turardi.
 */

export async function purgeCloudflare(urls: string[]): Promise<boolean> {
  if (!env.CF_ZONE_ID || !env.CF_API_TOKEN) return false;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: urls }),
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      },
    );
    if (!res.ok) console.error('[cf] purge', res.status, await res.text().catch(() => ''));
    return res.ok;
  } catch (err) {
    console.error('[cf] purge', (err as Error).message);
    return false;
  }
}

/**
 * Landing'ni to'liq yangilash: ISR + CF edge.
 *
 * Barcha kadrlar yangilanadi — ro'yxat `lib/pages.ts` da. Narx yoki bot
 * havolasi sozlamada bir marta o'zgarganda HAMMASI ham yangilanishi shu
 * yerda ta'minlanadi; birortasi tushib qolsa eski narx bilan qolib ketardi.
 * CF'da shu yo'llar va sitemap purge qilinadi.
 */

export async function refreshLanding(): Promise<{ isr: true; cf: boolean }> {
  for (const p of LANDING_PATHS) revalidatePath(p);
  const cf = await purgeCloudflare([
    `${env.SITE_URL}`,
    ...LANDING_PATHS.map((p) => `${env.SITE_URL}${p}`),
    `${env.SITE_URL}/sitemap.xml`,
  ]);
  return { isr: true, cf };
}
