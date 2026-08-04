import { redis } from '@/lib/redis';
import { EV_QUEUE } from '@/lib/env';

/**
 * Analitika collector — origin'ga tushadigan YAGONA issiq yo'l.
 *
 * Cho'qqida (100k/kun) faqat shu endpoint ishlaydi: ~60 req/s.
 * Shuning uchun bu yerda hech qanday `await` yo'q — Redis'ga yozish
 * fire-and-forget, javob darhol 204 bilan qaytadi.
 *
 *  · Postgres bu yo'lda ISHTIROK ETMAYDI
 *  · Prisma import QILINMAYDI (bundle'ga tushmasin)
 *  · Redis o'lgan bo'lsa ham request muvaffaqiyatli tugaydi (ma'lumot yo'qoladi,
 *    lekin foydalanuvchi hech narsa sezmaydi)
 *
 * Navbat uzunligi worker tomonidan LTRIM bilan cheklanadi.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 20_000;
const NO_CONTENT = { status: 204 } as const;

export async function POST(req: Request): Promise<Response> {
  // Katta body'ni o'qishdan oldin rad etamiz
  const len = Number(req.headers.get('content-length') ?? 0);
  if (len > MAX_BYTES) return new Response(null, { status: 413 });

  let body: string;
  try {
    body = await req.text();
  } catch {
    return new Response(null, NO_CONTENT);
  }

  if (!body || body.length > MAX_BYTES || body.charCodeAt(0) !== 123 /* '{' */) {
    return new Response(null, NO_CONTENT);
  }

  // await YO'Q — event loop bloklanmaydi
  redis.rpush(EV_QUEUE, body).catch(() => {});

  return new Response(null, NO_CONTENT);
}

export function GET(): Response {
  return new Response(null, { status: 405, headers: { Allow: 'POST' } });
}
