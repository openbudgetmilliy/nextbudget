import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';

/**
 * Logotip variantlarini manba PNG'dan yasaydi:  npm run logos
 *
 * Manba `assets/` da turadi — `public/` da EMAS. Manba fayl 512² va u
 * foydalanuvchiga hech qachon berilmasligi kerak; `public/` dagi hamma narsa
 * esa internetga ochiq.
 *
 * Ikki xil kesim yasaladi:
 *   · to'liq belgi — rombllar + OB monogrammasi (header, OG rasm)
 *   · faqat OB     — favicon uchun. 16–32px da to'rtta romb bo'tqaga aylanadi,
 *                    monogramma esa o'sha o'lchamda ham o'qiladi.
 *
 * MUHIM: logoning rombllari OQdan tealga o'tuvchi gradient. Ya'ni belgi FAQAT
 * oq/yorug' fonda to'g'ri ko'rinadi — to'q fonda oq uchlari dog' bo'lib qoladi.
 * Shuning uchun OG rasmda ham u oq plita ustiga qo'yiladi.
 */

const SRC = 'assets/open-budget-logo.png';

/**
 * OB monogrammasining manbadagi joyi — turkuaz piksellar bo'yicha o'lchangan
 * (bbox x 125–355, y 137–331, markaz 240/234), atrofiga bir oz havo qo'shilgan.
 */
const MONO = { left: 96, top: 90, width: 288, height: 288 };

/**
 * Monogrammani rombllardan ajratib oladi.
 *
 * Muammo: to'rtta romb monogrammaga juda yaqin turadi, shuning uchun HAR QANDAY
 * kvadrat kesim ularning uchlarini ham ushlaydi — favicon burchaklarida teal
 * uchburchaklar paydo bo'ladi. Rangi bo'yicha ajratamiz:
 *
 *   · monogramma — yorqin turkuaz  (b−r ≈ 150, o'rtacha g/b ≈ 200)
 *   · romb        — to'q teal      (b−r ≈ 105, lekin g/b ≈ 115 — qorong'i)
 *   · romb uchi   — oqqa yaqin     (b−r ≈ 0)
 *
 * Ya'ni "ko'k-qizil farqi" bilan "yorqinlik" birgalikda uchalasini ajratadi.
 * Saqlangan piksel brend turkuaziga bo'yaladi — monogramma baribir bir rangli,
 * shuning uchun bu chekkalarni tozalaydi, hech narsa yo'qotmaydi.
 */
async function monogramAlpha(): Promise<Buffer> {
  const src = sharp(SRC).extract(MONO);
  const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  const cyan = [0x22, 0xc6, 0xe8];
  const ramp = (v: number, lo: number, hi: number) =>
    Math.max(0, Math.min(1, (v - lo) / (hi - lo)));

  for (let p = 0; p < width * height; p++) {
    const i = p * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = channels === 4 ? data[i + 3] : 255;

    const alpha = ramp(b - r, 90, 150) * ramp((g + b) / 2, 130, 170) * (a / 255);

    out[p * 4] = cyan[0];
    out[p * 4 + 1] = cyan[1];
    out[p * 4 + 2] = cyan[2];
    out[p * 4 + 3] = Math.round(alpha * 255);
  }

  return sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

/** Brend ranglari — `app/globals.css` dagi tokenlar bilan bir xil */
const INK = '#04222A';
const CYAN = '#22C6E8';

type Out = { file: string; note: string; bytes: number };
const done: Out[] = [];

async function emit(file: string, note: string, buf: Buffer) {
  await writeFile(file, buf);
  done.push({ file, note, bytes: buf.length });
}

async function main() {
  await mkdir('public', { recursive: true });

  const full = () => sharp(SRC).trim();
  const monoBuf = await monogramAlpha();
  const mono = () => sharp(monoBuf).trim();

  // ── Header belgisi ──
  // 128² — ekranda 32–40px, ya'ni 3x zaxira bilan.
  await emit(
    'public/logo-mark.webp',
    'header belgisi (32–40px, 3x)',
    await full()
      .clone()
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 92 })
      .toBuffer(),
  );

  // ── Favicon / PWA ──
  // Next App Router konventsiyasi: `app/icon.png` va `app/apple-icon.png` dan
  // <link> teglari avtomatik yasaladi.
  const clear = { r: 0, g: 0, b: 0, alpha: 0 };

  await emit(
    'app/icon.png',
    'brauzer tabi + PWA (faqat OB)',
    await mono()
      .clone()
      .resize(176, 176, { fit: 'contain', background: clear })
      .extend({ top: 8, bottom: 8, left: 8, right: 8, background: clear })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  // Apple ikonkasi shaffof fonni qora qilib ko'rsatadi — oq fon beramiz.
  await emit(
    'app/apple-icon.png',
    'iOS home screen (oq fonli)',
    await mono()
      .clone()
      .resize(132, 132, { fit: 'contain', background: clear })
      .extend({
        top: 24,
        bottom: 24,
        left: 24,
        right: 24,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .flatten({ background: '#ffffff' })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  // ── Ijtimoiy tarmoq rasmi (1200×630) ──
  // Sayt dizaynining o'zi: to'q sahna + oq plita ustidagi belgi + yorqin narx.
  const W = 1200;
  const H = 630;
  const PLATE = 360;
  const plateX = 90;
  const plateY = (H - PLATE) / 2;

  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${INK}"/>
    <rect x="${plateX}" y="${plateY}" width="${PLATE}" height="${PLATE}" fill="#ffffff"/>
    <text x="530" y="252" font-family="Arial, Helvetica, sans-serif" font-size="28"
          font-weight="bold" letter-spacing="7" fill="${CYAN}">1 OVOZ NARXI</text>
    <text x="530" y="380" font-family="Arial, Helvetica, sans-serif" font-size="118"
          font-weight="bold" fill="${CYAN}">30 000<tspan dx="26" font-size="58"
          fill="#ffffff">so‘m</tspan></text>
    <rect x="530" y="422" width="88" height="7" fill="${CYAN}"/>
    <text x="530" y="486" font-family="Arial, Helvetica, sans-serif" font-size="27"
          fill="#9fd3de">Humo · Uzcard · Payme — Telegram bot orqali</text>
  </svg>`);

  const markOnPlate = await full()
    .clone()
    .resize(268, 268, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  await emit(
    'app/opengraph-image.png',
    'Telegram/Facebook ulashuv rasmi (1200×630)',
    await sharp(bg)
      .composite([{ input: markOnPlate, left: plateX + 46, top: Math.round(plateY) + 46 }])
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
