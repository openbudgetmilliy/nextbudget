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

/** Katakcha chiqqan-chiqmaganini shu vaqtdan keyin tekshiramiz */
const PROMPT_AFTER_MS = 6000;
/** Shundan keyin tekshiruv qotib qolgan deb hisoblanadi */
const STUCK_AFTER_MS = 15000;
/** Tasdiq belgisi chizilishi + ekranning erishi */
const TICK_MS = 750;
const FADE_MS = 400;

/**
 * Bosqichlar HAQIQIY voqealarga bog'langan — o'ylab topilgan emas:
 *   0 → himoya xizmatiga ulanish (Turnstile skripti yuklanmoqda)
 *   1 → brauzer tekshiruvi (widget ishlayapti)
 *   2 → tasdiqlandi (`/api/gate` serverda tokenni qabul qildi)
 *
 * Soxta progress ko'rsatish oson bo'lardi, lekin u yolg'on bo'lardi: sahifa
 * "tekshirilmoqda" deb turib, aslida hech narsa qilmasligi mumkin edi.
 */
const STEPS = ['Himoya xizmatiga ulanish', 'Brauzer tekshiruvi', 'Tasdiqlash'] as const;

type Phase = 'checking' | 'prompt' | 'slow' | 'ok' | 'error' | 'manual';

export default function Gate({ siteKey }: { siteKey: string }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [stage, setStage] = useState(0);
  const [err, setErr] = useState('');

  const boxRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  /** Bitta token bir marta yuborilsin — Cloudflare takroriy tekshiruvni rad etadi */
  const sentRef = useRef(false);

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
   * Tasdiqlangandan keyingi chiqish: belgi chiziladi → ekran landing foniga
   * eriydi → o'tish. Harakat kamaytirilgan bo'lsa darrov o'tamiz.
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

        setStage(2);
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
    if (tries() >= MAX_TRIES) {
      setPhase('manual');
      return;
    }

    if (!siteKey) {
      navigate();
      return;
    }

    // Avval o'tgan bo'lsa — captchani qayta yugurtirmaymiz
    if (hasHint()) {
      setStage(2);
      setPhase('ok');
      leave();
      return;
    }

    let alive = true;

    const mount = () => {
      if (!alive || !boxRef.current || !window.turnstile || widgetRef.current) return;
      // Skript keldi va widget qo'yildi — ikkinchi bosqich boshlandi
      setStage(1);
      widgetRef.current = window.turnstile.render(boxRef.current, {
        sitekey: siteKey,
        theme: 'light',
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
     * odamdan bosish kutilyapti. Iframe bo'lmasa tekshiruv jimgina davom
     * etyapti va "katakchani belgilang" deyish yolg'on bo'lardi.
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

  const note: Record<Phase, string> = {
    checking: '',
    prompt: 'Davom etish uchun katakchani belgilang',
    slow: 'Tekshiruv cho’zilib ketdi',
    ok: '',
    error: err || 'Xatolik',
    manual: 'Avtomatik o’tib bo’lmadi',
  };

  const done = phase === 'ok';
  const bad = phase === 'error' || phase === 'slow' || phase === 'manual';

  /** Halqa: bosqichga qarab to'ladi. r=26 → aylana uzunligi ≈ 163.4 */
  const RING = 163.4;
  const filled = done ? 1 : stage === 0 ? 0.18 : 0.62;

  return (
    <div className="check">
      <div className={`dial${done ? ' is-done' : ''}${bad ? ' is-bad' : ''}`}>
        <svg viewBox="0 0 60 60" aria-hidden="true">
          <circle className="dial-bg" cx="30" cy="30" r="26" />
          <circle
            className="dial-fg"
            cx="30"
            cy="30"
            r="26"
            style={{ strokeDasharray: RING, strokeDashoffset: RING * (1 - filled) }}
          />
          {done && <path className="dial-tick" d="M19 31l7.5 7.5L42 23" />}
        </svg>
      </div>

      <ol className="steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={stage > i || done ? 'is-done' : stage === i ? 'is-now' : undefined}
          >
            <span className="steps-dot" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ol>

      {note[phase] && (
        <p className={`check-note${bad ? ' bad' : ''}`} role="status" aria-live="polite">
          {note[phase]}
        </p>
      )}

      {/* Turnstile uyasi — odatda bo'sh, faqat aralashuv kerak bo'lganda to'ladi */}
      <div className="gate-cap" ref={boxRef} />

      {/*
        Xatoda `/l` ga havola bermaymiz: cookie yo'q, middleware baribir
        qaytaradi va odam aylanib qoladi. Yagona foydali harakat —
        tekshiruvni boshidan yugurtirish.
      */}
      {bad && (
        <button type="button" className="btn" onClick={() => window.location.reload()}>
          Qayta urinish
        </button>
      )}
    </div>
  );
}
