/**
 * Bir martalik migratsiya: StarsPaymee → Open Budget.
 *
 * Nima qiladi:
 *  1. Eski `stars_*` va `premium_*` narxlarni o'chiradi.
 *  2. FALLBACK_PRICES dagi `ovoz_*` va `xizmat_*` paketlarni bazaga yozadi
 *     (mavjud bo'lsa, narx/nomni yangilaydi — CHUNKI eski brend narxlari
 *     to'g'ri emas edi).
 *  3. Har bir DEFAULT_SETTINGS ni FORCE-update qiladi: hero matni, CTA, kanal,
 *     mijozlar soni — hammasi Open Budget qiymatiga o'tadi. Agar admin keyin
 *     panel orqali qayta yozsa, tabiiy — bu skript bir marta ishlatiladi.
 *
 * Ishga tushirish:  npm run db:switch
 *
 * Xavfsizlik: skript idempotent — qayta yugurtirsa ham xato bermaydi, faqat
 * defoltga qaytaradi. Admin panelda qilingan tuzatishlarni saqlash kerak bo'lsa,
 * skriptni faqat BIR MARTA (brend almashinuvida) ishlating.
 */

import { PrismaClient } from '@prisma/client';
import { FALLBACK_PRICES } from '../lib/content';
import { DEFAULT_SETTINGS } from '../lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('▶ Open Budget migratsiyasi boshlandi…\n');

  // 1) Eski narxlarni o'chirish
  const removed = await prisma.price.deleteMany({
    where: {
      OR: [{ sku: { startsWith: 'stars_' } }, { sku: { startsWith: 'premium_' } }],
    },
  });
  console.log(`✓ Eski narxlar o'chirildi: ${removed.count} ta (stars_* / premium_*)`);

  // 2) Yangi ovoz paketlarini kuchlab yozish
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
      update: {
        title: p.title,
        amount: p.amount,
        priceUzs: p.priceUzs,
        oldPriceUzs: p.oldPriceUzs,
        badge: p.badge,
        order: p.order,
        active: true,
      },
    });
  }
  console.log(`✓ Ovoz paketlari yozildi: ${FALLBACK_PRICES.length} ta`);

  // 3) Sozlamalarni FORCE-update
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
  console.log(`✓ Sozlamalar yangilandi: ${Object.keys(DEFAULT_SETTINGS).length} maydon`);

  console.log('\n─────────────────────────────────────────');
  console.log('  Brend almashinuvi tugadi.');
  console.log('  Admin panel endi FAQAT ovoz narxlarini boshqaradi.');
  console.log('  Landing kesh: revalidate soatiga bir marta —');
  console.log('  darhol ko\'rish uchun `.next` ni tozalab qayta ishga tushiring.');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('✗ Xato:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
