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

/**
 * Avto-yo'naltirishlar hisoblagichi.
 *
 * NEGA KERAK: sahifa tekshiruvdan keyin `/l` ga O'ZI o'tadi. Agar `gt`
 * cookie'si biror sababdan saqlanmasa (masalan brauzer uni rad etsa),
 * middleware `/l` dan `/` ga qaytaradi, bu sahifa yana yo'naltiradi — va
 * hokazo. Tugma bosiladigan eski oqimda bu ko'zga tashlanardi, avtomatik
 * oqimda esa brauzer cheksiz aylanib qolardi.
 *
 * Shuning uchun bir sessiyada ikkitadan ortiq avto-o'tishga yo'l qo'yilmaydi:
 * uchinchisida qo'lda tugma ko'rsatiladi.
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

type Phase = 'checking' | 'ok' | 'error' | 'manual';

export default function Gate({ siteKey }: { siteKey: string }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [err, setErr] = useState('');

  const boxRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  /** Bitta token bir marta yuborilsin — Cloudflare takroriy tekshiruvni rad etadi */
  const sentRef = useRef(false);

  /** `/l` ga o'tish. Halqa himoyasi shu yerda. */
  const go = useCallback(() => {
    try {
      sessionStorage.setItem(TRY_KEY, String(tries() + 1));
    } catch {
      /* private rejimda sessionStorage yo'q — o'tishning o'zi baribir ishlaydi */
    }
    // Router emas, to'liq navigatsiya: `/l` cache'lanmaydi va middleware'dan o'tadi
    window.location.href = '/l';
  }, []);

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
        go();
      } catch {
        sentRef.current = false;
        setErr('Tarmoq xatosi. Internetni tekshiring.');
        setPhase('error');
        window.turnstile?.reset(widgetRef.current ?? undefined);
      }
    },
    [go],
  );

  useEffect(() => {
    // Halqaga tushib qolgan bo'lsak — avtomatik o'tishni to'xtatamiz
    if (tries() >= MAX_TRIES) {
      setPhase('manual');
      return;
    }

    // Kalitlar sozlanmagan — darvoza umuman yo'q, to'g'ridan-to'g'ri o'tamiz
    if (!siteKey) {
      go();
      return;
    }

    // Avval o'tgan bo'lsa — captchani qayta yugurtirmaymiz
    if (hasHint()) {
      setPhase('ok');
      go();
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
        // Widget faqat HAQIQATAN odam aralashuvi kerak bo'lganda ko'rinadi.
        // Aksariyat foydalanuvchi hech narsa ko'rmaydi — tekshiruv fonda o'tadi.
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

    return () => {
      alive = false;
      if (widgetRef.current) {
        window.turnstile?.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [siteKey, onToken, go]);

  const message: Record<Phase, string> = {
    checking: 'Tekshirilmoqda — bir necha soniya',
    ok: 'Tasdiqlandi, ochilmoqda…',
    error: err || 'Xatolik',
    manual: 'Avtomatik o’tib bo’lmadi. Quyidagi tugmani bosing.',
  };

  return (
    <>
      <div className={`gate-bar${phase === 'ok' ? ' done' : ''}`} aria-hidden="true">
        <span />
      </div>

      <p className={`gate-status${phase === 'error' ? ' bad' : ''}`} role="status" aria-live="polite">
        {message[phase]}
      </p>

      {/* Turnstile uyasi — odatda bo'sh, faqat aralashuv kerak bo'lganda to'ladi */}
      <div className="gate-cap" ref={boxRef} />

      {(phase === 'manual' || phase === 'error') && (
        <a href="/l" className="btn" data-t="click" data-t-id="gate_manual">
          Davom etish
        </a>
      )}
    </>
  );
}
