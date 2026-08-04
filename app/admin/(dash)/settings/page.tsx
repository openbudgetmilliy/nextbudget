import DbDown from '@/components/admin/DbDown';
import SettingsForm from '@/components/admin/SettingsForm';
import { DEFAULT_SETTINGS } from '@/lib/data';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sozlamalar' };

export default async function SettingsPage() {
  let values: Record<string, string>;
  try {
    const rows = await prisma.setting.findMany();
    values = { ...DEFAULT_SETTINGS };
    for (const r of rows) if (r.key in values) values[r.key] = r.value;
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Sozlamalar</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  return (
    <>
      <h1 className="a-h1">Sozlamalar</h1>
      <p className="a-sub">Landing matnlari va bot manzili — kod tegmasdan o’zgaradi</p>
      <SettingsForm values={values} />
    </>
  );
}
