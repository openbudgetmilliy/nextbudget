import { requireAdmin } from '@/lib/auth';
import { LANDING_PAGES } from '@/lib/pages';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Kadr havolasi tekshiruvi — «Tekshirish» tugmasi shu yerga keladi.
 *
 * `pixel-check` bilan bir xil mantiq: kadrning JONLI sahifasini o'zi ochib,
 * CTA tugmalarining HAQIQIY `href` ini qaytaradi. Formada nima turgani emas,
 * sahifada hozir nima borligi muhim — sozlama saqlangan-u sahifa hali qayta
 * build bo'lmagan holat shu yerda darhol ko'rinadi.
 *
 * Qaytadigan `href` — SERVER chizgan manzil. Brauzerda ustiga yana UTM
 * yopishishi mumkin (`lib/track.ts`), lekin u foydalanuvchining havolasiga
 * bog'liq va bu yerda ko'rinmaydi.
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
      headers: { 'User-Agent': 'link-check (admin)' },
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

  /**
   * `<a …>` teglari ichidan CTA'larnikini ajratamiz.
   *
   * Nega atribut tartibiga tayanmaymiz: `href` bilan `data-t` orasidagi
   * tartib JSX'da o'zgarishi mumkin va bitta regexp ertami-kechmi jim
   * ravishda bo'sh natija qaytarardi. Shuning uchun avval TEG olinadi,
   * keyin teg ichidan qidiriladi.
   */
  const found = [
    ...new Set(
      [...html.matchAll(/<a\b[^>]*>/g)]
        .map((m) => m[0])
        .filter((tag) => /data-t="cta"/.test(tag))
        .map((tag) => tag.match(/href="([^"]*)"/)?.[1])
        .filter((h): h is string => Boolean(h))
        // HTML'da `&` → `&amp;` bo'lib chiqadi, taqqoslash uchun ochamiz
        .map((h) => h.replace(/&amp;/g, '&')),
    ),
  ];

  return Response.json({ ok: true, path: page.path, found });
}
