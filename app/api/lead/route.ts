import { cookies } from 'next/headers';

import { prisma } from '@/lib/prisma';
import { rateLimit, clientIp } from '@/lib/auth';
import { GATE_COOKIE, hasGate } from '@/lib/jwt';
import { GATE_ON } from '@/lib/env';

/**
 * Forma (agar kerak bo'lsa). Bu yo'l Postgres'ga yozadi, shuning uchun
 * qattiq rate limit ostida: 5 ta yuborish / 10 daqiqa / IP.
 *
 * Bundan tashqari fondagi Turnstile tekshiruvidan o'tgan bo'lish shart —
 * `gt` cookie'si `components/TurnstileGuard.tsx` → `/api/gate` zanjirida
 * beriladi. Landing hammaga ochiq, lekin BAZAGA YOZADIGAN yagona ommaviy
 * yo'l shu, shuning uchun himoya aynan shu yerda turadi: skript bilan
 * yuborilgan minglab soxta lead Postgres'ga tushmaydi.
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

  if (GATE_ON) {
    const jar = await cookies();
    if (!(await hasGate(jar.get(GATE_COOKIE)?.value))) {
      return Response.json(
        { ok: false, error: 'Tasdiqlash o’tmadi. Sahifani yangilab, qayta urinib ko’ring.' },
        { status: 403 },
      );
    }
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
