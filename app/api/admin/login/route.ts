import { clientIp, createToken, rateLimit, setAuthCookie, verifyLogin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 5 urinish / 15 daqiqa — IP va username bo'yicha alohida */
const LIMIT = 5;
const WINDOW = 15 * 60;

export async function POST(req: Request): Promise<Response> {
  const ip = clientIp(req);

  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'Noto’g’ri so’rov' }, { status: 400 });
  }

  const username = typeof body.username === 'string' ? body.username.trim().slice(0, 60) : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password) {
    return Response.json({ ok: false, error: 'Login va parol kiriting' }, { status: 400 });
  }

  const byIp = await rateLimit(`login:ip:${ip}`, LIMIT, WINDOW);
  const byUser = await rateLimit(`login:u:${username.toLowerCase()}`, LIMIT, WINDOW);
  if (!byIp.ok || !byUser.ok) {
    const retry = Math.max(byIp.retryAfter, byUser.retryAfter);
    return Response.json(
      { ok: false, error: `Juda ko’p urinish. ${Math.ceil(retry / 60)} daqiqadan keyin qayta urinib ko’ring.` },
      { status: 429, headers: { 'Retry-After': String(retry) } },
    );
  }

  let adminId: string | null = null;
  try {
    adminId = await verifyLogin(username, password);
  } catch (err) {
    console.error('[login]', (err as Error).message);
    return Response.json({ ok: false, error: 'Server xatosi' }, { status: 500 });
  }

  if (!adminId) {
    return Response.json({ ok: false, error: 'Login yoki parol xato' }, { status: 401 });
  }

  await setAuthCookie(await createToken(adminId));
  return Response.json({ ok: true });
}
