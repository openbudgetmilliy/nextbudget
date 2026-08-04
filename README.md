# StarsPaymee landing

Instagram target'dan keladigan katta trafikni ushlab, konversiyani Telegram botga
yo'naltiruvchi landing + admin panel + analitika.

**Stack:** Next.js 15 (App Router) · Prisma · PostgreSQL · Redis · Nginx · PM2 · Cloudflare

---

## Asosiy printsip

```
Foydalanuvchi → Cloudflare edge → tayyor HTML          (origin'ga tegmaydi)
Admin narx o'zgartiradi → Postgres → revalidate → CF purge
Analitika → Redis bufer → 10 sekundda batch → Postgres
```

Cho'qqi paytida Postgres va Prisma **ishtirok etmaydi**. Origin'ga tushadigan
yagona issiq yo'l — `POST /api/e`, u faqat Redis'ga fire-and-forget yozadi.

---

## Tez boshlash (lokal)

```bash
cp .env.example .env          # qiymatlarni to'ldiring
docker compose up -d          # postgres + pgbouncer + redis
npx prisma migrate dev --name init
npm run db:seed               # narxlar + sozlamalar + admin (parol konsolda chiqadi)
npm run dev                   # http://localhost:3000
npm run worker:dev            # boshqa terminalda — Redis → Postgres
```

`docker compose` uchun `PG_PASS` kerak:

```bash
echo 'PG_PASS=kuchli-parol' > .env.docker && docker compose --env-file .env.docker up -d
```

---

## Struktura

```
app/
  page.tsx                    kirish darvozasi (Turnstile) — SSG, edge'da cache'lanadi
  l/page.tsx                  SSG landing — build paytida render bo'ladi
  layout.tsx                  metadata, preconnect, shrift o'zgaruvchilari
  fonts.ts                    next/font — build paytida yuklanadi, o'z domenimizdan
  globals.css                 neo-brutalist dizayn tizimi (rasm yo‘q)
  api/
    gate/route.ts             Turnstile tekshiruvi → `gt` cookie
    e/route.ts                analitika collector — eng issiq yo'l
    health/route.ts           uptime monitoring
    lead/route.ts             forma (ixtiyoriy)
    admin/{login,logout,prices,settings,stats}/
  admin/
    admin.css                 admin CSS (landing bundle'iga tushmaydi)
    login/page.tsx            guard'siz
    (dash)/                   auth guard + chrome shu route group'da
      page.tsx                dashboard
      prices/page.tsx         narx boshqaruvi
      analytics/page.tsx      kreativlar CR, tugmalar, voronka
      sessions/page.tsx       sessiya timeline
      settings/page.tsx       matnlar
components/                   landing (hammasi server component)
  Intro.tsx                   tanishtiruv banneri — sahifaning birinchi bandi
  Marquee.tsx                 ko'k lenta (sof CSS animatsiya)
  Gate.tsx                    darvoza client component (faqat `/` da)
  Tracker.tsx                 landing'dagi YAGONA client component
components/admin/             admin client component'lari
lib/
  track.ts                    client SDK (~2 KB)
  ua.ts                       UA parser (in-app WebView aniqlash bilan)
  stats.ts                    analitika SQL so'rovlari
  cf.ts                       revalidate + Cloudflare purge
  turnstile.ts                siteverify chaqiruvi
  jwt.ts                      admin (`adm`) va darvoza (`gt`) tokenlari
  data.ts                     SSG uchun narx/sozlama o'qish (zaxira bilan)
  content.ts                  matnlar + FALLBACK_PRICES
worker/flush.ts               Redis → Postgres batch
nginx/                        conf.d va sites-available fayllari
k6/spike.js                   cho'qqi testi
```

---

## Dizayn tizimi — neo-brutalist / Swiss-editorial

Manba: [darslink-dizayn.md](darslink-dizayn.md). Landing va darvoza shu tilda;
admin panel esa [uiskill.md](uiskill.md) dagi «Glass Split» uslubida qoladi —
ikkalasi qarama-qarshi qutb, **aralashtirilmaydi**. Sabab hujjatning o'zida:
landing esda qolishi kerak, panel qulay bo'lishi kerak.

