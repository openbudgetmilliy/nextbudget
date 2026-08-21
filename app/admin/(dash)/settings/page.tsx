import DbDown from '@/components/admin/DbDown';
import LinkPanel from '@/components/admin/LinkPanel';
import PixelPanel from '@/components/admin/PixelPanel';
import SettingsForm from '@/components/admin/SettingsForm';
import { DEFAULT_SETTINGS, pageCta, type Settings } from '@/lib/data';
import { LANDING_PAGES } from '@/lib/pages';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sozlamalar' };

export default async function SettingsPage() {
  // Asosiy formada faqat shu ikkisi — qolgan matn sozlamalari tegilmaydi
  const EDITABLE = ['price_one_vote', 'bot_username'] as const;
  const PIXEL_KEYS = LANDING_PAGES.map((p) => `pixel_${p.slug}`);
  const LINK_KEYS = LANDING_PAGES.map((p) => `link_${p.slug}`);

  let values: Record<string, string>;
  let pixels: Record<string, string>;
  let links: Record<string, string>;
  /**
   * Har kadr tugmasi HOZIR ochadigan manzil — saqlangan sozlamalar bo'yicha
   * serverda hisoblanadi. Panelda «Hozir: …» bo'lib ko'rinadi, ya'ni admin
   * bo'sh maydonning nimaga aylanishini yozishdan oldin ko'radi. Mantiq
   * sahifalar bilan BITTA (`pageCta`), aks holda panel bir narsani ko'rsatib,
   * kadr boshqa yerga ketishi mumkin edi.
   */
  let effective: Record<string, string>;

  try {
    const rows = await prisma.setting.findMany();
    const all: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of rows) if (r.key in all) all[r.key] = r.value;
    values = Object.fromEntries(EDITABLE.map((k) => [k, all[k]]));
    pixels = Object.fromEntries(PIXEL_KEYS.map((k) => [k, all[k] ?? '']));
    links = Object.fromEntries(LINK_KEYS.map((k) => [k, all[k] ?? '']));
    // `all` shu yerda xom lug'at sifatida yig'iladi (kalitlar `r.key` dan
    // keladi), `pageCta` esa `Settings` kutadi — tarkibi bir xil
    effective = Object.fromEntries(
      LANDING_PAGES.map((p) => [p.slug, pageCta(all as Settings, p.slug).href]),
    );
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Sozlamalar</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  const pages = LANDING_PAGES.map((p) => ({ slug: p.slug, name: p.name, path: p.path }));

  return (
    <>
      <h1 className="a-h1">Sozlamalar</h1>
      <p className="a-sub">Narx va bot manzili — saqlangach hamma kadrga birdek tushadi</p>
      <SettingsForm values={values} />
      <LinkPanel pages={pages} values={links} effective={effective} />
      <PixelPanel pages={pages} values={pixels} />
    </>
  );
}
