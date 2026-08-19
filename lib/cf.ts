import 'server-only';
import { revalidatePath } from 'next/cache';
import { env } from './env';

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
 * Barcha landing kadrlar yangilanadi: `/` («Milliy»), `/2` (sariq
 * «Energetik») va `/3` («Gradient») — muqobil reklama kadrlari. CF'da
 * shular va sitemap purge qilinadi.
 */
export async function refreshLanding(): Promise<{ isr: true; cf: boolean }> {
  revalidatePath('/');
  revalidatePath('/2');
  revalidatePath('/3');
  const cf = await purgeCloudflare([
    `${env.SITE_URL}/`,
    `${env.SITE_URL}`,
    `${env.SITE_URL}/2`,
    `${env.SITE_URL}/3`,
    `${env.SITE_URL}/sitemap.xml`,
  ]);
  return { isr: true, cf };
}
