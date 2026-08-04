import 'server-only';
import { env } from './env';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type SiteVerify = {
  success: boolean;
  'error-codes'?: string[];
  hostname?: string;
  action?: string;
};

/**
 * Turnstile tokenini Cloudflare'da tekshirish.
 *
 * MUHIM: token BIR MARTA ishlatiladi — Cloudflare uni birinchi tekshiruvdan
 * keyin bekor qiladi. Shu sabab bu funksiya har token uchun bir marta
 * chaqirilishi kerak (qayta urinish = `timeout-or-duplicate` xatosi).
 *
 * Tarmoq yiqilsa `false` qaytaradi — "shubhali bo'lsa kiritmaymiz".
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return false;

  const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  if (ip && ip !== 'unknown') form.set('remoteip', ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[turnstile] http', res.status);
      return false;
    }

    const data = (await res.json()) as SiteVerify;
    if (!data.success) console.warn('[turnstile] rad etildi:', data['error-codes']?.join(','));
    return data.success === true;
  } catch (err) {
    console.error('[turnstile]', (err as Error).message);
    return false;
  }
}
