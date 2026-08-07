'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
    __gateOnload?: () => void;
  }
}

const SCRIPT_ID = 'cf-turnstile';
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__gateOnload';

/** UX belgisi — haqiqiy ruxsat emas, u HttpOnly `gt` cookie'da (middleware tekshiradi) */
function hasHint(): boolean {
  return document.cookie.split('; ').some((c) => c === 'gt_ok=1');
}

function reducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Avto-yo'naltirishlar hisoblagichi.
 *
 * NEGA KERAK: sahifa tekshiruvdan keyin `/l` ga O'ZI o'tadi. Agar `gt`
 * cookie'si biror sababdan saqlanmasa, middleware `/l` dan `/` ga qaytaradi,
 * bu sahifa yana yo'naltiradi — va hokazo. Tugma bosiladigan oqimda bu ko'zga
 * tashlanardi, avtomatik oqimda esa brauzer cheksiz aylanardi.
 *
 * Bir sessiyada ikkitadan ortiq avto-o'tishga yo'l qo'yilmaydi.
 */
const TRY_KEY = 'mj_gate_try';
const MAX_TRIES = 2;

function tries(): number {
  try {
    return Number(sessionStorage.getItem(TRY_KEY) ?? '0') || 0;
  } catch {
    return 0;
  }
}

/** Tasdiq belgisi chizilishi + ekranning erishi uchun ketadigan vaqt */
const TICK_MS = 700;
const FADE_MS = 400;

/**
 * Shu vaqtdan keyin ham token kelmasa, foydalanuvchidan aralashuv so'ralgan
 * deb hisoblaymiz.
 *
 * Turnstile `interaction-only` rejimida odatda jim o'tadi, lekin shubhali
 * ko'ringan tashrifda katakcha CHIQARADI. O'shanda ekranda «Tekshirilmoqda»
 * qolib ketsa odam nima qilishni bilmaydi va sahifani tashlab ketadi —
 * shuning uchun matn katakchani belgilashga chaqiradigan bo'lib o'zgaradi.
 */
const PROMPT_AFTER_MS = 6000;

/** Shundan keyin tekshiruv qotib qolgan deb hisoblanadi va qayta urinish taklif etiladi */
const STUCK_AFTER_MS = 15000;

type Phase = 'checking' | 'prompt' | 'slow' | 'ok' | 'error' | 'manual';

