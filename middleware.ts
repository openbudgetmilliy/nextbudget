import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, GATE_COOKIE, GATE_HINT, hasGate, readToken } from './lib/jwt';

/**
 * Ikki himoya: admin panel va kirish darvozasi.
 *
 * MUHIM: `matcher` faqat `/admin/*` va `/l` ni tutadi. Darvoza sahifasi (`/`),
 * statik fayllar va API middleware'ga UMUMAN kirmaydi — aks holda har bir
 * so'rov Node'ga tushib, edge cache'ning ma'nosi qolmasdi.
 */

/** `lib/env` bu yerda ishlatilmaydi — u `server-only` zanjirini tortadi */
const gateOn =
  process.env.GATE_ENABLED !== '0' &&
  Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Landing: darvozadan o'tganlar uchun ──
  if (pathname === '/l') {
    if (!gateOn || (await hasGate(req.cookies.get(GATE_COOKIE)?.value))) {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    const res = NextResponse.redirect(url);

    /**
     * Eskirgan UX belgisini ham o'chiramiz — busiz CHEKSIZ HALQA bo'lardi:
     * `gt` yaroqsiz, lekin `gt_ok` qolgan → darvoza captchani ko'rsatmay
     * tugmani yoqadi → bosilsa yana shu yerga qaytadi → yana...
     *
     * Bu holat haqiqatda uchraydi: JWT_SECRET almashtirilganda yoki brauzer
     * soati oldinda bo'lib JWT `exp` cookie `Max-Age` dan erta o'tganda.
     */
    res.cookies.delete({ name: GATE_HINT, path: '/' });
    res.cookies.delete({ name: GATE_COOKIE, path: '/' });
    return res;
  }

  // ── Admin panel ──
  const isLogin = pathname === '/admin/login';
  const admin = await readToken(req.cookies.get(COOKIE)?.value);

  if (!admin && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (admin && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/l', '/admin', '/admin/:path*'],
};