**Beshta qoida** (buzilsa uslub yo'qoladi):

1. **Radius = 0.** Global `*{border-radius:0}` — kutubxona komponentlari ham.
2. **Chegara = matn rangi, 2px** (`--bw`, `--line`). Kulrang ingichka chiziq yo'q.
3. **Bo'shliq emas, umumiy chiziq.** `.grid-lines` — `gap: 2px` + fon rangi
   chiziqqa aylanadi. Klassik `border-r/border-b` usulidan farqli: element soni
   ustunlarga bo'linmasa ham oxirgi qator ochiq qolmaydi.
4. **Soya blursiz:** `6px 6px 0 0 var(--fg)`.
5. **Hover = inversiya:** fon va matn joyini almashadi, boshqa rang emas.

**Ranglar** — qo'llanmadagi aniq qiymatlar, ikki rejim
(`prefers-color-scheme`, almashtirgich yo'q):

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#ffffff` | `#0d1014` |
| `--bg-sub` | `#f4f7fa` | `#12161c` |
| `--fg` | `#14171b` | `#e8edf2` |
| `--line` | `#14171b` | `#39424e` (yumshatilgan) |
| `--primary` | `#4f86c6` | `#5e93cf` |
| `--accent` | `#7ea2d4` | `#7ea2d4` |

90% sahifa — fon + matn + chegara. Ko'k faqat: asosiy CTA, raqamlar
(`01 02 03`), stiker, marquee lentasi, `+` belgisi. Yashil/qizil/sariq status
ranglari umuman yo'q.

**Tipografika:** display + `uppercase` + 900 og'irlik + `tracking-tight` +
`clamp()`. Bu to'rtlik bo'lmasa uslub «brutalist» emas, shunchaki «chegarali».

| Rol | Shrift |
|---|---|
| display | **Archivo** (`next/font`, o'z domenimizdan) |
| matn | tizim sans stack — yuklab olinadigan fayl yo'q |
| raqamlar | `.tnum` → `font-variant-numeric: tabular-nums` |

⚠ Qo'llanmada **Clash Display** (Fontshare CDN) ko'rsatilgan. Olinmadi: u ish
vaqtida uchinchi domenga so'rov qiladi va loyihaning «tashqi shrift yo'q»
printsipini buzadi. Archivo — qo'llanmaning **o'z muqobillari ro'yxatidan**
(Space Grotesk / Archivo / Anton / Bricolage Grotesque) va 900 og'irligi bor.
Public Sans va IBM Plex Mono olib tashlandi — shriftlar 236 KB → **84 KB**.

**Sahifa ritmi:** `.sec-line` (2px ajratgich) + `.sec-sub` (och fon) ketma-ket
almashadi: oq → chiziq → och → chiziq → oq.

**Marquee** — `components/Marquee.tsx`, ro'yxat ikki marta takrorlanib `-50%`
ga suriladi. Sof CSS, `prefers-reduced-motion` global qoida orqali to'xtaydi.

**Landing'da hamon bitta client component** (`Tracker`) — barcha animatsiya
va akkordeon (`<details>`) CSS bilan.

---

## Kirish darvozasi (Cloudflare Turnstile)

Sayt ochilganda birinchi `/` — darvoza sahifasi: markazda o'chiq "Kirish"
tugmasi, ostida Turnstile katakchasi. Captcha o'tgach tugma yonadi, bosilganda
landing (`/l`) ochiladi.

```
/  (SSG, edge cache)        →  Turnstile yechiladi
   POST /api/gate           →  Cloudflare siteverify
                            →  gt     (HttpOnly, imzolangan, 12 soat)  ← haqiqiy ruxsat
                            →  gt_ok  (oddiy belgi, faqat UX uchun)
/l (SSG, no-store)          →  middleware `gt` ni tekshiradi, aks holda `/` ga qaytaradi
```

Tugmani DevTools'da yoqib qo'yish yordam bermaydi: `/l` ga har so'rovda
middleware `gt` imzosini qayta tekshiradi va u CDN'da cache'lanmaydi.

**Sozlash** — `dash.cloudflare.com → Turnstile → Add widget`
(Mode: **Managed**, Domains: `milliyjamoasimiz.uz`, lokal uchun `localhost`):

```env
GATE_ENABLED="1"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAA…"
TURNSTILE_SECRET_KEY="0x4AAA…"
```

Narxi — **0 so'm**: Turnstile tekin rejada oyiga 1 mln siteverify va 10 tagacha
widget beradi, karta talab qilinmaydi.

**Kalitlarni tekshirish:** `npm run gate:check`. Skript siteverify'ga atayin
soxta token yuboradi va javob turiga qaraydi — `invalid-input-secret` bo'lsa
secret noto'g'ri, `invalid-input-response` bo'lsa secret to'g'ri. Ya'ni
brauzersiz, deploy'gacha tekshirib olish mumkin.

**O'chirish:** `GATE_ENABLED="0"` + `npm run build`. Rebuild shart — `/` statik
sahifa, darvoza holati build paytida HTML'ga yoziladi. Shundan keyin `/` tugmasi
darrov yonadi va middleware `/l` ni to'smaydi.

**Nimasi hisobiga:**

| | |
|---|---|
| SEO | `/l` `noindex`. Qidiruvda faqat `/` (Organization schema) qoladi — landing matni, FAQ/Product schema indekslanmaydi. Organik trafik kerak bo'lsa darvozani o'chiring. |
| Origin yuki | `/l` CDN'da cache'lanmaydi, har ochilish Node'ga tushadi. Lekin sahifa oldindan render qilingan — Node uni diskdan beradi, DB'ga bormaydi. `/_next/static/*` esa avvalgidek edge'dan. |
| Konversiya | Yo'lga bitta qadam qo'shiladi. Managed rejada ko'pchilikka bir marta bosish yetadi. |

---

## Trafik uchun qilingan qarorlar

| Qaror | Nima uchun |
|---|---|
| `/` va `/l` — `force-static` + `revalidate = 3600` | Har so'rov render'ga tushmaydi. `cookies()`/`headers()` tasodifan qo'shilsa ham sahifalar statik qoladi. |
| Landing'da **1 ta** client component | Barcha CTA — server-rendered `<a data-t>`. Bitta delegation listener hammasini ushlaydi. |
| `cacheMaxMemorySize: 0` | PM2 cluster'da 2 instance. In-memory ISR keshi bo'lsa `revalidatePath` faqat bittasiga ta'sir qilardi va ikkinchisi eski narxni ko'rsatardi. |
| Shrift yuklanmaydi (system stack) | ~30 KB yo'q, `font-display: swap` sakrashi yo'q. WebView'da LCP shu bilan yaxshilanadi. |
| Rasm yo'q — CSS gradient + inline SVG | HTML'da `<img>` nol. Hero uchun tarmoq so'rovi kerak emas. |
| Tab'lar radio+CSS, FAQ `<details>` | Interaktivlik JS'siz ishlaydi — WebView'da darhol. |
| `content-visibility: auto` (pastdagi bo'limlar) | Birinchi paint faqat hero'ni render qiladi. |
| `compress: false` (Next) | Siqishni nginx (gzip) va CF (brotli) qiladi, Node CPU bo'sh qoladi. |
| `/api/e` da `await` yo'q | Redis'ga yozish event loop'ni bloklamaydi; Redis o'lsa ham 204 qaytadi. |
| `/api/e` limiti 300r/m | O'zbekiston mobil operatorlari CGNAT ishlatadi — minglab abonent bitta IP'da. 30r/m bo'lsa haqiqiy foydalanuvchilar bloklanardi. |

### Haqiqiy o'lchov (build natijasi)

```
Route (app)                     Size  First Load JS  Revalidate
┌ ○ /                        1.51 kB         104 kB          1h
```

`○ (Static)` — spec'ning majburiy sharti bajarilgan.

Foydalanuvchi 4G'da nima yuklaydi (gzip):

| | gzip |
|---|---|
| HTML (SSG, RSC payload bilan) | 9.8 KB |
| CSS (yagona render-blocking so'rov) | 3.6 KB |
| **LCP yo'li — jami** | **13.4 KB, 1 blocking so'rov** |
| JS (`async`, LCP'ni bloklamaydi) | 104 KB |
| polyfills | 0 — `noModule`, zamonaviy brauzer o'tkazib yuboradi |
| Shrift / rasm | 0 |

> **Spec'dagi "bundle 100 KB dan oshmasin" haqida:** 104 KB — bu React 19 +
> App Router'ning **poli**, mening kodim emas (route'ning o'z hissasi 1.51 KB).
> Nolga tushirishning yagona yo'li — React hydration'dan butunlay voz kechish,
> ya'ni Next'ni tashlash. LCP'ga ta'sir qiladigan yo'l esa 13.4 KB va u
> odatdagi landing'lardan ancha yengil.

---

## Deploy

```bash
# 1. DB qatlami
docker compose --env-file .env.docker up -d

# 2. Nginx
sudo cp nginx/00-cloudflare-realip.conf nginx/01-shared.conf /etc/nginx/conf.d/
sudo cp nginx/starspaymee.conf /etc/nginx/sites-available/starspaymee
sudo ln -sf /etc/nginx/sites-available/starspaymee /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 3. Ilova
chmod +x deploy.sh && ./deploy.sh

# 4. PM2 doimiy
pm2 start ecosystem.config.js
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
pm2 save && pm2 startup
```

`deploy.sh` build'dan keyin `.next/server/app/index.html` borligini tekshiradi —
yo'q bo'lsa deploy **to'xtaydi**, chunki bu `/` statik render bo'lmaganini
bildiradi va cho'qqida server yiqilishiga olib keladi.

### Cloudflare

- **DNS:** A → droplet IP, proxy **YOQILGAN**
- **SSL/TLS:** Full (strict) + Origin Certificate (15 yil)
- **Cache Rules:**
  | Shart | Sozlama |
  |---|---|
  | `uri.path eq "/l"` | **Bypass cache** — darvoza ortidagi sahifa |
  | `not starts_with(uri.path,"/api")` va `not starts_with(uri.path,"/admin")` | Eligible for cache · Edge TTL: **respect origin** |
  | `starts_with(uri.path,"/_next/static")` | Edge TTL 1 yil |
  | `/api` yoki `/admin` | Bypass cache |

  > `/l` uchun alohida qoida majburiy emas (origin `no-store` yuboradi va
  > "respect origin" shuni hurmat qiladi), lekin **zaxira sifatida qo'ying**:
  > kimdir Edge TTL'ni "Override origin"ga o'zgartirsa `/l` edge'da
  > cache'lanib qoladi va darvoza umuman chetlab o'tiladi.
- **Security:** Bot Fight Mode ON · Security Level Medium · `/api/e` 60 req/min/IP ·
  `/admin*` WAF (faqat sizning IP yoki Cloudflare Access)
- **Speed:** Brotli ON · Early Hints ON

### Origin IP'ni yopish

```bash
sudo ufw default deny incoming
sudo ufw allow 22/tcp
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  sudo ufw allow from $ip to any port 80,443 proto tcp
done
sudo ufw enable
```

---

## Analitika

**Client** (`lib/track.ts`) — avtomatik: `view`, `scroll` (25/50/75/100%),
`exit` (+ `dwellMs`). CTA/klik — `data-t` atributi orqali delegation bilan.

```tsx
<a href={tg} data-t="cta" data-t-id="hero_cta" data-tg>Botga o'tish</a>
```

- `data-t` — event turi (`cta` | `click`)
- `data-t-id` — admin panelda ko'rinadigan identifikator
- `data-tg` — Telegram havolasiga UTM manbasini qo'shadi:
  `?start=p_stars_250` → `?start=p_stars_250-instagram-reel_01`

**Server:** `POST /api/e` → Redis list → worker 10 s da bir batch → Postgres.

### UTM majburiy

```
https://starspaymee.uz/?utm_source=instagram&utm_medium=cpc&utm_campaign=jan&utm_content=reel_01
```

`utm_content` — har kreativga alohida. Busiz qaysi reklama ishlayotgani bilinmaydi.

---

## Worker: spec'dan farqi

Spec'dagi `worker/flush.ts` uchta joyda ma'lumot buzardi. Tuzatilgan:

1. **`converted` yangilanmasligi.** `createMany({ skipDuplicates: true })` mavjud
   sessiyaga hech narsa yozmaydi. CTA keyingi batch'da kelsa `converted` bazada
   `false` bo'lib qolardi — konversiya statistikasi past ko'rinardi.
   → sessiyalardan keyin alohida `updateMany`.
2. **Ma'lumot yo'qolishi.** `LPOP` elementni o'chiradi. Postgres o'sha payt
   javob bermasa batch butunlay yo'qolardi. → xatoda `LPUSH` bilan navbat
   boshiga qaytariladi.
3. **Navbat cheksiz o'sishi.** Worker o'lsa Redis 256 MB limitiga urilib,
   `allkeys-lru` butun navbatni evict qilishi mumkin edi. → har tickda `LTRIM`,
   maksimum 100k element.

Qo'shimcha: bir vaqtda ikki tick ishlamasligi, buzuq payload'lar uchun
`sp:ev:dead` navbati, SIGTERM'da joriy batch'ni tugatib chiqish, `elText`/UTM
uzunligini cheklash (abuse), event turlarini whitelist bilan filtrlash.

---

## Launch checklist

**Majburiy**
- [ ] `npm run build` → `/` yonida `○ (Static)`
- [ ] `curl -I https://starspaymee.uz` → `cf-cache-status: HIT`
- [ ] `ufw status` → 80/443 faqat CF IP'laridan
- [ ] Eski DNS tarixi tekshirilgan (securitytrails), kerak bo'lsa IP almashtirilgan
- [ ] `DATABASE_URL` da `connection_limit=5&pgbouncer=true`
- [ ] `JWT_SECRET` — `openssl rand -base64 48`
- [ ] Swap 2 GB yoqilgan
- [ ] `pm2-logrotate` o'rnatilgan
- [ ] Admin parol kuchli, `/admin` WAF bilan himoyalangan
- [ ] `.env` dan `ADMIN_PASS` o'chirilgan

**Tavsiya**
- [ ] `npx lighthouse https://starspaymee.uz --preset=mobile` → LCP < 2.5 s
- [ ] Har kreativga alohida `utm_content`
- [ ] `pg_dump` + cron + tashqi joyga backup
- [ ] Uptime Kuma / UptimeRobot → `/api/health`
- [ ] Sentry
- [ ] `k6 run k6/spike.js`

---

## Kutilayotgan resurs sarfi (4 GB droplet)

| Xizmat | RAM |
|---|---|
| sp-web (2 instance) | ~400 MB |
| sp-worker | ~120 MB |
| brand-b-web (2 instance) | ~400 MB |
| brand-b-worker | ~120 MB |
| PostgreSQL | ~350 MB |
| Redis | ~100 MB |
| PgBouncer + Nginx | ~70 MB |
| Ubuntu | ~400 MB |
| **Jami** | **~1.96 GB / 4 GB** |

100k/kun cho'qqida (20 daqiqada 70%): trafikning ~97% Cloudflare edge'dan,
origin'ga faqat `/api/e` tushadi — ~60 req/s.

---

## Skriptlar

| | |
|---|---|
| `npm run dev` | ishlab chiqish serveri |
| `npm run build` | production build (statiklikni tekshiradi) |
| `npm run build:worker` | worker'ni JS'ga kompilyatsiya |
| `npm run worker:dev` | worker'ni `tsx` bilan ishga tushirish |
| `npm run db:seed` | narxlar, sozlamalar, admin |
| `npm run typecheck` | `tsc --noEmit` |

## Brand B

Xuddi shu kodni `/var/www/brand-b/` ga klonlang, `.env` da o'zgartiring:

```bash
PORT=3001
REDIS_KEY_PREFIX="bb"        # navbatlar aralashmasligi uchun MUHIM
SITE_URL="https://brand-b.uz"
NEXT_PUBLIC_BOT="BrandBBot"
DATABASE_URL="...brand_b?connection_limit=5&pgbouncer=true"
```

`lib/content.ts` (matnlar) va `app/globals.css` (`:root` ranglari) — brendga
moslash uchun tegiladigan yagona ikki fayl.
