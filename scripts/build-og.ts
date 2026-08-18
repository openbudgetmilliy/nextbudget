/**
 * OG rasmini yasaydi: `app/opengraph-image.png` (1200×630).
 *
 * Nega skript, `app/opengraph-image.tsx` emas: `ImageResponse` bilan rasm har
 * build'da qaytadan render bo'lardi va shrift fayllarini tarmoqdan tortishi
 * kerak edi — deploy tarmoqqa bog'lanib qolardi. Rasm esa deyarli
 * o'zgarmaydi, shuning uchun uni BIR MARTA yasab, repoga qo'yamiz.
 *
 * Ishga tushirish:  npx tsx scripts/build-og.ts
 *
 * Dizayn landing bilan bir xil tilda: to'q zumrad fon, oltin gradient urg'u,
 * shisha panel. Narx ATAYIN yozilmagan — u admin paneldan o'zgaradi, rasmga
 * muhrlansa esa eskirib qolardi (eski OG rasmda aynan shu bo'lgan: unda
 * «30 000 so'm» qotib qolgan edi).
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

const BG = '#04110b';
const INK = '#edf7f0';
const DIM = '#8fb3a0';
const GOLD = '#f5c242';

async function main() {
  const [grotesk700, inter400, inter600, logo] = await Promise.all([
    font('Space+Grotesk', 700),
    font('Inter', 400),
    font('Inter', 600),
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
          padding: '64px 72px',
          fontFamily: 'Inter',
          position: 'relative',
        },
        children: [
          // Tepadagi oltin chiziq — brend urg'usi.
          // Ilgari bu yerda radial "nur" turardi, lekin satori uni loyqa
          // zaytun dog' qilib chizdi va Telegram'dagi kichik ko'rinishda
          // kir dog'dek o'qilardi. Aniq chiziq har o'lchamda toza chiqadi.
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1200px',
                height: '10px',
                backgroundImage: 'linear-gradient(90deg, #ffe9a8, #f5c242 45%, #ca8a04)',
              },
            },
          },

          // ── Tepa: belgi + brend ──
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '18px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '76px',
                      height: '76px',
                      background: '#fff',
                      borderRadius: '20px',
                      // Belgi gradienti oq fonda ishlaydi — to'q fonda uchlari
                      // dog' bo'lardi, shuning uchun oq plita ustida turadi
                      boxShadow: '0 0 0 2px rgba(245,194,66,0.35)',
                    },
                    children: {
                      type: 'img',
                      props: { src: logoSrc, width: 54, height: 54 },
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Space Grotesk',
                      fontSize: 38,
                      color: INK,
                      letterSpacing: '-0.01em',
                    },
                    children: SITE.brand,
                  },
                },
              ],
            },
          },

          // ── O'rta: asosiy va'da ──
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '20px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      fontFamily: 'Space Grotesk',
                      fontSize: 84,
                      lineHeight: 1.08,
                      letterSpacing: '-0.02em',
                      color: INK,
                    },
                    children: [
                      { type: 'div', props: { children: 'Ovoz bering —' } },
                      {
                        type: 'div',
                        props: {
                          style: {
                            backgroundImage:
                              'linear-gradient(120deg, #ffe9a8, #f5c242 45%, #ca8a04)',
                            backgroundClip: 'text',
                            color: 'transparent',
                          },
                          children: 'pul ishlab oling',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: 30, color: DIM, fontWeight: 400 },
                    children: 'Har bir ovoz uchun haqiqiy to’lov. Telegram bot orqali.',
                  },
                },
              ],
            },
          },

          // ── Past: to'lov usullari va domen ──
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255,255,255,0.10)',
                paddingTop: '26px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: 26, color: DIM, fontWeight: 400 },
                    children: 'Humo · Uzcard · Payme',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Space Grotesk',
                      fontSize: 28,
                      color: GOLD,
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
        { name: 'Space Grotesk', data: grotesk700, weight: 700, style: 'normal' },
        { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
        { name: 'Inter', data: inter600, weight: 600, style: 'normal' },
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
