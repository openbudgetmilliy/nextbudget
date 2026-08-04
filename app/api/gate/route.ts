import { clientIp, rateLimit, setGateCookies } from '@/lib/auth';
import { verifyTurnstile } from '@/lib/turnstile';
import { GATE_ON } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 20 urinish / 10 daqiqa bir IP uchun — odam uchun mo'l, botga qimmat */
const LIMIT = 20;
const WINDOW = 10 * 60;

/**
 * Kirish darvozasi: Turnstile tokenini tekshiradi va `gt` cookie'sini beradi.
 * Muvaffaqiyatli javobdan keyin brauzer `/l` ga o'tishi mumkin.
 */
export async function POST(req: Request): Promise<Response> {
  // Kalitlar qo'yilmagan bo'lsa darvoza umuman yo'q — cookie ham kerak emas.
  if (!GATE_ON) return Response.json({ ok: true, skipped: true });

  const ip = clientIp(req);

  const rl = await rateLimit(`gate:${ip}`, LIMIT, WINDOW);
  if (!rl.ok) {
    return Response.json(
      { ok: false, error: 'Juda ko’p urinish. Birozdan keyin qayta urinib ko’ring.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  let body: { token?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'Noto’g’ri so’rov' }, { status: 400 });
  }

  // Turnstile tokeni ~2KB gacha bo'lishi mumkin, lekin cheksiz emas
  const token = typeof body.token === 'string' ? body.token.slice(0, 4096) : '';
  if (!token) {
    return Response.json({ ok: false, error: 'Tasdiqlash topilmadi' }, { status: 400 });
  }

  if (!(await verifyTurnstile(token, ip))) {
    return Response.json(
      { ok: false, error: 'Tasdiqlash o’tmadi. Qayta urinib ko’ring.' },
      { status: 403 },
    );
  }

  await setGateCookies();
  return Response.json({ ok: true });
}
