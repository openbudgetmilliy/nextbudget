import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { refreshLanding } from '@/lib/cf';

/**
 * Narx CRUD. Har o'zgarishdan keyin:
 *   revalidatePath('/')  → Next ISR (disk)
 *   Cloudflare purge     → edge
 * Natijada narx ~5 sekundda yangilanadi, sahifa statik bo'lib qoladi.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UNAUTH = () => Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const BAD = (m: string) => Response.json({ ok: false, error: m }, { status: 400 });

function int(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

function str(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  return s ? s.slice(0, max) : undefined;
}

// ── O'qish ──
export async function GET(): Promise<Response> {
  if (!(await requireAdmin())) return UNAUTH();
  const prices = await prisma.price.findMany({ orderBy: [{ order: 'asc' }, { priceUzs: 'asc' }] });
  return Response.json({ ok: true, prices });
}

// ── Yaratish ──
export async function POST(req: Request): Promise<Response> {
  if (!(await requireAdmin())) return UNAUTH();

  const b = await req.json().catch(() => null);
  if (!b) return BAD('Noto’g’ri JSON');

  const sku = str(b.sku, 40)?.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const title = str(b.title, 60);
  const amount = int(b.amount);
  const priceUzs = int(b.priceUzs);

  if (!sku) return BAD('sku kerak (masalan: ovoz_10)');
  if (!title) return BAD('title kerak');
  if (!amount || amount <= 0) return BAD('amount 0 dan katta bo’lishi kerak');
  if (!priceUzs || priceUzs <= 0) return BAD('priceUzs 0 dan katta bo’lishi kerak');

  try {
    const price = await prisma.price.create({
      data: {
        sku,
        title,
        amount,
        priceUzs,
        oldPriceUzs: int(b.oldPriceUzs) ?? null,
        badge: str(b.badge, 20) ?? null,
        order: int(b.order) ?? 0,
        active: b.active !== false,
      },
    });
    const cache = await refreshLanding();
    return Response.json({ ok: true, price, cache });
  } catch (err) {
    const msg = (err as { code?: string }).code === 'P2002' ? 'Bu sku allaqachon bor' : 'Server xatosi';
    return BAD(msg);
  }
}

// ── Tahrirlash (qismli) ──
export async function PATCH(req: Request): Promise<Response> {
  if (!(await requireAdmin())) return UNAUTH();

  const b = await req.json().catch(() => null);
  if (!b?.id || typeof b.id !== 'string') return BAD('id kerak');

  const data: Record<string, unknown> = {};
  if ('title' in b) data.title = str(b.title, 60) ?? undefined;
  if ('amount' in b) data.amount = int(b.amount);
  if ('priceUzs' in b) data.priceUzs = int(b.priceUzs);
  if ('oldPriceUzs' in b) data.oldPriceUzs = int(b.oldPriceUzs) ?? null;
  if ('badge' in b) data.badge = str(b.badge, 20) ?? null;
  if ('order' in b) data.order = int(b.order);
  if ('active' in b) data.active = Boolean(b.active);

  for (const k of Object.keys(data)) if (data[k] === undefined) delete data[k];
  if (!Object.keys(data).length) return BAD('O’zgartirish uchun maydon yo’q');

  if (typeof data.priceUzs === 'number' && data.priceUzs <= 0) return BAD('priceUzs noto’g’ri');
  if (typeof data.amount === 'number' && data.amount <= 0) return BAD('amount noto’g’ri');

  try {
    const price = await prisma.price.update({ where: { id: b.id }, data });
    const cache = await refreshLanding();
    return Response.json({ ok: true, price, cache });
  } catch {
    return BAD('Narx topilmadi');
  }
}

// ── Tartibni ko'chirish ──
export async function PUT(req: Request): Promise<Response> {
  if (!(await requireAdmin())) return UNAUTH();

  const b = await req.json().catch(() => null);
  const items: unknown = b?.order;
  if (!Array.isArray(items)) return BAD('order massivi kerak');

  const ops = items
    .map((it) => ({ id: String((it as { id?: unknown }).id ?? ''), order: int((it as { order?: unknown }).order) }))
    .filter((it): it is { id: string; order: number } => Boolean(it.id) && it.order !== undefined);

  if (!ops.length) return BAD('Bo’sh massiv');

  await prisma.$transaction(
    ops.map((o) => prisma.price.update({ where: { id: o.id }, data: { order: o.order } })),
  );
  const cache = await refreshLanding();
  return Response.json({ ok: true, cache });
}

// ── O'chirish ──
export async function DELETE(req: Request): Promise<Response> {
  if (!(await requireAdmin())) return UNAUTH();

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return BAD('id kerak');

  try {
    await prisma.price.delete({ where: { id } });
  } catch {
    return BAD('Narx topilmadi');
  }
  const cache = await refreshLanding();
  return Response.json({ ok: true, cache });
}
