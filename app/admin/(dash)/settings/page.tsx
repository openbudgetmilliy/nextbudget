import DbDown from '@/components/admin/DbDown';
import PixelPanel from '@/components/admin/PixelPanel';
import SettingsForm from '@/components/admin/SettingsForm';
import { DEFAULT_SETTINGS } from '@/lib/data';
import { LANDING_PAGES } from '@/lib/pages';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sozlamalar' };

export default async function SettingsPage() {
  // Asosiy formada faqat shu ikkisi — qolgan matn sozlamalari tegilmaydi
  const EDITABLE = ['price_one_vote', 'bot_username'] as const;
  const PIXEL_KEYS = LANDING_PAGES.map((p) => `pixel_${p.slug}`);

  let values: Record<string, string>;
  let pixels: Record<string, string>;
  try {
    const rows = await prisma.setting.findMany();
    const all: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of rows) if (r.key in all) all[r.key] = r.value;
    values = Object.fromEntries(EDITABLE.map((k) => [k, all[k]]));
    pixels = Object.fromEntries(PIXEL_KEYS.map((k) => [k, all[k] ?? '']));
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
      <PixelPanel
        pages={LANDING_PAGES.map((p) => ({ slug: p.slug, name: p.name, path: p.path }))}
        values={pixels}
      />
    </>
  );
}
