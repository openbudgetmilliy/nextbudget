'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fondagi Turnstile tekshiruvi.
 *
 * Ilgari bu tekshiruv ALOHIDA DARVOZA SAHIFASI edi: odam `/` da kutib turar,
 * tasdiqdan keyin `/l` landingga o'tkazilardi. Endi landing darhol ochiladi,
 * tekshiruv esa uning ortida jimgina bajariladi va muvaffaqiyatli bo'lsa
 * `gt` cookie'sini beradi (`/api/gate` orqali).
 *
 * Uch qoida (buzilsa foyda o'rniga zarar bo'ladi):
 *
 *  1. SAHIFANI HECH QACHON TO'SMAYDI. Tekshiruv yiqilsa ham, Cloudflare
 *     javob bermasa ham landing ishlayveradi va Telegram tugmasi bosiladi.
 *     Konversiya captchaga bog'liq bo'lib qolmasligi kerak.
 *  2. ODATDA KO'RINMAYDI. `appearance: 'interaction-only'` — katakcha faqat
 *     Cloudflare haqiqatan odam aralashuvini so'raganda chiziladi. Shu holatda
 *     u pastki o'ng burchakda paydo bo'ladi, matnni bosib qolmaydi.
 *  3. BIR MARTA. `gt_ok` belgisi bor bo'lsa skript umuman yuklanmaydi —
 *     qaytib kelgan odam uchun ortiqcha 60KB va tarmoq so'rovi bo'lmaydi.
 *
 * Sahifa statik (SSG) bo'lib qolaveradi: bu komponent client tomonda ishlaydi,
 * `sitekey` esa build paytida `NEXT_PUBLIC_*` dan muhrlanadi.
 */

type TurnstileOpts = {
  sitekey: string;
  theme?: 'auto' | 'light' | 'dark';
  language?: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileOpts) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    __tsOnload?: () => void;
  }
}

const SCRIPT_ID = 'cf-turnstile';
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__tsOnload';

/** JS o'qiy oladigan belgi. Haqiqiy ruxsat HttpOnly `gt` cookie'sida. */
function verified(): boolean {
  return document.cookie.split('; ').some((c) => c === 'gt_ok=1');
}

export default function TurnstileGuard({ siteKey }: { siteKey: string }) {
  /**
   * Katakcha chindan chizildimi? Faqat shunda uyaga ko'rinadigan ramka
   * beramiz — bo'sh `div` sahifa burchagida turib qolmasin.
   */
  const [visible, setVisible] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  /** Bitta token bir marta yuboriladi — Cloudflare takrorini rad etadi */
  const sentRef = useRef(false);

  useEffect(() => {
    if (!siteKey || verified()) return;

    let alive = true;

    const send = async (token: string) => {
      if (sentRef.current) return;
      sentRef.current = true;
      try {
        await fetch('/api/gate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch {
        /* Tarmoq xatosi — jim o'tamiz. Sahifa baribir ishlayapti. */
      }
      if (alive) setVisible(false);
    };

    const mount = () => {
      if (!alive || !boxRef.current || !window.turnstile || widgetRef.current) return;
      widgetRef.current = window.turnstile.render(boxRef.current, {
        sitekey: siteKey,
        theme: 'light',
        language: 'auto',
        appearance: 'interaction-only',
        callback: send,
        // Xatoda hech narsa qilmaymiz: qayta urinish odamni bezovta qiladi,
        // foydasi esa yo'q — sahifa kontenti baribir ochiq.
        'error-callback': () => setVisible(false),
        'expired-callback': () => {
          sentRef.current = false;
        },
        'timeout-callback': () => {
          sentRef.current = false;
        },
      });
    };

    if (window.turnstile) {
      mount();
    } else {
      window.__tsOnload = mount;
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }

    /**
     * Katakcha chizilganini VAQT bilan emas, DOM bilan bilamiz: Turnstile
     * aralashuv so'rasa uyaga `iframe` qo'yadi. Iframe paydo bo'lmasa
     * tekshiruv jimgina o'tgan va uyani ko'rsatishning hojati yo'q.
     */
    const watch = setInterval(() => {
      if (!alive) return;
      const box = boxRef.current;
      if (!box) return;
      const frame = box.querySelector('iframe');
      // Turnstile ko'rinmas rejimda ham iframe qo'yadi, lekin u 0 o'lchamda
      if (frame && frame.clientHeight > 10) setVisible(true);
    }, 500);

    // 30 soniyada hech narsa bo'lmasa kuzatishni to'xtatamiz — timer bekorga
    // ishlab, batareyani yemasin
    const stop = setTimeout(() => clearInterval(watch), 30_000);

    return () => {
      alive = false;
      clearInterval(watch);
      clearTimeout(stop);
      if (widgetRef.current) {
        window.turnstile?.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <div
      ref={boxRef}
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        right: '16px',
        // Tepada turadi: pastki zona — CTA tugmalari, vidjet interaktiv
        // rejimga o'tganda ularning bosilishini to'sib qo'ymasligi kerak
        top: '16px',
        zIndex: 60,
        // Ko'rinmagan holatda joy egallamaydi va bosishlarni ushlamaydi
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity .25s ease',
      }}
    />
  );
}
