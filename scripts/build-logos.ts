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

/** Brend ranglari — belgidan olingan, `app/globals.css` bilan bir xil */
const INK = '#08243a';
const BLUE = '#0090d8';
const GREEN = '#60c048';

type Out = { file: string; note: string; bytes: number };
const done: Out[] = [];

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

  // ── Ijtimoiy tarmoq rasmi (1200×630) ──
  // Sayt dizaynining o'zi: oq fon, qiya ko'k blok, siqilgan katta harflar.
  const W = 1200;
  const H = 630;

  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#ffffff"/>

    <!-- Qiya ko'k blok: sahifadagi narx plitasining aynan o'zi -->
    <polygon points="0,0 ${W},0 ${W},96 0,150" fill="${BLUE}"/>

    <!-- Belgi ko'k tasmada turadi va uning o'zida ham ko'k bor — oq doira ajratadi -->
    <circle cx="128" cy="130" r="68" fill="#ffffff"/>

    <!-- Yashil chiziq — belgidagi tasdiq belgisining rangi -->
    <polygon points="72,214 470,214 470,238 72,246" fill="${GREEN}"/>

    <text x="72" y="330" font-family="Arial Narrow, Arial, sans-serif" font-size="96"
          font-weight="bold" fill="${INK}" letter-spacing="-2">TASHABBUSLI BUDJET</text>
    <text x="72" y="416" font-family="Arial Narrow, Arial, sans-serif" font-size="96"
          font-weight="bold" fill="${INK}" letter-spacing="-2">OVOZI</text>

    <!-- Narx plitasi: pastki chekkasi qiya kesilgan -->
    <polygon points="612,352 1128,352 1128,502 612,524" fill="${BLUE}"/>
    <text x="648" y="404" font-family="Arial, sans-serif" font-size="24"
          font-weight="bold" letter-spacing="4" fill="#ffffff">1 OVOZ NARXI</text>
    <text x="648" y="480" font-family="Arial Narrow, Arial, sans-serif" font-size="76"
          font-weight="bold" fill="#ffffff">30 000<tspan dx="14" font-size="38">so‘m</tspan></text>

    <text x="72" y="560" font-family="Arial, sans-serif" font-size="26" fill="#41637a">
      Humo · Uzcard · Payme — Telegram bot orqali</text>
  </svg>`);

  const emblem = await mark()
    .clone()
    .resize(112, 112, { fit: 'contain', background: clear })
    .png()
    .toBuffer();

  await emit(
    'app/opengraph-image.png',
    'Telegram/Facebook ulashuv rasmi (1200×630)',
    await sharp(bg)
      .composite([{ input: emblem, left: 72, top: 74 }])
      .png({ compressionLevel: 9 })
      .toBuffer(),
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
