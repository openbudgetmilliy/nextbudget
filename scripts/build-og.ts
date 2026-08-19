/**
 * OG rasmini yasaydi: `app/opengraph-image.png` (1200×630).
 *
 * Nega skript, `app/opengraph-image.tsx` emas: `ImageResponse` bilan rasm har
 * build'da qaytadan render bo'lardi va shrift fayllarini tarmoqdan tortishi
 * kerak edi — deploy tarmoqqa bog'lanib qolardi. Rasm esa deyarli
 * o'zgarmaydi, shuning uchun uni BIR MARTA yasab, repoga qo'yamiz.
 *
 * Ishga tushirish:  npm run og
 *
 * Dizayn bosh sahifa bilan bir tilda: sof sariq fon, qora qalin harflar,
 * oq "qog'oz" bo'laklari va qattiq soya (neo-brutalizm). Narx ATAYIN
 * yozilmagan — u admin paneldan o'zgaradi, rasmga muhrlansa esa eskirib
 * qolardi (eski OG rasmda aynan shu bo'lgan: unda «30 000 so'm» qotib
 * qolgan edi).
 */
import { ImageResponse } from 'next/og';
import { readFile, writeFile } from 'node:fs/promises';
import { SITE } from '../lib/content';

/** Google Fonts'dan TTF olish. woff2 satori'ga yaramaydi — eski UA bilan
 *  so'rasak Google ttf qaytaradi. */
async function font(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)' } },
  ).then((r) => r.text());

  const url = css.match(/src:\s*url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`${family} ${weight}: ttf topilmadi`);
  return fetch(url).then((r) => r.arrayBuffer());
}

const BG = '#ffd400';
const INK = '#0a0a0a';
const PAPER = '#ffffff';
const DIM = 'rgba(0,0,0,0.66)';
const SHADOW = '10px 10px 0 rgba(0,0,0,0.28)';

/** Oq "qog'oz" tabletka — sahifadagi `.pill` bilan bir xil */
function pill(text: string) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        background: PAPER,
        border: `3px solid ${INK}`,
        borderRadius: '999px',
        padding: '10px 22px',
        fontSize: 24,
        fontWeight: 700,
        color: INK,
      },
      children: text,
    },
  };
}

async function main() {
  const [inter500, inter700, inter800, logo] = await Promise.all([
    font('Inter', 500),
    font('Inter', 700),
    font('Inter', 800),
    readFile('assets/milliy-logo.png'),
  ]);

  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  const img = new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: BG,
          padding: '58px 68px',
          fontFamily: 'Inter',
        },
        children: [
          // ── Tepa: belgi + brend, o'ng tomonda "Bepul" yorlig'i ──
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '20px' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '78px',
                            height: '78px',
                            background: PAPER,
                            border: `4px solid ${INK}`,
                            borderRadius: '18px',
                            // Belgi gradienti oq fonda ishlaydi — sariq fonda
                            // uchlari dog' bo'lardi, shuning uchun oq plita
                          },
                          children: {
                            type: 'img',
                            props: { src: logoSrc, width: 52, height: 52 },
                          },
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: 30,
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: INK,
                          },
                          children: SITE.brand,
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      background: INK,
                      color: BG,
                      borderRadius: '999px',
                      padding: '12px 26px',
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    },
                    children: 'Bepul',
                  },
                },
              ],
            },
          },

          // ── O'rta: asosiy va'da ──
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: 104,
                      fontWeight: 800,
                      lineHeight: 0.98,
                      letterSpacing: '-0.045em',
                      textTransform: 'uppercase',
                      color: INK,
                    },
                    children: [
                      { type: 'div', props: { children: 'Ovoz bering' } },
                      { type: 'div', props: { children: '— pul ishlab oling' } },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      marginTop: '22px',
                      fontSize: 30,
                      fontWeight: 500,
                      color: DIM,
                    },
                    children: 'Har bir ovoz uchun haqiqiy to’lov. Telegram bot orqali.',
                  },
                },
              ],
            },
          },

          // ── Past: ishonch belgilari va domen ──
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', gap: '12px' },
                    children: [pill('2 daqiqa'), pill('Uzcard · Humo'), pill('Hujjat kerak emas')],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      background: INK,
                      color: BG,
                      border: `3px solid ${INK}`,
                      borderRadius: '14px',
                      boxShadow: SHADOW,
                      padding: '14px 24px',
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                    },
                    children: SITE.domain,
                  },
                },
              ],
            },
          },
        ],
      },
    } as never,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: inter500, weight: 500, style: 'normal' },
        { name: 'Inter', data: inter700, weight: 700, style: 'normal' },
        { name: 'Inter', data: inter800, weight: 800, style: 'normal' },
      ],
    },
  );

  const png = Buffer.from(await img.arrayBuffer());
  await writeFile('app/opengraph-image.png', png);
  console.log(`✓ app/opengraph-image.png — ${png.length} bayt`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
