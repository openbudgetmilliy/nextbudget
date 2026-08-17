/**
 * Analitika client SDK — ~2 KB, hech qanday tashqi kutubxona yo'q.
 *
 * Dizayn qarorlari (Instagram WebView + katta trafik uchun):
 *  · Event delegation — har tugma uchun alohida React client component yo'q.
 *    Server `<a data-t="cta" data-t-id="hero_cta">` chiqaradi, bitta global
 *    listener ushlaydi. Landing'da hydration deyarli nol.
 *  · sendBeacon → fetch(keepalive) zaxirasi bilan. Eski Android WebView'da
 *    sendBeacon yo'q bo'lishi mumkin.
 *  · pagehide + visibilitychange — iOS WebView pagehide'ni ishonchli
 *    yubormaydi, visibilitychange yuboradi.
 *  · scroll rAF bilan throttle — spec'dagi xom listener WebView'da INP'ni buzadi.
 *  · Sessiyaga event limiti — bot/abuse origin'ga cheksiz yozmasin.
 */

export type Ev = {
  type: 'view' | 'scroll' | 'cta' | 'click' | 'exit' | string;
  elId?: string;
  elText?: string;
  scrollPct?: number;
  dwellMs?: number;
};

const ENDPOINT = '/api/e';
const BATCH = 15;
const INTERVAL = 10_000;
const MAX_EVENTS_PER_SESSION = 200;

let queue: Ev[] = [];
let sid = '';
let sent = 0;
let started = Date.now();
let inited = false;

function sessionId(): string {
  if (sid) return sid;
  try {
    const stored = sessionStorage.getItem('sp_sid');
    if (stored) {
      sid = stored;
    } else {
      sid = uuid();
      sessionStorage.setItem('sp_sid', sid);
    }
  } catch {
    // Private mode / storage bloklangan — sessiya faqat shu sahifa uchun
    sid = sid || uuid();
  }
  return sid;
}

function uuid(): string {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  } catch {
    return `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

function cut(s: string | null | undefined, n: number): string | undefined {
  if (!s) return undefined;
  return s.length > n ? s.slice(0, n) : s;
}

function meta() {
  const p = new URLSearchParams(location.search);
  return {
    utmSource: cut(p.get('utm_source'), 60),
    utmMedium: cut(p.get('utm_medium'), 60),
    utmCampaign: cut(p.get('utm_campaign'), 80),
    utmContent: cut(p.get('utm_content'), 80),
    referrer: cut(document.referrer, 300),
    ua: cut(navigator.userAgent, 300),
    page: location.pathname,
  };
}

function post(body: string): void {
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
  } catch {
    /* pastdagi fetch'ga tushamiz */
  }
  try {
    void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, mode: 'same-origin' }).catch(
      () => {},
    );
  } catch {
    /* jim */
  }
}

export function flush(): void {
  if (!queue.length) return;
  const events = queue;
  queue = [];
  post(JSON.stringify({ sid: sessionId(), events, meta: meta() }));
}

export function track(e: Ev): void {
  if (sent >= MAX_EVENTS_PER_SESSION) return;
  sent++;
  queue.push(e);

  /**
   * Meta Pixel: CTA bosilishi — reklama kabinetidagi «Lead» konversiyasi.
   *
   * `fbq` layout'dagi bazaviy skriptdan keladi (ID berilmagan bo'lsa umuman
   * yo'q — shuning uchun optional chaining). Bir nechta pixel init qilingan
   * bo'lsa `track` hammasiga birdek yuboradi. `content_name` — tugma
   * identifikatori: qaysi sahifa/joy olib kelganini Meta'da ham ko'rsatadi.
   */
  if (e.type === 'cta') {
    try {
      (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq?.('track', 'Lead', {
        content_name: e.elId,
      });
    } catch {
      /* jim — analitika asosiy oqimni hech qachon buzmaydi */
    }
  }

  // Konversiya eventini kutib turmaymiz: bosgandan keyin sahifa Telegram'ga ketadi
  if (e.type === 'cta' || queue.length >= BATCH) flush();
}

/**
 * Telegram deep link'ga trafik manbasini qo'shish.
 *
 * SSG sahifa foydalanuvchining UTM'ini bilmaydi, shuning uchun server
 * `?start=p_ovoz_10` kabi bazaviy qiymat qo'yadi — biz uni ALMASHTIRMAYMIZ,
 * ustiga manba qo'shamiz: `p_ovoz_10-ig-reel3`.
 * Natijada botda ham qaysi paket, ham qaysi kreativ ko'rinadi.
 * Telegram start param: A-Za-z0-9_- va maks. 64 belgi.
 */
function stampTelegramLinks(): void {
  const p = new URLSearchParams(location.search);
  const src = p.get('utm_source') || (/instagram/i.test(document.referrer) ? 'ig' : '');
  const creative = p.get('utm_content') || p.get('utm_campaign') || '';
  const tag = [src, creative]
    .filter(Boolean)
    .join('-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 40);
  if (!tag) return;

  document.querySelectorAll<HTMLAnchorElement>('a[data-tg]').forEach((a) => {
    try {
      const u = new URL(a.href);
      const base = u.searchParams.get('start') || 'web';
      u.searchParams.set('start', `${base}-${tag}`.slice(0, 64));
      a.href = u.toString();
    } catch {
      /* jim */
    }
  });
}

export function initTracking(): void {
  if (inited || typeof window === 'undefined') return;
  inited = true;
  started = Date.now();

  try {
    if (localStorage.getItem('sp_optout') === '1') return;
  } catch {
    /* jim */
  }

  stampTelegramLinks();
  track({ type: 'view' });

  // ── Klik (delegation) ──
  addEventListener(
    'click',
    (ev) => {
      const el = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-t]');
      if (!el) return;
      track({
        type: el.dataset.t || 'click',
        elId: cut(el.dataset.tId, 60),
        elText: cut((el.textContent || '').trim().replace(/\s+/g, ' '), 80),
      });
    },
    { passive: true, capture: true },
  );

  // ── Scroll chuqurligi ──
  const marks = new Set<number>();
  let raf = 0;
  addEventListener(
    'scroll',
    () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const max = doc.scrollHeight - innerHeight;
        if (max <= 0) return;
        const pct = Math.round((scrollY / max) * 100);
        for (const m of [25, 50, 75, 100]) {
          if (pct >= m && !marks.has(m)) {
            marks.add(m);
            track({ type: 'scroll', scrollPct: m });
          }
        }
      });
    },
    { passive: true },
  );

  // ── Chiqish ──
  let closed = false;
  const bye = () => {
    if (closed) return;
    closed = true;
    track({ type: 'exit', dwellMs: Date.now() - started });
    flush();
  };
  addEventListener('pagehide', bye);
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') bye();
    else closed = false; // qaytib kelsa yana kuzatamiz
  });

  setInterval(flush, INTERVAL);
}
