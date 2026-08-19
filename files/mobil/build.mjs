/**
 * Variantlardan ikkita ko'rish sahifasini yig'adi.
 *
 * Manba — `1-rasmiy.html` … `5-premium.html`. Har bir faylda uchta belgi
 * juftligi bor: `<!--#base-->` (umumiy skelet CSS), `<!--#style-->` (variant
 * ranglari) va `<!--#screen-->` (razmetka). Shu belgilar tufayli variantlar
 * o'z-o'zicha ochiladigan mustaqil fayl bo'lib qoladi, lekin ularni CSS'ni
 * qayta yozmasdan bitta sahifaga yig'ish ham mumkin.
 *
 *   node files/mobil/build.mjs
 *
 * Chiqadi:
 *   index.html    — stol kompyuterda taqqoslash uchun (5 ta telefon ramkasi).
 *                   iframe ishlashi uchun HTTP orqali oching:
 *                   `npx serve files/mobil` yoki `python3 -m http.server`.
 *   preview.html  — telefonda ko'rish uchun bitta uzun sahifa; Artifact ham
 *                   shundan chiqadi, shuning uchun <html>/<head>/<body> yo'q.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));

const VARIANTS = [
  { file: '1-rasmiy.html',    n: '01', name: 'Rasmiy',     note: 'Oq fon, to‘q ko‘k. Davlat portali tili — eng ishonchli o‘qiladi.' },
  { file: '2-zamonaviy.html', n: '02', name: 'Zamonaviy',  note: 'To‘q fon, gradient va shisha panellar. Yosh auditoriya uchun.' },
  { file: '3-energetik.html', n: '03', name: 'Energetik',  note: 'Sariq fon, qalin qora harflar. Lentada eng kuchli to‘xtatadi.' },
  { file: '4-minimal.html',   n: '04', name: 'Minimal',    note: 'Oq havo, bitta yashil urg‘u. Matn eng tez tushuniladi.' },
  { file: '5-premium.html',   n: '05', name: 'Premium',    note: 'Zumrad va oltin — saytning hozirgi brend rangi.' },
  { file: '6-milliy.html',    n: '06', name: 'Milliy',     note: 'Bayroq ranglari, markazga terilgan. «Milliy dastur» hissi.' },
  { file: '7-neon.html',      n: '07', name: 'Neon',       note: 'Qora fon, neon yashil, terminal oynasi. Tungi lentada yonadi.' },
  { file: '8-plakat.html',    n: '08', name: 'Plakat',     note: 'Qog‘oz fon, serif harflar, qizil urg‘u. Retro e‘lon uslubi.' },
  { file: '9-fintech.html',   n: '09', name: 'Fintech',    note: 'Bank ilovasi tili: «to‘lov tushdi» bildirishnomasi maketi.' },
  { file: '10-gradient.html', n: '10', name: 'Gradient',   note: 'Quyosh botishi gradienti — Instagram stories uslubi.' },
  { file: '11-moviy.html',    n: '11', name: 'Moviy',      note: '10-variantning ko‘k-oq talqini — logotip ranglarida.' },
];

const cut = (src, tag) => {
  const m = src.match(new RegExp(`<!--#${tag}-->([\\s\\S]*?)<!--/#${tag}-->`));
  if (!m) throw new Error(`«${tag}» belgisi topilmadi`);
  return m[1].trim();
};

const parts = [];
for (const v of VARIANTS) {
  const src = await readFile(join(DIR, v.file), 'utf8');
  parts.push({ ...v, base: cut(src, 'base'), style: cut(src, 'style'), screen: cut(src, 'screen') });
}

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com" />\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n' +
  '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:wght@500;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />';

/* Qobiq — ataylab jim: butun rangni variantlarning o'zi olib chiqadi.
   To'q neytral fon oq variantni ham, to'q variantni ham bir xil halol
   ko'rsatadi (fotografdagi kontakt-varaq printsipi). */
const SHELL = `
:root { color-scheme: dark; }
.sh { --sh-bg:#14171c; --sh-bg2:#1b1f26; --sh-ink:#e8ebf0; --sh-dim:#8f97a5;
      --sh-line:rgba(255,255,255,.13);
      --sh-mono:'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
      --sh-sans:'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
body { background: #14171c; }
.sh, .sh * { box-sizing: border-box; }
.sh { color: var(--sh-ink); background: var(--sh-bg); }
/* Shrift faqat qobiqning o'z elementlariga — aks holda u variantlar ichiga
   ham merosga o'tib, ularning terilishini buzardi. */
.sh__top, .sh__lbl, .sh__foot, .rail figcaption { font-family: var(--sh-sans); }

.sh__top { padding: 42px 22px 34px; max-width: 640px; margin: 0 auto; }
.sh__eyebrow { font-family: var(--sh-mono); font-size: 11.5px; letter-spacing: .18em;
  text-transform: uppercase; color: var(--sh-dim); margin: 0; }
.sh__h { margin: 14px 0 0; font-size: clamp(26px, 7vw, 34px); line-height: 1.15;
  font-weight: 600; letter-spacing: -0.025em; text-wrap: balance; }
.sh__p { margin: 12px 0 0; font-size: 15px; line-height: 1.6; color: var(--sh-dim); max-width: 34em; }
.sh__hint { margin: 22px 0 0; display: inline-flex; align-items: center; gap: 9px;
  font-family: var(--sh-mono); font-size: 12px; color: var(--sh-dim);
  border: 1px solid var(--sh-line); border-radius: 999px; padding: 8px 14px; }

.sh__lbl { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
  padding: 18px 22px; background: var(--sh-bg2);
  border-top: 1px solid var(--sh-line); border-bottom: 1px solid var(--sh-line); }
.sh__n { font-family: var(--sh-mono); font-size: 12px; color: var(--sh-dim); letter-spacing: .06em; }
.sh__name { font-size: 16px; font-weight: 600; letter-spacing: -0.01em; }
.sh__note { flex: 1 1 16em; font-size: 13px; line-height: 1.5; color: var(--sh-dim); }

.sh__foot { padding: 30px 22px 46px; max-width: 640px; margin: 0 auto;
  font-size: 13.5px; line-height: 1.6; color: var(--sh-dim); border-top: 1px solid var(--sh-line); }
.sh__foot b { color: var(--sh-ink); font-weight: 600; }
`;

