import { requireAdmin } from '@/lib/auth';
import { jsonSafe } from '@/lib/prisma';
import {
  breakdown,
  creatives,
  hourly,
  onlineNow,
  overview,
  recentCta,
  scrollFunnel,
  sessionList,
  sessionTimeline,
  topButtons,
} from '@/lib/stats';

/**
 * Dashboard ma'lumotlari. Admin sahifalari asosan server component'da
 * to'g'ridan-to'g'ri `lib/stats.ts`ni chaqiradi; bu endpoint client'dagi
 * "yangilash" tugmasi va tashqi monitoring uchun.
 *
 * GET /api/admin/stats?view=overview&hours=24
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const q = new URL(req.url).searchParams;
  const view = q.get('view') ?? 'overview';
  const hours = Math.min(Math.max(Number(q.get('hours') ?? 24) || 24, 1), 24 * 90);

  try {
    switch (view) {
      case 'overview':
        return json({ ...(await overview(hours)), online: await onlineNow() });
      case 'buttons':
        return json(await topButtons(hours));
      case 'creatives':
        return json(await creatives(hours, q.get('source') ?? 'instagram'));
      case 'scroll':
        return json(await scrollFunnel(hours));
      case 'hourly':
        return json(await hourly(hours));
      case 'devices':
        return json({
          device: await breakdown('device', hours),
          browser: await breakdown('browser', hours),
          os: await breakdown('os', hours),
          source: await breakdown('utmSource', hours),
        });
      case 'recent':
        return json(await recentCta(20));
      case 'sessions':
        return json(await sessionList(hours, 100, q.get('converted') === '1'));
      case 'session': {
        const id = q.get('id');
        if (!id) return Response.json({ ok: false, error: 'id kerak' }, { status: 400 });
        return json(await sessionTimeline(id));
      }
      default:
        return Response.json({ ok: false, error: 'Noma’lum view' }, { status: 400 });
    }
  } catch (err) {
    console.error('[stats]', (err as Error).message);
    return Response.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }
}

function json(data: unknown): Response {
  return Response.json({ ok: true, data: jsonSafe(data) }, { headers: { 'Cache-Control': 'no-store' } });
}
