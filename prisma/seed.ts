import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { FALLBACK_PRICES } from '../lib/content';
import { DEFAULT_SETTINGS } from '../lib/data';

const prisma = new PrismaClient();

async function main() {
  // ── Narxlar ──
  for (const p of FALLBACK_PRICES) {
    await prisma.price.upsert({
      where: { sku: p.sku },
      create: {
        sku: p.sku,
        title: p.title,
        amount: p.amount,
        priceUzs: p.priceUzs,
        oldPriceUzs: p.oldPriceUzs,
        badge: p.badge,
        order: p.order,
        active: true,
      },
      // Mavjud narxlarni O'ZGARTIRMAYMIZ — seed'ni qayta ishga tushirish
      // admin qo'ygan narxlarni buzmasligi kerak
      update: {},
    });
  }
  console.log(`✓ ${FALLBACK_PRICES.length} narx tayyor`);

  // ── Sozlamalar ──
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
  }
  console.log(`✓ ${Object.keys(DEFAULT_SETTINGS).length} sozlama tayyor`);

  // ── Admin ──
  const username = process.env.ADMIN_USER || 'admin';
  const existing = await prisma.admin.findUnique({ where: { username } });

  if (existing) {
    console.log(`• Admin "${username}" allaqachon bor — parol o'zgartirilmadi`);
  } else {
    const password = process.env.ADMIN_PASS || randomBytes(12).toString('base64url');
    await prisma.admin.create({
      data: { username, passHash: bcrypt.hashSync(password, 10) },
    });
    console.log('\n─────────────────────────────────────────');
    console.log(`  Admin yaratildi`);
    console.log(`  login:  ${username}`);
    console.log(`  parol:  ${password}`);
    console.log('  BU PAROLNI HOZIR SAQLAB QO’YING — qayta ko’rsatilmaydi');
    console.log('─────────────────────────────────────────\n');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
