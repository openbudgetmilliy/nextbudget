import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

/**
 * Logotip variantlarini manba PNG'dan yasaydi:  npm run logos
 *
 * Manba `assets/` da turadi — `public/` da EMAS. `public/` dagi hamma narsa
 * internetga ochiq, manba fayl esa (549², 180 KB) hech kimga kerak emas.
 *
 * Belgi to'liq rangli, oq fonli emblema: ko'k odamlar halqasi, ichida
 * O'zbekiston xaritasi va yashil belgi. Shaffof fonda ham, oq fonda ham
 * to'g'ri ko'rinadi — shuning uchun oldingi versiyadagi "oq plita" hiylasi
 * endi kerak emas.
 */

const SRC = 'assets/milliy-logo.png';

type Out = { file: string; note: string; bytes: number };
const done: Out[] = [];

/** PNG'larni ICO konteyneriga o'raydi (PNG-in-ICO, 16 baytlik katalog) */
function ico(images: { size: number; buf: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // rezerv
  header.writeUInt16LE(1, 2); // tur: icon
  header.writeUInt16LE(images.length, 4);

  const entries: Buffer[] = [];
  const blobs: Buffer[] = [];
  let offset = 6 + 16 * images.length;
  for (const { size, buf } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // eni (0 = 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // bo'yi
    e.writeUInt16LE(1, 4); // tekisliklar
    e.writeUInt16LE(32, 6); // bit chuqurligi
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    blobs.push(buf);
    offset += buf.length;
  }
  return Buffer.concat([header, ...entries, ...blobs]);
}

async function emit(file: string, note: string, buf: Buffer) {
  await writeFile(file, buf);
  done.push({ file, note, bytes: buf.length });
}

async function main() {
  await mkdir('public', { recursive: true });

  const mark = () => sharp(SRC).trim();
  const clear = { r: 0, g: 0, b: 0, alpha: 0 };

  // ── Header belgisi ──
  // 128² — ekranda 34–40px, ya'ni 3x zaxira bilan.
  await emit(
    'public/logo-mark.webp',
    'header belgisi (34–40px, 3x)',
    await mark()
      .clone()
      .resize(128, 128, { fit: 'contain', background: clear })
      .webp({ quality: 92 })
      .toBuffer(),
  );

  // ── Favicon / PWA ──
  // Next App Router konventsiyasi: `app/icon.png` va `app/apple-icon.png` dan
  // <link> teglari avtomatik yasaladi.
  await emit(
    'app/icon.png',
    'brauzer tabi + PWA',
    await mark()
      .clone()
      .resize(192, 192, { fit: 'contain', background: clear })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  // Apple ikonkasi shaffof fonni qora qilib ko'rsatadi — oq fon beramiz.
  await emit(
    'app/apple-icon.png',
    'iOS home screen (oq fonli)',
    await mark()
      .clone()
      .resize(150, 150, { fit: 'contain', background: clear })
      .extend({ top: 15, bottom: 15, left: 15, right: 15, background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: '#ffffff' })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  // Safari va eski brauzerlar /favicon.ico ni to'g'ridan-to'g'ri so'raydi —
  // Next `app/favicon.ico` ni o'sha manzilda beradi. Busiz Safari tab'da
  // sayt nomining bosh harfi ("M") ko'rinib turardi.
  const icoPng = (px: number) =>
    mark().clone().resize(px, px, { fit: 'contain', background: clear }).png().toBuffer();
  await emit(
    'app/favicon.ico',
    'Safari tab belgisi (16/32/48 PNG-in-ICO)',
    ico([
      { size: 16, buf: await icoPng(16) },
      { size: 32, buf: await icoPng(32) },
      { size: 48, buf: await icoPng(48) },
    ]),
  );

  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  console.log('\n▶ Logotip fayllari\n');
  for (const d of done) console.log(`  ✓ ${d.file.padEnd(28)} ${kb(d.bytes).padStart(9)}  ${d.note}`);
  console.log('');
}

main().catch((e) => {
  console.error('✗ Xato:', (e as Error).message);
  process.exit(1);
});
