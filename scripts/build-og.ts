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
 * Dizayn bosh sahifa bilan bir tilda: oq varaq, tepadan och moviy
 * yorug'lik, bayroq lentasi, moviy-yashil urg'ular («Milliy»). Narx ATAYIN
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

const BG = 'linear-gradient(180deg, #e6f5f9 0%, #ffffff 45%)';
const INK = '#10222b';
const PAPER = '#ffffff';
const DIM = '#5f7683';
const BLUE = '#0099b5';
const BLUE_D = '#007e96';
const GREEN = '#159947';
const RED = '#ce1126';
const LINE = '#dbe8ed';
const SOFT = '#eef8fb';

/** Oq "qog'oz" tabletka — sahifadagi `.pill` bilan bir xil */
function pill(text: string) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        background: PAPER,
        border: `2px solid ${LINE}`,
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
          backgroundImage: BG,
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
                          style: { display: 'flex' },
                          // Belgi to'liq rangli — oq fonda plitasiz turadi
                          children: {
                            type: 'img',
                            props: { src: logoSrc, width: 78, height: 78 },
                          },
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: 34,
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
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
                      background: SOFT,
                      border: `2px solid ${LINE}`,
                      color: BLUE_D,
                      borderRadius: '999px',
                      padding: '12px 26px',
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
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
                // Bayroq lentasi: moviy / qizil ip / oq / qizil ip / yashil
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      width: '280px',
                      height: '16px',
                      borderRadius: '999px',
                      border: `1px solid ${LINE}`,
                      overflow: 'hidden',
                      marginBottom: '30px',
                    },
                    children: [
                      { type: 'div', props: { style: { flexGrow: 1, background: BLUE } } },
                      { type: 'div', props: { style: { width: '5px', background: RED } } },
                      { type: 'div', props: { style: { flexGrow: 1, background: PAPER } } },
                      { type: 'div', props: { style: { width: '5px', background: RED } } },
                      { type: 'div', props: { style: { flexGrow: 1, background: GREEN } } },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: 96,
                      fontWeight: 800,
                      lineHeight: 1.04,
                      letterSpacing: '-0.03em',
                      color: INK,
                    },
                    children: [
                      { type: 'div', props: { children: 'Ovoz bering' } },
                      {
                        type: 'div',
                        props: { style: { color: BLUE_D }, children: '— pul ishlab oling' },
                      },
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
                    children: [pill('Ishtirok bepul'), pill('2 daqiqa'), pill('Hujjatsiz')],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      background: BLUE,
                      color: PAPER,
                      borderRadius: '14px',
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
