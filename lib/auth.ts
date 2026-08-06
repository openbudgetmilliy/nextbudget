import 'server-only';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { redis } from './redis';
import { env, SECURE_COOKIES } from './env';
import {
  COOKIE,
  GATE_COOKIE,
  GATE_HINT,
  GATE_TTL_H,
  createGateToken,
  createToken,
  readToken,
} from './jwt';

export { COOKIE, createToken };

/** Cookie'dan adminId. `null` — ruxsat yo'q. */
export async function requireAdmin(): Promise<string | null> {
  const jar = await cookies();
  return readToken(jar.get(COOKIE)?.value);
}

export async function setAuthCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: SECURE_COOKIES,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

/**
 * Darvozadan o'tganini yozib qo'yish.
 *
 * Ikki cookie: `gt` — imzolangan, HttpOnly (middleware shuni tekshiradi),
 * `gt_ok` — oddiy belgi, brauzerdagi JS o'qiy oladi va qaytib kelgan
 * foydalanuvchiga captchani qayta ko'rsatmaydi. Ikkinchisi hech narsani
 * himoyalamaydi — soxtalashtirilsa ham `/l` middleware'da to'xtaydi.
 */
export async function setGateCookies(): Promise<void> {
  const jar = await cookies();
  const maxAge = GATE_TTL_H * 60 * 60;

  jar.set(GATE_COOKIE, await createGateToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: SECURE_COOKIES,
    path: '/',
    maxAge,
  });
  jar.set(GATE_HINT, '1', {
    httpOnly: false,
    sameSite: 'lax',
    secure: SECURE_COOKIES,
    path: '/',
    maxAge,
  });
}

export async function verifyLogin(username: string, password: string): Promise<string | null> {
  const admin = await prisma.admin.findUnique({ where: { username } });
  // Timing farqini kamaytirish uchun admin topilmasa ham hash tekshiriladi
  const hash = admin?.passHash ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
  const ok = await bcrypt.compare(password, hash);
  return ok && admin ? admin.id : null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Redis'da sliding-window rate limit.
 * Redis o'lgan bo'lsa `{ ok: true }` qaytaradi — login butunlay yopilib
 * qolmasin (nginx va Cloudflare'da ham limit bor, ikkinchi qatlam sifatida).
 */
export async function rateLimit(
  bucket: string,
  limit: number,
  windowSec: number,
): Promise<{ ok: boolean; remaining: number; retryAfter: number }> {
  const k = `${env.KEY_PREFIX}:rl:${bucket}`;
  try {
    const n = await redis.incr(k);
    if (n === 1) await redis.expire(k, windowSec);
    if (n > limit) {
      const ttl = await redis.ttl(k);
      return { ok: false, remaining: 0, retryAfter: ttl > 0 ? ttl : windowSec };
    }
    return { ok: true, remaining: limit - n, retryAfter: 0 };
  } catch {
    return { ok: true, remaining: limit, retryAfter: 0 };
  }
}

/** Nginx `real_ip_header CF-Connecting-IP` qo'yadi, lekin zaxira ham bor */
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get('cf-connecting-ip') ||
    h.get('x-real-ip') ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}
