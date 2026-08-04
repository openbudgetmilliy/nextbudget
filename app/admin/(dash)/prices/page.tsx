import DbDown from '@/components/admin/DbDown';
import PriceForm from '@/components/admin/PriceForm';
import { DEFAULT_SETTINGS } from '@/lib/data';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Narx' };

/**
 * Narx boshqaruvi.
 *
 * Avval bu yerda paketlar jadvali turardi (SKU, hajm, badge, tartib). Landingda
 * narx bo'limi olib tashlangandan keyin u ma'nosini yo'qotdi — endi sahifada
 * faqat landing ko'rsatadigan bitta narx bor.
 */
export default async function PricesPage() {
  let price: string;
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'price_one_vote' } });
    price = row?.value ?? DEFAULT_SETTINGS.price_one_vote;
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Narx</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  return (
    <>
      <h1 className="a-h1">Narx</h1>
      <p className="a-sub">Landingda ko’rsatiladigan narx — bitta joydan boshqariladi</p>
      <PriceForm value={price} />
    </>
  );
}
