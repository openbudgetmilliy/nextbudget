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

type Phase = 'loading' | 'waiting' | 'checking' | 'ready' | 'error';

const STATUS: Record<Exclude<Phase, 'error'>, string> = {
  loading: 'Tekshiruv yuklanmoqda',
  waiting: 'Quyidagi katakchani belgilang',
  checking: 'Tekshirilmoqda',
  ready: 'Tasdiqlandi',
};

/**
 * Kirish darvozasi.
 *
 * Oqim: Turnstile yechiladi → token `/api/gate` ga yuboriladi → server
 * Cloudflare'da tekshirib `gt` cookie'sini beradi → byulletenga muhr tushadi
 * va "Kirish" tugmasi yashil rangga o'tadi.
 *
 * Tugma bosilganda `/l` ochiladi; u yerda middleware cookie'ni qayta
 * tekshiradi, ya'ni tugmani DevTools'da yoqib qo'yish yordam bermaydi.
 *
 * `siteKey` bo'sh bo'lsa (kalitlar sozlanmagan) darvoza o'tkazib yuboriladi.
 */
export default function Gate({ siteKey, label }: { siteKey: string; label: string }) {
  const [phase, setPhase] = useState<Phase>(siteKey ? 'loading' : 'ready');
  const [err, setErr] = useState('');

  const boxRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  /** Bitta token bir marta yuborilsin — Cloudflare takroriy tekshiruvni rad etadi */
  const sentRef = useRef(false);

  const enter = useCallback(() => {
    // Router emas, to'liq navigatsiya: `/l` cache'lanmaydi va middleware'dan o'tadi
    window.location.href = '/l';
  }, []);

  const onToken = useCallback(async (token: string) => {
    if (sentRef.current) return;
    sentRef.current = true;

    setErr('');
    setPhase('checking');
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
      setPhase('ready');
    } catch {
      sentRef.current = false;
      setErr('Tarmoq xatosi. Internetni tekshiring.');
      setPhase('error');
      window.turnstile?.reset(widgetRef.current ?? undefined);
    }
  }, []);

  useEffect(() => {
    if (!siteKey) return;

    // Avval o'tgan bo'lsa — captchani umuman ko'rsatmaymiz
    if (hasHint()) {
      setPhase('ready');
      return;
    }

    let alive = true;

    const mount = () => {
      if (!alive || !boxRef.current || !window.turnstile || widgetRef.current) return;
      widgetRef.current = window.turnstile.render(boxRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        // 'auto' — brauzer tiliga qarab. Qo'lda 'uz' berilsa va Turnstile uni
        // qo'llamasa widget xato beradi, shuning uchun avtomatik qoldiramiz.
        language: 'auto',
        callback: onToken,
        'error-callback': () => {
          sentRef.current = false;
          setErr('Tasdiqlashni yuklab bo’lmadi. Sahifani yangilang.');
          setPhase('error');
        },
        'expired-callback': () => {
          sentRef.current = false;
          setPhase('waiting');
        },
        'timeout-callback': () => {
          sentRef.current = false;
          setPhase('waiting');
        },
      });
      setPhase('waiting');
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
  }, [siteKey, onToken]);

  const ready = phase === 'ready';

  return (
    <div className="gate-cta">
      <button
        type="button"
        className={`btn gate-btn${ready ? ' on' : ''}`}
        onClick={enter}
        disabled={!ready}
        aria-describedby="gate-status"
      >
        {label}
      </button>

      {/* Bitta uya: captcha o'z o'rnini muhrga bo'shatadi — sahifa sakramaydi */}
      {siteKey && (
        <div className="gate-slot">
          {ready ? (
            <span className="stamp stamp-in">Tasdiqlandi</span>
          ) : (
            <div className="gate-cap" ref={boxRef} />
          )}
        </div>
      )}

      {/* Kalitlar sozlanmagan bo'lsa tekshiruv umuman bo'lmaydi — «Tasdiqlandi»
          deb yozish yolg'on bo'lardi, shuning uchun holat qatori bo'sh qoladi. */}
      <p
        className={`gate-status${phase === 'error' ? ' bad' : ''}`}
        id="gate-status"
        role="status"
        aria-live="polite"
      >
        {!siteKey ? '' : phase === 'error' ? err || 'Xatolik' : STATUS[phase]}
      </p>
    </div>
  );
}
