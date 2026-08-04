/**
 * Cho'qqi (spike) testi. Instagram'da reklama chiqqan ilk 20 daqiqani taqlid qiladi.
 *
 *   k6 run k6/spike.js
 *   k6 run -e BASE=https://starspaymee.uz k6/spike.js
 *
 * DIQQAT: Cloudflare yoqilgan bo'lsa bu test asosan CF edge'ni sinaydi va
 * `cf-cache-status: HIT` ko'rsatadi — bu to'g'ri natija (aynan shuni xohlaymiz).
 * Origin'ning haqiqiy chidamini bilish uchun to'g'ridan-to'g'ri urib ko'ring:
 *   k6 run -e BASE=http://ORIGIN_IP:3000 k6/spike.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const BASE = __ENV.BASE || 'https://starspaymee.uz';

const cacheHits = new Counter('cf_cache_hits');
const cacheMiss = new Counter('cf_cache_misses');

export const options = {
  scenarios: {
    // Sahifani ochayotgan foydalanuvchilar
    visitors: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 800 },
        { duration: '2m', target: 800 },
        { duration: '30s', target: 0 },
      ],
      exec: 'visit',
    },
    // Analitika beacon'lari — origin'ga tushadigan yagona issiq yo'l
    beacons: {
      executor: 'constant-arrival-rate',
      rate: 60,
      timeUnit: '1s',
      duration: '2m50s',
      preAllocatedVUs: 60,
      maxVUs: 200,
      exec: 'beacon',
    },
  },
  thresholds: {
    'http_req_duration{scenario:visitors}': ['p(95)<400'],
    'http_req_duration{scenario:beacons}': ['p(95)<150'],
    http_req_failed: ['rate<0.01'],
  },
};

const CREATIVES = ['reel_01', 'reel_02', 'story_a', 'story_b', 'carousel_1'];

export function visit() {
  const creative = CREATIVES[Math.floor(Math.random() * CREATIVES.length)];
  const res = http.get(
    `${BASE}/?utm_source=instagram&utm_medium=cpc&utm_campaign=spike&utm_content=${creative}`,
    {
      headers: {
        // Instagram in-app WebView
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 ' +
          '(KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.25.90',
      },
      tags: { name: 'landing' },
    },
  );

  check(res, {
    'status 200': (r) => r.status === 200,
    'HTML keldi': (r) => String(r.body).includes('StarsPaymee'),
  });

  const cf = res.headers['Cf-Cache-Status'];
  if (cf === 'HIT') cacheHits.add(1);
  else if (cf) cacheMiss.add(1);

  sleep(Math.random() * 3 + 1);
}

export function beacon() {
  const sid = `k6-${__VU}-${__ITER}`;
  http.post(
    `${BASE}/api/e`,
    JSON.stringify({
      sid,
      events: [{ type: 'view' }, { type: 'scroll', scrollPct: 50 }],
      meta: {
        utmSource: 'instagram',
        utmContent: CREATIVES[__VU % CREATIVES.length],
        referrer: 'https://l.instagram.com/',
        ua: 'Mozilla/5.0 (iPhone) Instagram 330.0.0.25.90',
        page: '/',
      },
    }),
    { headers: { 'Content-Type': 'text/plain' }, tags: { name: 'collector' } },
  );
}

export function handleSummary(data) {
  const hits = data.metrics.cf_cache_hits?.values?.count ?? 0;
  const miss = data.metrics.cf_cache_misses?.values?.count ?? 0;
  const total = hits + miss;
  const pct = total ? ((hits / total) * 100).toFixed(1) : 'n/a';
  return {
    stdout: `\n  Cloudflare cache HIT: ${hits}/${total} (${pct}%)\n  Maqsad: >95% — aks holda Cache Rules'ni tekshiring.\n\n`,
  };
}