export default function Gate({ siteKey }: { siteKey: string }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [err, setErr] = useState('');

  const boxRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  /** Bitta token bir marta yuborilsin — Cloudflare takroriy tekshiruvni rad etadi */
  const sentRef = useRef(false);

  /** `/l` ga o'tish. Halqa himoyasi shu yerda. */
  const navigate = useCallback(() => {
    try {
      sessionStorage.setItem(TRY_KEY, String(tries() + 1));
    } catch {
      /* private rejimda sessionStorage yo'q — o'tish baribir ishlaydi */
    }
    // Router emas, to'liq navigatsiya: `/l` cache'lanmaydi va middleware'dan o'tadi
    window.location.href = '/l';
  }, []);

  /**
   * Tasdiqlangandan keyingi chiqish.
   *
   * Belgi chiziladi → ekran landing foniga eriydi → o'tish. Ikkinchi sahifa
   * shu fonda ochilgani uchun kelish uzluksiz tuyuladi.
   *
   * Harakat kamaytirilgan bo'lsa — darrov o'tamiz, kutish ma'nosiz.
   */
  const leave = useCallback(() => {
    if (reducedMotion()) {
      navigate();
      return;
    }
    setTimeout(() => {
      document.body.classList.add('leaving');
      setTimeout(navigate, FADE_MS);
    }, TICK_MS);
  }, [navigate]);

  const onToken = useCallback(
    async (token: string) => {
      if (sentRef.current) return;
      sentRef.current = true;

      setErr('');
      try {
        const res = await fetch('/api/gate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          sentRef.current = false;
          setErr(data.error || 'Tasdiqlash o’tmadi');
          setPhase('error');
          window.turnstile?.reset(widgetRef.current ?? undefined);
          return;
        }

        setPhase('ok');
        leave();
      } catch {
        sentRef.current = false;
        setErr('Tarmoq xatosi. Internetni tekshiring.');
        setPhase('error');
        window.turnstile?.reset(widgetRef.current ?? undefined);
      }
    },
    [leave],
  );

  useEffect(() => {
    // Halqaga tushib qolgan bo'lsak — avtomatik o'tishni to'xtatamiz
    if (tries() >= MAX_TRIES) {
      setPhase('manual');
      return;
    }

    // Kalitlar sozlanmagan — darvoza umuman yo'q, to'g'ridan-to'g'ri o'tamiz
    if (!siteKey) {
      navigate();
      return;
    }

    // Avval o'tgan bo'lsa — captchani qayta yugurtirmaymiz
    if (hasHint()) {
      setPhase('ok');
      leave();
      return;
    }

    let alive = true;

    const mount = () => {
      if (!alive || !boxRef.current || !window.turnstile || widgetRef.current) return;
      widgetRef.current = window.turnstile.render(boxRef.current, {
        sitekey: siteKey,
        theme: 'light',
        // 'auto' — brauzer tiliga qarab. Qo'lda 'uz' berilsa va Turnstile uni
        // qo'llamasa widget xato beradi, shuning uchun avtomatik qoldiramiz.
        language: 'auto',
        // Widget faqat HAQIQATAN odam aralashuvi kerak bo'lganda ko'rinadi
        appearance: 'interaction-only',
        callback: onToken,
        'error-callback': () => {
          sentRef.current = false;
          setErr('Tasdiqlashni yuklab bo’lmadi. Sahifani yangilang.');
          setPhase('error');
        },
        'expired-callback': () => {
          sentRef.current = false;
          setPhase('checking');
        },
        'timeout-callback': () => {
          sentRef.current = false;
          setPhase('checking');
        },
      });
    };

    if (window.turnstile) {
      mount();
    } else {
      window.__gateOnload = mount;
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        s.onerror = () => {
          if (!alive) return;
          setErr('Tasdiqlash xizmatiga ulanib bo’lmadi.');
          setPhase('error');
        };
        document.head.appendChild(s);
      }
    }

    /**
     * Matnni WIDGET HOLATIGA qarab tanlaymiz, vaqtga qarab emas.
     *
     * Turnstile katakcha ko'rsatsa uyaga `iframe` qo'yadi. Iframe bo'lsa —
     * odamdan bosish kutilyapti, shuni aytamiz. Iframe bo'lmasa tekshiruv
     * jimgina davom etyapti va "katakchani belgilang" deyish yolg'on bo'lardi:
     * belgilaydigan narsa yo'q.
     */
    const prompt = setTimeout(() => {
      if (!alive) return;
      if (boxRef.current?.querySelector('iframe')) {
        setPhase((p) => (p === 'checking' ? 'prompt' : p));
      }
    }, PROMPT_AFTER_MS);

    // Hech narsa bo'lmadi — odamni cheksiz kuttirmaymiz
    const stuck = setTimeout(() => {
      if (alive) setPhase((p) => (p === 'checking' ? 'slow' : p));
    }, STUCK_AFTER_MS);

    return () => {
      alive = false;
      clearTimeout(prompt);
      clearTimeout(stuck);
      if (widgetRef.current) {
        window.turnstile?.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [siteKey, onToken, navigate, leave]);

  const message: Record<Phase, string> = {
    checking: 'Tekshirilmoqda',
    prompt: 'Davom etish uchun katakchani belgilang',
    slow: 'Tekshiruv cho’zilib ketdi',
    ok: 'Tasdiqlandi',
    error: err || 'Xatolik',
    manual: 'Avtomatik o’tib bo’lmadi',
  };

  return (
    <div className="splash-check">
      {(phase === 'checking' || phase === 'prompt' || phase === 'slow') && (
        <svg className="ring" viewBox="0 0 52 52" aria-hidden="true">
          <circle className="ring-bg" cx="26" cy="26" r="23" />
          <circle className="ring-fg" cx="26" cy="26" r="23" />
        </svg>
      )}

      {phase === 'ok' && (
        // Logotipdagi yashil tasdiq belgisi — shu yerda chizilib ko'rsatiladi
        <svg className="tick" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="23" />
          <path d="M15 27l7.5 7.5L37 20" />
        </svg>
      )}

      <p className={`splash-status${phase === 'error' ? ' bad' : ''}`} role="status" aria-live="polite">
        {message[phase]}
      </p>

      {/* Turnstile uyasi — odatda bo'sh, faqat aralashuv kerak bo'lganda to'ladi */}
      <div className="gate-cap" ref={boxRef} />

      {/*
        Xatoda `/l` ga havola bermaymiz: cookie yo'q, middleware baribir
        qaytaradi va odam aylanib qoladi. Yagona foydali harakat —
        tekshiruvni boshidan yugurtirish.
      */}
      {(phase === 'manual' || phase === 'error' || phase === 'slow') && (
        <button type="button" className="btn" onClick={() => window.location.reload()}>
          Qayta urinish
        </button>
      )}
    </div>
  );
}
