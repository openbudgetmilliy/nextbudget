import { prisma } from '@/lib/prisma';
import DbDown from '@/components/admin/DbDown';
import PriceTable, { type Row } from '@/components/admin/PriceTable';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Narxlar' };

export default async function PricesPage() {
  let rows: Row[];
  try {
    const prices = await prisma.price.findMany({
      orderBy: [{ order: 'asc' }, { priceUzs: 'asc' }],
    });
    rows = prices.map((p) => ({ ...p, updatedAt: p.updatedAt.toISOString() }));
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Narxlar</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  return (
    <>
      <h1 className="a-h1">Narxlar</h1>
      <p className="a-sub">
        O’zgartirish saqlangach <code>revalidatePath(&apos;/l&apos;)</code> va Cloudflare purge
        avtomatik ishlaydi — landing statik bo’lib qoladi.
      </p>
      <PriceTable rows={rows} />
    </>
  );
}
