import { redis } from '@/lib/redis';
import { EV_QUEUE } from '@/lib/env';

/**
 * Uptime monitoring (Uptime Kuma / UptimeRobot) uchun.
 * Postgres'ni tekshirmaydi — landing'ning tirikligi unga bog'liq emas.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  let queue: number | null = null;
  try {
    queue = await redis.llen(EV_QUEUE);
  } catch {
    queue = null;
  }

  return Response.json(
    {
      ok: true,
      uptime: Math.round(process.uptime()),
      rssMb: Math.round(process.memoryUsage().rss / 1048576),
      redis: queue === null ? 'down' : 'up',
      queue,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
