import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, readToken } from './lib/jwt';

/**
 * Admin panelini himoyalaydi.
 *
 * MUHIM: `matcher` faqat `/admin/*` ni tutadi. Landing (`/`), statik fayllar
 * va API middleware'ga UMUMAN kirmaydi — aks holda har bir so'rov Node'ga
 * tushib, Cloudflare edge cache'ining ma'nosi qolmasdi.
 *
 * Ilgari bu yerda kirish darvozasining `/l` shoxi ham bor edi: `gt` cookie'si
 * bo'lmagan odam landingdan darvozaga qaytarilardi. Endi landing to'g'ridan
 * `/` da ochiladi va Turnstile uni to'smay, fonda tekshiradi
 * (`components/TurnstileGuard.tsx`) — shu sabab bu yerda tekshiradigan narsa
 * qolmadi.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
  matcher: ['/admin', '/admin/:path*'],
};
