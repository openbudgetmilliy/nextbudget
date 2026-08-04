import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { refreshLanding } from '@/lib/cf';
import { DEFAULT_SETTINGS } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(Object.keys(DEFAULT_SETTINGS));

export async function GET(): Promise<Response> {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await prisma.setting.findMany();
  const values: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) values[r.key] = r.value;
  return Response.json({ ok: true, values, keys: [...ALLOWED] });
}

export async function PATCH(req: Request): Promise<Response> {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Noto’g’ri JSON' }, { status: 400 });
  }

  const updates = Object.entries(body as Record<string, unknown>)
    .filter(([k, v]) => ALLOWED.has(k) && typeof v === 'string')
    .map(([k, v]) => ({ key: k, value: (v as string).slice(0, 500) }));

  if (!updates.length) {
    return Response.json({ ok: false, error: 'Ruxsat etilgan maydon yo’q' }, { status: 400 });
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.setting.upsert({
        where: { key: u.key },
        create: { key: u.key, value: u.value },
        update: { value: u.value },
      }),
    ),
  );

  const cache = await refreshLanding();
  return Response.json({ ok: true, updated: updates.length, cache });
}
