import Redis from 'ioredis';
import { env } from './env';

/**
 * Redis — analitika buferi va rate limit uchun.
 *
 * Muhim sozlamalar (cho'qqi trafik uchun):
 *   lazyConnect          — build paytida ulanmaydi, birinchi buyruqda ulanadi
 *   enableOfflineQueue:false — Redis o'lsa buyruq darhol reject bo'ladi.
 *                          Xotirada navbat o'smaydi, request bloklanmaydi.
 *   maxRetriesPerRequest:1  — sekin retry'lar event loop'ni ushlab turmaydi
 */

const globalForRedis = globalThis as unknown as { redis?: Redis };

function create(): Redis {
  const client = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    keepAlive: 30_000,
    retryStrategy: (times) => Math.min(times * 200, 5000),
  });

  // Ulanish xatosi log'ni to'ldirmasin, process ham yiqilmasin
  let lastLog = 0;
  client.on('error', (err) => {
    const now = Date.now();
    if (now - lastLog > 30_000) {
      lastLog = now;
      console.error('[redis]', err.message);
    }
  });

  return client;
}

export const redis = globalForRedis.redis ?? create();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
