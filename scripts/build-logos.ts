import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

/**
 * Logotip variantlarini manba PNG'lardan yasaydi:  npm run logos
 *
 * Nega kerak: manba fayllar 549² va 1024² (1.4 MB) — landing'ga to'g'ridan-to'g'ri
 * qo'yib bo'lmaydi. Bu skript ularni ko'rsatiladigan o'lchamga kesadi, shaffof
 * chekkalarini oladi (`trim`) va WebP'ga siqadi.
 *
 * Natija `public/` va `app/` ichiga tushadi — hammasi STATIK, ish vaqtida
 * `/_next/image` optimizatsiyasi chaqirilmaydi.
 */

const MARK = 'public/milliylogonew.png';
const BRAND = 'public/milliywithbrandname.png';

type Out = { file: string; note: string; bytes: number };
const done: Out[] = [];

async function emit(file: string, note: string, buf: Buffer) {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(file, buf);
  done.push({ file, note, bytes: buf.length });
}

async function main() {
  await mkdir('public', { recursive: true });

  // ── Belgi: shaffof chekka olib tashlanadi, kvadratga tekislanadi ──
  const mark = sharp(MARK).trim();

  await emit(
    'public/logo-mark.webp',
    'header / darvoza (32–48px, 2x zaxira bilan)',
    await mark.clone().resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 92 }).toBuffer(),
  );

  // Next App Router konventsiyalari — <link> teglari avtomatik yasaladi
  // 192² yetarli: brauzer tab 16–32px, PWA plitkasi 192px. 512² bekorga 200 KB.
  await emit(
    'app/icon.png',
    'favicon (Next avtomatik ulaydi)',
    await mark
      .clone()
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer(),
  );

  await emit(
    'app/apple-icon.png',
    'iOS home screen — shaffoflik yo‘q, oq fon',
    await mark
      .clone()
      .resize(160, 160, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .extend({ top: 10, bottom: 10, left: 10, right: 10, background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: '#ffffff' })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  await emit(
    'public/logo-hero.webp',
    'hero o‘ng ustuni (~300px, 2x)',
    await mark.clone().resize(600, 600, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toBuffer(),
  );

  // ── Brend logotipi (nomi bilan) ──
  const brand = sharp(BRAND).trim();

  await emit(
    'public/logo-brand.webp',
    'landing boshidagi plita (~300px, 2x)',
    await brand.clone().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 92 }).toBuffer(),
  );

  // ── OG rasm: brend logotipi oq fonda, 1200×630 ──
  const brandForOg = await brand
    .clone()
    .resize({ width: 520, height: 460, fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  await emit(
    'app/opengraph-image.png',
    'Telegram / ijtimoiy tarmoq ulashuvi (1200×630)',
    await sharp({
      create: { width: 1200, height: 630, channels: 4, background: '#ffffff' },
    })
      .composite([{ input: brandForOg, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  console.log('\n▶ Logotip variantlari\n');
  for (const d of done) {
    console.log(`  ${d.file.padEnd(30)} ${String(Math.round(d.bytes / 1024)).padStart(5)} KB  — ${d.note}`);
  }
  console.log();
}

main().catch((e) => {
  console.error('✗', (e as Error).message);
  process.exit(1);
});
