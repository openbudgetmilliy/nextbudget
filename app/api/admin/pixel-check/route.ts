import { requireAdmin } from '@/lib/auth';
import { LANDING_PAGES } from '@/lib/pages';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Pixel tekshiruvi — «Tekshirish» tugmasi shu yerga keladi.
 *
 * Nima qiladi: kadrning JONLI sahifasini o'zi ochib (origin'ga so'rov),
 * HTML ichida qaysi pixel ID'lar muhrlanganini qaytaradi. Bu formal emas,
 * haqiqiy tekshiruv: sozlama saqlangan-u, sahifa hali qayta build
 * bo'lmagan holat ham darhol ko'rinadi.
 *
 * `cache: 'no-store'` shart — o'zimizning ISR keshimiz emas, hozirgi
 * holat kerak.
 */
export async function GET(req: Request): Promise<Response> {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const slug = new URL(req.url).searchParams.get('slug') ?? '';
  const page = LANDING_PAGES.find((p) => p.slug === slug);
  if (!page) {
    return Response.json({ ok: false, error: 'Bunday kadr yo’q' }, { status: 400 });
  }

  let html: string;
  try {
    const res = await fetch(`${env.SITE_URL}${page.path}`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'pixel-check (admin)' },
    });
    if (!res.ok) {
      return Response.json({ ok: false, error: `Sahifa ${res.status} qaytardi` }, { status: 502 });
    }
    html = await res.text();
  } catch (err) {
    return Response.json(
      { ok: false, error: `Sahifaga yetib bo’lmadi: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  // fbq('init','<ID>') qatorlari — sahifada haqiqatan yonadigan pixellar
  const found = [...new Set([...html.matchAll(/fbq\('init','(\d{5,20})'\)/g)].map((m) => m[1]))];

  return Response.json({ ok: true, path: page.path, found });
}
