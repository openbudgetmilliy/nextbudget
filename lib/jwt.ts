import { SignJWT, jwtVerify } from 'jose';

/**
 * Edge-safe JWT. `next/headers` import QILINMAYDI — middleware ham
 * shu modulni ishlatadi.
 */

export const COOKIE = 'adm';
const ALG = 'HS256';

function key(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error('JWT_SECRET yo‘q yoki juda qisqa (kamida 32 belgi kerak)');
  }
  return new TextEncoder().encode(s);
}

export async function createToken(adminId: string): Promise<string> {
  return new SignJWT({ sub: adminId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key());
}

/* ── Kirish darvozasi (Turnstile) ── */

/** Imzolangan, HttpOnly — haqiqiy tekshiruv shu cookie orqali */
export const GATE_COOKIE = 'gt';
/** JS o'qiy oladigan yordamchi belgi — faqat UX uchun (qayta captcha ko'rsatmaslik) */
export const GATE_HINT = 'gt_ok';
export const GATE_TTL_H = 12;

const GATE_AUD = 'gate';

/**
 * Darvoza tokeni. `sub` YO'Q va `aud: 'gate'` bor — shu sabab admin
 * `readToken()` uni qabul qilmaydi, admin tokeni esa bu yerdan o'tmaydi.
 */
export async function createGateToken(): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: ALG })
    .setAudience(GATE_AUD)
    .setIssuedAt()
    .setExpirationTime(`${GATE_TTL_H}h`)
    .sign(key());
}

export async function hasGate(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, key(), { algorithms: [ALG], audience: GATE_AUD });
    return true;
  } catch {
    return false;
  }
}

export async function readToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    // key() ham try ichida: JWT_SECRET yo'q bo'lsa "ruxsat yo'q" deb qaraymiz,
    // 500 xatosi bilan yiqilmaymiz.
    const { payload } = await jwtVerify(token, key(), { algorithms: [ALG] });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
