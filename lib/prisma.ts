import { PrismaClient } from '@prisma/client';

/**
 * Prisma singleton.
 *
 * MUHIM: bu client faqat uchta joyda ishlatiladi —
 *   1) build / revalidate paytida (landing narxlari),
 *   2) admin panel,
 *   3) worker (batch yozuv).
 * Cho'qqi trafikda landing so'rovlari Prisma'ga umuman tegmaydi.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/** BigInt'ni JSON'ga o'tkazish uchun (Event.id BigInt, count() bigint qaytaradi) */
export function jsonSafe<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? Number(v) : v)),
  ) as T;
}
