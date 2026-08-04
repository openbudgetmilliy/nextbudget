/**
 * Turnstile kalitlarini tekshirish:  npm run gate:check
 *
 * Hiyla: siteverify'ga ATAYIN soxta token yuboramiz va JAVOB TURIGA qaraymiz —
 *   invalid-input-secret    → secret NOTO'G'RI
 *   invalid-input-response  → secret TO'G'RI (faqat token soxta, tabiiy)
 * Shu tarzda brauzersiz ham secret'ni tasdiqlab olamiz.
 */

const VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const site = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const secret = process.env.TURNSTILE_SECRET_KEY ?? '';
const enabled = process.env.GATE_ENABLED !== '0';

const ok = (m: string) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m: string) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const warn = (m: string) => console.log(`  \x1b[33m!\x1b[0m ${m}`);

/** Cloudflare test kalitlari 1x / 2x / 3x bilan boshlanadi, haqiqiysi 0x4 bilan */
const isTest = (k: string) => /^[123]x/.test(k);

async function main() {
  console.log('\n▶ Kirish darvozasi kalitlari\n');

  console.log(`  GATE_ENABLED = ${process.env.GATE_ENABLED ?? '(yo‘q)'} → darvoza ${enabled ? 'YOQILGAN' : 'O‘CHIRILGAN'}`);

  if (!site) bad('NEXT_PUBLIC_TURNSTILE_SITE_KEY bo‘sh');
  else if (isTest(site)) warn(`Site key — TEST kaliti (${site}). Prodda himoya bermaydi.`);
  else if (site.startsWith('0x4')) ok(`Site key ko‘rinishi to‘g‘ri (${site.slice(0, 12)}…)`);
  else warn(`Site key kutilmagan formatda: ${site.slice(0, 12)}…`);

  let secretOk = false;

  if (!secret) {
    bad('TURNSTILE_SECRET_KEY bo‘sh');
  } else {
    if (isTest(secret)) warn(`Secret — TEST kaliti. Prodda himoya bermaydi.`);

    const form = new URLSearchParams({ secret, response: 'tekshiruv-uchun-soxta-token' });
    const res = await fetch(VERIFY, { method: 'POST', body: form });
    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    const codes = data['error-codes'] ?? [];

    if (codes.includes('invalid-input-secret')) {
      bad('Secret NOTO‘G‘RI — Cloudflare uni tanimadi');
    } else if (codes.includes('invalid-input-response') || data.success) {
      ok('Secret to‘g‘ri — Cloudflare qabul qildi');
      secretOk = true;
    } else {
      warn(`Kutilmagan javob: ${JSON.stringify(data)}`);
    }
  }

  const real = site.startsWith('0x4') && !isTest(secret);

  if (secretOk && real) {
    console.log('\n  Tayyor. Keyingi qadam: `npm run build` — site key statik HTML ichiga yoziladi.\n');
  } else if (secretOk) {
    console.log('\n  Hali TEST kalitlari. dash.cloudflare.com → Turnstile → Add widget.\n');
  } else {
    console.log('\n  Kalitlarni tuzating, keyin shu buyruqni qayta ishlating.\n');
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('✗ Xato:', (e as Error).message);
  process.exit(1);
});
