import { clearAuthCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(): Promise<Response> {
  await clearAuthCookie();
  return Response.json({ ok: true });
}
