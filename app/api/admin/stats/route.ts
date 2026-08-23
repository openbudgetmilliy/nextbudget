import { requireAdmin } from '@/lib/auth';
import { jsonSafe } from '@/lib/prisma';
import {
  breakdown,
  creatives,
  hourly,
  onlineNow,
  overview,
  pageButtons,
  pageStats,
  recentCta,
  scrollFunnel,
  sessionList,
  sessionTimeline,
  topButtons,
} from '@/lib/stats';
import { parseRange } from '@/lib/range';

/**
 * Dashboard ma'lumotlari. Admin sahifalari asosan server component'da
 * to'g'ridan-to'g'ri `lib/stats.ts`ni chaqiradi; bu endpoint client'dagi
 * "yangilash" tugmasi va tashqi monitoring uchun.
 *
 * Vaqt oralig'i sahifalardagi BILAN BIR XIL parametrlarni oladi
 * (`lib/range.ts`): `?h=24` yoki `?d=2026-08-22&t=9-18`. Eski `?hours=`
 * ham ishlaydi — tashqi monitoring buzilmasin.
 *
 * GET /api/admin/stats?view=overview&h=24
 * GET /api/admin/stats?view=pages&d=2026-08-22&t=9-18
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const q = new URL(req.url).searchParams;
  const view = q.get('view') ?? 'overview';
  const r = parseRange(
    {
      // `hours` — eski nom, `h` — sahifalardagi nom. Ikkalasi ham qabul qilinadi
      h: q.get('h') ?? q.get('hours') ?? undefined,
      d: q.get('d') ?? undefined,
      d2: q.get('d2') ?? undefined,
      t: q.get('t') ?? undefined,
    },
    24,
  );

  /** Har javobga tanlangan oraliq ham qo'shiladi — chaqiruvchi nimani
      olganini bilib tursin (soat oynasi jim qo'llanib qolmasin) */
  const json = (data: unknown) =>
    Response.json(
      { ok: true, range: { from: r.from, to: r.to, label: r.label }, data: jsonSafe(data) },
      { headers: { 'Cache-Control': 'no-store' } },
    );

  try {
    switch (view) {
      case 'overview':
        return json({ ...(await overview(r)), online: await onlineNow() });
      case 'buttons':
        return json(await topButtons(r));
      // Sahifalar kesimi — har kadr alohida reklama qilingani uchun
      case 'pages':
        return json({ pages: await pageStats(r), buttons: await pageButtons(r) });
      case 'creatives':
        return json(await creatives(r, q.get('source') ?? 'instagram'));
      case 'scroll':
        return json(await scrollFunnel(r));
      case 'hourly':
        return json(await hourly(r));
      case 'devices':
        return json({
          device: await breakdown('device', r),
          browser: await breakdown('browser', r),
          os: await breakdown('os', r),
          source: await breakdown('utmSource', r),
        });
      case 'recent':
        return json(await recentCta(r, 20));
      case 'sessions':
        return json(await sessionList(r, 100, q.get('converted') === '1'));
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