const shell = parts
  .map(
    (p) => `<div class="sh__lbl">
  <span class="sh__n">${p.n}</span>
  <span class="sh__name">${p.name}</span>
  <span class="sh__note">${p.note}</span>
</div>
${p.screen}`,
  )
  .join('\n\n');

const preview = `<title>MilliyJamoasi Ekranlari</title>
${FONTS}
<style>
/* ── Umumiy skelet (variant fayllaridan olindi) ── */
${parts[0].base.replace(/<\/?style>/g, '').trim()}
/* ── Qobiq ── */
${SHELL.trim()}
/* ── Variantlar ── */
${parts.map((p) => p.style.replace(/<\/?style>/g, '').trim()).join('\n\n')}
</style>

<div class="sh">
  <header class="sh__top">
    <p class="sh__eyebrow">MilliyJamoasi · mobil landing</p>
    <h1 class="sh__h">Instagram trafigi uchun o‘n bitta ekran</h1>
    <p class="sh__p">Har bir variant — bitta to‘liq telefon ekrani. Tuzilishi beshalasida bir xil:
      sarlavha, 20 000 so‘m urg‘usi, so‘ng «Ovoz berish» va «Pulni olish» tugmalari ekranning
      pastki-o‘rta qismida. Farq faqat uslubda.</p>
    <p class="sh__hint">Pastga suring · 11 ta variant</p>
  </header>

${shell}

  <footer class="sh__foot">
    <p><b>Qaysi biri?</b> Raqamini ayting — o‘shani <b>app/page.tsx</b> ga ko‘chiraman,
      tugmalarga bot havolasi va Meta Pixel <em>Lead</em> hodisasini ulayman.</p>
  </footer>
</div>
`;

await writeFile(join(DIR, 'preview.html'), preview);

/* Stol kompyuter uchun taqqoslash — iframe fidelity 100%: har bir variant
   o'z hujjatida, xuddi telefondagidek 390×844 kadrda ochiladi. */
const frames = parts
  .map(
    (p) => `    <figure class="cell">
      <figcaption><span class="n">${p.n}</span> ${p.name}<small>${p.note}</small></figcaption>
      <div class="phone"><iframe src="${p.file}" title="${p.name}" loading="lazy"></iframe></div>
    </figure>`,
  )
  .join('\n');

const index = `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>MilliyJamoasi — mobil landing variantlari</title>
${FONTS}
<style>
${SHELL.trim()}
body { margin: 0; }
.rail { display: flex; gap: 26px; overflow-x: auto; padding: 8px 22px 46px;
  scroll-snap-type: x proximity; }
.cell { margin: 0; flex: none; scroll-snap-align: center; }
figcaption { display: block; max-width: 390px; margin: 0 0 12px;
  font-size: 15px; font-weight: 600; }
figcaption .n { font-family: var(--sh-mono); font-size: 12px; color: var(--sh-dim);
  letter-spacing: .06em; margin-right: 8px; }
figcaption small { display: block; margin-top: 4px; font-size: 12.5px; line-height: 1.5;
  font-weight: 400; color: var(--sh-dim); }
.phone { width: 390px; height: 844px; border-radius: 34px; overflow: hidden;
  border: 1px solid var(--sh-line); background: #000;
  box-shadow: 0 24px 60px rgba(0,0,0,.5); }
.phone iframe { width: 390px; height: 844px; border: 0; display: block; }
</style>
</head>
<body class="sh">
  <header class="sh__top">
    <p class="sh__eyebrow">MilliyJamoasi · mobil landing</p>
    <h1 class="sh__h">Instagram trafigi uchun o‘n bitta ekran</h1>
    <p class="sh__p">390×844 (iPhone 14/15) kadrda. Yonma-yon taqqoslash uchun o‘ngga suring.
      Bitta variantni to‘liq ko‘rish uchun uning faylini alohida oching.</p>
    <p class="sh__hint">HTTP orqali oching: npx serve files/mobil</p>
  </header>
  <div class="rail">
${frames}
  </div>
</body>
</html>
`;

await writeFile(join(DIR, 'index.html'), index);
console.log('yozildi: files/mobil/index.html, files/mobil/preview.html');
