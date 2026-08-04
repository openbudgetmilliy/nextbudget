import { prisma } from '@/lib/prisma';
import { rateLimit, clientIp } from '@/lib/auth';

/**
 * Forma (agar kerak bo'lsa). Bu yo'l Postgres'ga yozadi, shuning uchun
 * qattiq rate limit ostida: 5 ta yuborish / 10 daqiqa / IP.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PHONE = /^\+?998\d{9}$/;

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  const withCode = digits.length === 9 ? `998${digits}` : digits;
  const phone = `+${withCode}`;
  return PHONE.test(phone) ? phone : null;
}

export async function POST(req: Request): Promise<Response> {
  const ip = clientIp(req);
  const rl = await rateLimit(`lead:${ip}`, 5, 600);
  if (!rl.ok) {
    return Response.json(
      { ok: false, error: 'Juda ko’p urinish. Keyinroq qayta yuboring.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  let data: { name?: unknown; phone?: unknown; sessionId?: unknown; source?: unknown };
  try {
    data = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'Noto’g’ri so’rov' }, { status: 400 });
  }

  const phone = typeof data.phone === 'string' ? normalizePhone(data.phone) : null;
  if (!phone) {
    return Response.json({ ok: false, error: 'Telefon raqami noto’g’ri' }, { status: 400 });
  }

  try {
    await prisma.lead.create({
      data: {
        phone,
        name: typeof data.name === 'string' ? data.name.slice(0, 80) : null,
        sessionId: typeof data.sessionId === 'string' ? data.sessionId.slice(0, 40) : null,
        source: typeof data.source === 'string' ? data.source.slice(0, 60) : null,
      },
    });
  } catch (err) {
    console.error('[lead]', (err as Error).message);
    return Response.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
