import DbDown from '@/components/admin/DbDown';
import SettingsForm from '@/components/admin/SettingsForm';
import { DEFAULT_SETTINGS } from '@/lib/data';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sozlamalar' };

export default async function SettingsPage() {
  // Formada faqat shu ikkisi — qolgan sozlamalar bazada qoladi, tegilmaydi
  const EDITABLE = ['price_one_vote', 'bot_username'] as const;

  let values: Record<string, string>;
  try {
    const rows = await prisma.setting.findMany();
    const all: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of rows) if (r.key in all) all[r.key] = r.value;
    values = Object.fromEntries(EDITABLE.map((k) => [k, all[k]]));
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
      <p className="a-sub">Narx va bot manzili — saqlangach sakkizala kadrga birdek tushadi</p>
      <SettingsForm values={values} />
    </>
  );
}
