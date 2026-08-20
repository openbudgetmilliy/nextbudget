/**
 * Kadrga bog'langan Meta Pixel — server komponent, ID'lar `lib/pages.ts`
 * reyestridan keladi (`PAGE.pixels`). ID bo'lmasa hech narsa chiqarmaydi.
 *
 * Nega layout'da emas: har reklama akkauntining o'z pixeli bor va akkaunt
 * o'z kadr(lar)iga target qiladi — pixel ham faqat o'sha kadrlarda yonishi
 * kerak. `app/layout.tsx` dagi NEXT_PUBLIC_META_PIXEL_ID (global) bilan
 * yonma-yon ishlaydi: bazaviy fbq snippeti idempotent (`if(f.fbq)return`),
 * PageView esa `trackSingle` bilan FAQAT shu kadr pixellariga ketadi —
 * global pixel PageView'i ikkilanmaydi. `lib/track.ts` dagi Lead odatdagi
 * `fbq('track')` — u barcha init qilingan pixellarga boradi, shu jumladan
 * bunisiga ham (reklama akkaunti konversiyani ko'rishi uchun aynan shu kerak).
 */

const BASE =
  "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');";

export default function MetaPixel({ ids }: { ids?: string[] }) {
  const clean = (ids ?? []).filter((id) => /^\d{5,20}$/.test(id));
  if (clean.length === 0) return null;

  const js =
    BASE +
    clean.map((id) => `fbq('init','${id}');`).join('') +
    clean.map((id) => `fbq('trackSingle','${id}','PageView');`).join('');

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: js }} />
      <noscript>
        {/* JS o'chiq brauzer uchun zaxira — hech bo'lmasa PageView yetsin */}
        {clean.map((id) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
            alt=""
          />
        ))}
      </noscript>
    </>
  );
}
