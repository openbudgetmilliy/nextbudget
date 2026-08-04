# darslink.uz — Landing dizayni tahlili va qo'llanma

> Manba: `https://darslink.uz` sahifasining haqiqiy HTML va CSS bundle'i (`/_next/static/chunks/133dr_6rvx4yt.css`)
> tahlil qilingan — qiymatlar taxminiy emas, kodidan olingan.
> Maqsad: shu uslubni tushunish va kerak bo'lsa qayta qurish uchun to'liq retsept.

---

## 1. Bir jumlada: qanday dizayn?

**Neo-brutalist / Swiss-editorial landing.**

Ya'ni: **nol radius**, **qalin qora chegaralar**, **katta UPPERCASE display shrift**, **qattiq siljigan
soyalar** (blur yo'q), **gradient va yumshoq soyalar deyarli yo'q**, ranglar juda kam — oq fon,
qora matn va bitta **changli-ko'k** aksent.

Bu tasodifiy emas: ularning dark rejim CSS klassi tom ma'noda **`.dl-editorial-dark`** deb nomlangan —
mualliflar uslubni o'zlari "editorial" deb atashgan.

Texnik jihatdan: **Next.js (App Router) + Tailwind CSS v4**, shrift **Fontshare CDN**,
ikonkalar **lucide**, `uz` / `ru` ikki til, light/dark rejim.

---

## 2. Rang tizimi (aniq qiymatlar)

### 2.1. Light (`:root`)

| Token | Qiymat | Izoh |
|---|---|---|
| `--background` | `#ffffff` | toza oq |
| `--background-subtle` | `#f4f7fa` | bo'limlarni ajratish uchun sovuq och-kulrang |
| `--foreground` | `#14171b` | deyarli qora (sof `#000` emas) |
| `--muted` | `#eef2f4` | hover foni |
| `--muted-foreground` | `#5a636a` | ikkilamchi matn |
| `--card` | `#ffffff` | karta = fon bilan bir xil, faqat chegara ajratadi |
| `--border` | `#14171b` | **chegara = matn rangi!** |
| `--border-strong` | `#14171b` | asosiy struktura chiziqlari |
| `--border-soft` | `#e3e9ec` | ichki, ikkinchi darajali ajratgich |
| `--primary` | `#4f86c6` | **changli ko'k** — asosiy aksent |
| `--primary-foreground` | `#ffffff` | |
| `--primary-soft` | `#eaf2fb` | juda och ko'k fon |
| `--accent` | `#7ea2d4` | ochroq ko'k (nuqtalar, kichik belgilar) |
| `--highlight` | `#5b8ac4` | |
| `--ring` | `#7ea2d4` | fokus halqasi |
| `--radius` | **`0rem`** | **hamma joyda burchak yo'q** |
| gradient | `#7ea2d4 → #6b95cc → #5b8ac4` | juda kam ishlatiladi |

**Eng muhim qaror:** `--border` = `--foreground` = `#14171b`. Ya'ni chegara "ingichka kulrang chiziq"
emas, **matn bilan bir xil qora**. Butun uslub shundan kelib chiqadi.

### 2.2. Dark (`.dl-editorial-dark`)

| Token | Qiymat |
|---|---|
| `--background` | `#0d1014` |
| `--background-subtle` | `#12161c` |
| `--foreground` | `#e8edf2` |
| `--muted` | `#1a1f27` |
| `--muted-foreground` | `#9aa4af` |
| `--card` | `#14181f` |
| `--border` | `#2b333d` |
| `--border-strong` | `#39424e` |
| `--border-soft` | `#20262f` |
| `--primary` | `#5e93cf` (yorqinroq) |
| `--accent` | `#7ea2d4` |

E'tibor bering: dark'da chegara **yumshatilgan** (`#2b333d`) — light'dagidek maksimal kontrast emas,
aks holda ko'z charchaydi. Bu to'g'ri qaror.

`<meta name="theme-color">` ham ikki xil: light `#ffffff`, dark `#0a0915`.

### 2.3. Palitrani ishlatish qoidasi

- **90% sahifa** — oq fon + qora matn + qora chegara
- **Ko'k (`--primary`)** faqat: asosiy CTA tugmasi foni, raqamlar (`01 02 03`), belgilash ✓,
  hero-stiker, marquee lentasi, kichik kvadrat nuqtalar
- **`--background-subtle`** — qo'shni bo'limlarni ajratish uchun (oq → och kulrang → oq ritmi)
- Boshqa rang **yo'q**: yashil/qizil/sariq status ranglari umuman ishlatilmagan

---

## 3. Tipografiya

### 3.1. Shriftlar

| Vazifa | Shrift |
|---|---|
| Sarlavha / display | **Clash Display** (Fontshare CDN, og'irliklar 400/500/600/700) |
| Asosiy matn | tizim sans stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto...`) |

```html
<link rel="preconnect" href="https://api.fontshare.com">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap">
```

```css
.font-clash { font-family: "Clash Display", ui-sans-serif, system-ui, sans-serif; }
```

Clash Display — geometrik, keng, biroz "g'ayrioddiy" grotesk. Bepul (Fontshare). Alternativalar:
Space Grotesk, Archivo, Anton, Bricolage Grotesque.

### 3.2. Sarlavhalar

**H1 (hero) — sahifadagi eng kuchli element:**

```html
<h1 class="max-w-5xl text-[clamp(1.85rem,8.5vw,6.2rem)] font-black uppercase leading-[0.95] tracking-tight">
  <span class="block">Video kurslarni</span>
  <span class="block">tizimlashtirish</span>
</h1>
```

Uch qoida: **`clamp()` bilan suyuq o'lcham** (mobil 1.85rem → desktop 6.2rem), **`leading-[0.95]`**
(qatorlar bir-biriga yopishgan), **har bir so'z `block` bilan yangi qatorda**.

**H2 (bo'lim sarlavhalari):**
```
text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight lg:leading-[0.98]
```

**H3 (karta sarlavhasi):**
```
text-xl font-bold uppercase tracking-tight
```

### 3.3. Umumiy tipografik qoidalar

- **`uppercase` — 72 marta ishlatilgan.** Barcha sarlavha, tugma, nav, yorliq katta harfda.
- **`font-black` (900) — 55 marta**, `font-bold` (700) — 70 marta. Yupqa og'irlik yo'q.
- **`tracking-tight` (-0.025em)** sarlavhalarda — katta o'lchamda harflar yaqinlashadi.
- **`tracking-wide` / `tracking-[0.18em]`** kichik yorliqlarda — kichik o'lchamda harflar uzoqlashadi.
  (Klassik tipografik qoida: katta → tor, kichik → keng.)
- **`tabular-nums` — 30 marta.** Barcha raqam (narx, `01/02/03`, statistika) bir xil kenglikda.
- Asosiy matn: `text-lg sm:text-xl leading-relaxed` (hero paragrafi), oddiy joyda
  `text-sm leading-relaxed`.
- `text-pretty` / `text-balance` — sarlavha va paragraflarda qatorlar chiroyli bo'linishi uchun.

---

## 4. Struktura tizimi — "chegara = tarmoq"

Bu uslubning **yuragi**. Kartalar orasida bo'shliq (`gap`) yo'q — ular **umumiy chiziqlarni bo'lishadi**.

### 4.1. Umumiy chegarali grid

```html
<!-- Tashqi konteyner: chap va yuqori chiziq -->
<div class="grid border-l-2 border-t-2 border-border-strong sm:grid-cols-2 lg:grid-cols-3">
  <!-- Har bir katak: past va o'ng chiziq -->
  <article class="h-full border-b-2 border-r-2 border-border-strong p-7
                  transition-colors hover:bg-foreground hover:text-background">
    ...
  </article>
</div>
```

Natija: 3×3 to'r, chiziqlar ikki barobar qalinlashmaydi, hech qanday bo'shliq yo'q.
**`gap-*` ishlatilmaydi** — bu qoida.

### 4.2. Bo'lim ajratgichlari

Har bir `<section>` o'zi chegara bilan ajraladi:

```html
<section class="border-b-2 border-border-strong">          <!-- hero -->
<section class="border-t-2 border-foreground bg-background-subtle">
<section class="border-y-2 border-foreground bg-background-subtle py-20 sm:py-28">
<section id="pricing" class="scroll-mt-24 py-20 sm:py-28">
```

Ritm: **oq bo'lim → chiziq → och-kulrang bo'lim → chiziq → oq bo'lim**.

### 4.3. Ichki ajratgich

Yumshoq chiziq o'rniga **qalin plomba**:
```html
<div class="my-6 h-0.5 bg-foreground"></div>
```

### 4.4. Konteyner va bo'shliq

| Nima | Qiymat |
|---|---|
| Asosiy konteyner | `mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8` |
| Keng konteyner (hero, features) | `max-w-7xl` |
| Bo'lim vertikal bo'shliq | `py-20 sm:py-28` (asosiy ritm) yoki `py-16 sm:py-24` |
| Karta ichki padding | `p-7` yoki `p-8` |
| Header balandligi | `h-16` |

---

## 5. Chegara, soya va radius

### 5.1. Radius — nol, majburan

Global qoida sahifa o'ramida:
```html
<div class="bg-background [&_*]:rounded-none">
```

Ya'ni **ichidagi hamma narsaning radiusi 0 ga majburlanadi** — kutubxona komponentlari ham.
Plus `--radius: 0rem`.

### 5.2. Chegara qalinligi

- **`border-2`** (2px) — standart, 54 marta
- Rangi har doim `border-foreground` (67 marta) yoki `border-border-strong`
- `border-border-soft` — faqat ichki, ikkinchi darajali ajratgichlar (12 marta)

### 5.3. Qattiq siljigan soya (hard shadow)

Blur **umuman yo'q** — soya = qattiq qora nusxa:

```css
shadow-[5px_5px_0_0_var(--foreground)]
shadow-[6px_6px_0_0_var(--foreground)]
shadow-[8px_8px_0_0_var(--foreground)]
```

Yagona istisno — bitta yumshoq soya `shadow-[0_16px_28px_-16px_rgba(0,0,0,0.35)]` va
fokus uchun `0 0 5px #7ea2d499`.

---

## 6. Interaksiya — "inversiya"

Bu uslubning ikkinchi imzosi. Hover'da rang o'zgarmaydi — **fon va matn joyini almashadi**:

```
hover:bg-foreground hover:text-background
```

37 ta joyda ishlatilgan: feature kartalari, tugmalar, nav tugmalari, til almashtirgich, theme toggle.

**Aktiv holat** ham xuddi shunday: `bg-foreground text-background` (masalan `UZ`/`RU` almashtirgichda
aktiv til qora fonda oq matn).

O'tish: `transition-colors duration-150` (tugmalar) yoki `duration-300` (kartalar).

---

## 7. Komponent retseptlari

### 7.1. Tugma

```html
<a class="inline-flex items-center justify-center gap-2 font-bold rounded-none border-2
          border-border-strong bg-primary text-primary-foreground
          hover:bg-foreground hover:text-background
          transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          focus-visible:ring-offset-2 focus-visible:ring-offset-background
          disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap
          h-13 px-8 text-base py-3.5">
  Ariza qoldirish
  <svg class="lucide lucide-arrow-up-right size-4 animate-arrow-nudge">...</svg>
</a>
```

- Balandliklar: `h-11` (header), `h-13` (hero) — ya'ni **baland, katta tugmalar**
- Ikkilamchi tugma: `bg-card` yoki shaffof, lekin **bir xil qalin chegara**
- Hero'dagi ikki tugma **`gap-0` bilan yonma-yon** turadi — chegaralari qo'shilib bitta blok bo'ladi
- O'q ikonkasi `animate-arrow-nudge` bilan doimiy sekin tebranadi

### 7.2. "Eyebrow" yorlig'i (bo'lim ustidagi kichik yorliq)

```html
<span class="inline-flex items-center gap-2 border-2 border-foreground bg-card
             px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-foreground">
  <span class="size-1.5 bg-accent"></span>Narxlar
</span>
```

Nuqta **kvadrat** (`size-1.5 bg-accent`, `rounded-full` yo'q) — bu uslubda doira ishlatilmaydi.

### 7.3. Feature kartasi

```html
<article class="group h-full border-b-2 border-r-2 border-border-strong p-7
                transition-colors hover:bg-foreground hover:text-background">
  <div class="flex items-start justify-between">
    <span class="text-5xl font-black tabular-nums">01</span>
    <svg class="lucide size-14 opacity-35" stroke-width="1.75">...</svg>
  </div>
  <h3 class="mt-6 text-xl font-bold uppercase tracking-tight">Kurslar</h3>
  <p class="mt-2 text-sm leading-relaxed opacity-80">Kurs va darslaringizni joylang va boshqaring.</p>
</article>
```

Uch detal: **katta tartib raqami** chapda, **katta ochiq ikonka** o'ngda (`size-14 opacity-35`,
`stroke-width` ingichkalashtirilgan 1.75), matn `opacity-80` bilan yumshatilgan (kulrang rang o'rniga
shaffoflik — chunki hover'da fon o'zgaradi).

### 7.4. Hero stikeri

Sarlavha ichida burchak ostida joylashgan "yorliq":

```html
<span class="hero-sticker mt-5 inline-block -rotate-2 border-2 border-foreground bg-primary
             px-3 py-1.5 text-[0.44em] font-semibold normal-case leading-snug tracking-normal
             text-primary-foreground shadow-[6px_6px_0_0_var(--foreground)] sm:text-[0.34em]">
  va professional darajada boshqarish
</span>
```

- `-rotate-2` — biroz qiyshaytirilgan (qo'lda yopishtirilgan stiker effekti)
- `text-[0.44em]` — **em** birligi, ya'ni H1 o'lchamiga nisbatan avtomatik masshtablanadi
- `normal-case` — atrofdagi `uppercase` ni bekor qiladi

### 7.5. Marquee lentasi

```html
<div class="hero-marquee overflow-hidden border-y-2 border-border-strong bg-primary py-3
            text-primary-foreground opacity-50">
  <div class="flex w-max animate-marquee items-center gap-8 text-sm font-bold uppercase tracking-widest">
    <span class="flex items-center gap-8">Google'da topga chiqish <span class="text-primary-foreground/60">✸</span></span>
    ...
  </div>
</div>
```

```css
@keyframes marquee { 0% { transform: translate(0) } to { transform: translate(-50%) } }
.animate-marquee { animation: 28s linear infinite marquee; }
```

Ro'yxat **ikki marta takrorlanadi**, `-50%` ga suriladi — uzluksiz halqa.
Ajratgich sifatida `✸` belgisi.

### 7.6. Narx bo'limi

**Oylik/Yillik almashtirgich** (segmented):
```html
<div class="inline-flex border-2 border-foreground">
  <button class="px-6 py-2.5 text-sm font-bold uppercase tracking-wide bg-foreground text-background">Oylik</button>
  <button class="relative border-l-2 border-foreground px-6 py-2.5 ... hover:bg-muted">
    Yillik
    <span class="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-foreground bg-primary
                 px-1.5 py-0.5 text-[0.6rem] font-black uppercase text-primary-foreground">Chegirma</span>
  </button>
</div>
```

**Tarif kartalari** — tashqi ramka bitta, ichida uch ustun:
```html
<div class="mt-8 grid border-2 border-foreground lg:grid-cols-3">
  <article class="relative flex h-full flex-col bg-card p-8">
    <h3 class="text-2xl font-black uppercase tracking-tight">Minimal</h3>
    <p class="mt-1 text-sm text-muted-foreground">Yangi boshlovchi repetitorlar uchun</p>
    <div class="mt-6 flex items-end gap-1.5">
      <span class="text-4xl font-black tracking-tight tabular-nums">570 000</span>
      <span class="pb-1 text-sm text-muted-foreground">so'm / oy</span>
    </div>
    <div class="my-6 h-0.5 bg-foreground"></div>
    <ul class="flex-1 space-y-3">
      <li class="flex items-start gap-2.5 text-sm font-medium">
        <svg class="lucide lucide-check mt-0.5 size-4 shrink-0 text-primary" stroke-width="3">...</svg>
        <span>Cheksiz dars va modullar</span>
      </li>
    </ul>
  </article>
</div>
```

Detal: ✓ ikonkasi **`stroke-width="3"`** — qalinlashtirilgan, `text-primary` rangda.

### 7.7. FAQ akkordeon

```html
<div class="mx-auto mt-12 max-w-3xl border-2 border-foreground">
  <div>  <!-- keyingi elementlarda: class="border-t-2 border-foreground" -->
    <button aria-expanded="true" class="flex w-full items-center justify-between gap-4 px-5 py-5 text-left
                                        transition-colors hover:bg-muted sm:px-6">
      <span class="text-base font-bold uppercase tracking-tight sm:text-lg">Darslink nima?</span>
      <svg class="lucide-plus size-5 shrink-0 transition-transform duration-300 rotate-45 text-primary"
           stroke-width="2.5">...</svg>
    </button>
    <div class="grid transition-all duration-300 ease-out grid-rows-[1fr] opacity-100">
      <div class="overflow-hidden">
        <p class="border-t border-border-soft px-5 py-5 text-sm leading-relaxed text-muted-foreground sm:text-base">...</p>
      </div>
    </div>
  </div>
</div>
```

Ikki texnik nozik joy:
1. **`+` ikonkasi `rotate-45` bilan `×` ga aylanadi** — ikkita alohida ikonka emas.
2. Ochilish `grid-rows-[0fr]` → `grid-rows-[1fr]` orqali — **balandlikni JS bilan o'lchamasdan**
   silliq animatsiya (`max-height` hiylasidan yaxshiroq).

### 7.8. Header

```html
<header class="sticky top-0 z-50 border-b-2 border-foreground bg-background">
  <div class="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
    <a class="inline-flex items-center gap-2.5"> [logo] 
      <span class="text-lg font-black uppercase tracking-tight">Darslink</span>
    </a>
    <nav class="hidden items-center lg:flex">
      <a class="border-l-2 border-transparent px-4 py-2 text-sm font-bold uppercase tracking-wide
                text-foreground transition-colors hover:text-primary">Imkoniyatlar</a>
      ...
    </nav>
  </div>
</header>
```

- **Fon shaffof/blur emas** — qattiq `bg-background`, pastida 2px chiziq
- Nav havolalari orasida `border-l-2` — vertikal ajratgichlar
- Til almashtirgich va theme tugmasi: `border-2 border-foreground`, aktiv holat inversiya bilan

**Logotip** — CSS bilan yasalgan: uchta 45° burilgan kvadrat, `opacity` 0.2 / 0.5 / 1, gorizontal
siljitilgan (`left: 0 / 4.2px / 8.4px`) — "chuqurlik" illyuziyasi. Rasm fayli yo'q.

---

## 8. Animatsiyalar (to'liq ro'yxat)

```css
@keyframes fade-up      { 0% { opacity:0; transform: translateY(14px) } to { opacity:1; transform: translateY(0) } }
.animate-fade-up        { animation: .6s cubic-bezier(.22,1,.36,1) both fade-up; }

@keyframes page-in      { 0% { opacity:0; transform: translateY(22px) scale(.985) } to { opacity:1; ... } }
.animate-page-in        { animation: .5s cubic-bezier(.22,1,.36,1) page-in; }

@keyframes marquee      { 0% { transform: translate(0) } to { transform: translate(-50%) } }
.animate-marquee        { animation: 28s linear infinite marquee; }

@keyframes badge-pop    { 0% { opacity:0; transform: scale(.4) rotate(-8deg) }
                          60% { opacity:1; transform: scale(1.12) rotate(3deg) }
                          to { opacity:1; transform: scale(1) rotate(0) } }
.animate-badge-pop      { animation: .45s cubic-bezier(.34,1.56,.64,1) badge-pop; }  /* springy */

@keyframes arrow-nudge  { 0%,to { transform: translate(-1.5px,1.5px) } 50% { transform: translate(2px,-2px) } }
.animate-arrow-nudge    { animation: 1.15s ease-in-out infinite arrow-nudge; }

@keyframes border-glow-spin { to { --glow-angle: 360deg } }   /* conic-gradient aylanuvchi ramka */
@keyframes divider-shimmer  { ... }
```

Easing sifatida deyarli hamma joyda **`cubic-bezier(.22,1,.36,1)`** (ease-out-quint) ishlatiladi —
tez boshlanib, yumshoq to'xtaydi.

### Scroll-reveal (`reveal-item`)

```css
.reveal-item                    { opacity: 1 }                                    /* JS yo'q — ko'rinadi */
.js .reveal-item                { opacity: 0; filter: blur(6px); transition: opacity .5s, filter .5s }
.reveal-item[data-shown="1"]    { opacity: 1; filter: blur() }
@media (prefers-reduced-motion) { .reveal-item { opacity:1 !important; filter:none !important;
                                                 transition:none !important } }
```

Uch muhim detal:
1. **Progressive enhancement** — `.js` klassi bo'lmasa (JS o'chiq) hamma narsa ko'rinadi.
2. Faqat `opacity` emas, **`blur(6px)` ham** — "fokusga kelish" effekti.
3. **`prefers-reduced-motion`** hurmat qilinadi.
4. Kartalarga `style="transition-delay:60ms"` bilan **zinapoyasimon (stagger)** kechikish beriladi.

---

## 9. Sahifa strukturasi (bo'limlar tartibi)

| # | Bo'lim | Mazmuni |
|---|---|---|
| 0 | Header | logo · nav (Imkoniyatlar/Haqida/Narxlar/Aloqa/Blog) · UZ/RU · theme · CTA |
| 1 | Hero | `01 Joylang · 02 Boshqaring · 03 Soting` → ulkan H1 + stiker → paragraf + 2 CTA → statistika plitkalari |
| 2 | Marquee | ko'k lenta: "Google'da topga chiqish ✸ Telegram orqali kirish ✸ Video himoya ✸ Click/Payme/Uzum ✸ ..." |
| 3 | Features | "DARSLINK IMKONIYATLARI" — 3×3 chegarali to'r: Kurslar, To'lov tizimi, Sertifikatlar, Testlar, Chat, Xavfsizlik, SEO, Progress kuzatuvi, Shaxsiy domen |
| 4 | Nima uchun | "Video darslar uchun platforma" |
| 5 | How it works | "Ishga tushirish" — 4 qadam: Ariza qoldirasiz → Sozlaymiz → Ishga tushadi → Sotasiz |
| 6 | Pricing | "Mos tarifni tanlang" — Oylik/Yillik toggle + Minimal (570 000 so'm/oy) / Standart / Biznes |
| 7 | FAQ | "So'raladigan savollar" — 6 ta savol, chegarali akkordeon |
| 8 | CTA / Ariza | "Platformangizni ishga tushiring" — ism, telefon, markaz turi, izoh + Telegram bot |
| 9 | Footer | "Ta'lim biznesingizni biz bilan rivojlantiring!" + Mahsulot / Resurslar / Aloqa ustunlari |

**Copywriting uslubi:** buyruq maylida, qisqa, raqamlangan (`01/02/03`), va'da aniq
("Google'da topiling", "100% sizning brendingiz").

---

## 10. Kirish nuqtasi — bu uslubni qayta qurish uchun minimal to'plam

### 10.1. Tokenlar (`globals.css`)

```css
:root {
  --background: #fff;
  --background-subtle: #f4f7fa;
  --foreground: #14171b;
  --muted: #eef2f4;
  --muted-foreground: #5a636a;
  --card: #fff;
  --border: #14171b;
  --border-strong: #14171b;
  --border-soft: #e3e9ec;
  --primary: #4f86c6;
  --primary-foreground: #fff;
  --accent: #7ea2d4;
  --ring: #7ea2d4;
  --radius: 0rem;
}

html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}
```

### 10.2. Beshta qoida (buni buzsangiz uslub yo'qoladi)

1. **Radius = 0.** Hech qayerda `rounded-*` yo'q. Kerak bo'lsa o'ramga `[&_*]:rounded-none`.
2. **Chegara = matn rangi, 2px.** `border-2 border-foreground`. Kulrang ingichka chiziq yo'q.
3. **Bo'shliq emas, umumiy chiziq.** Gridda `gap-*` o'rniga
   `border-l-2 border-t-2` (tashqi) + `border-b-2 border-r-2` (katak).
4. **Soya blursiz.** `shadow-[6px_6px_0_0_var(--foreground)]`. `shadow-lg`, `blur`, gradient — yo'q.
5. **Hover = inversiya.** `hover:bg-foreground hover:text-background`, boshqa rang emas.

Va tipografiya bo'yicha: **display shrift + `uppercase` + `font-black` + `tracking-tight` +
`clamp()`** — bu to'rtlik bo'lmasa "brutalist" emas, shunchaki "chegarali" bo'lib qoladi.

---

## 11. OneRoom (bizning frontend) bilan solishtirma

| Jihat | **darslink.uz** | **OneRoom** ([frontend/uiskill.md](frontend/uiskill.md)) |
|---|---|---|
| Uslub nomi | Neo-brutalist / editorial | Glass Split (frosted glass) |
| Radius | **0** | `rounded-2xl` / `rounded-3xl` (16–24px) |
| Chegara | 2px, matn rangida (qora) | 1px, `border-white/60` (deyarli ko'rinmas) |
| Yuza | qattiq oq | yarim shaffof + `backdrop-blur(24px)` |
| Soya | qattiq siljigan (blursiz) | deyarli yo'q |
| Fon | tekis oq / `#f4f7fa` | `#eef2ff` + diagonal gradient |
| Aksent | changli ko'k `#4f86c6` | indigo `indigo-600` |
| Shrift | Clash Display (display) | Plus Jakarta Sans |
| Matn registri | `uppercase` hukmron | normal registr |
| Og'irlik | `font-black` (900) | `font-semibold` (600), raqamlarda `font-black` |
| Bo'shliq | yo'q — umumiy chiziqlar | `gap-3` / `gap-5` |
| Hover | to'liq inversiya | yumshoq `bg-white/60` |
| Ranglar soni | 2 ta (qora + ko'k) | ko'p (indigo, emerald, amber, red, purple...) |

Ikkisi **bir-biriga qarama-qarshi qutb**da. Bu yomon emas — birlashtirmaslik kerak.

### Amaliy tavsiya

- **OneRoom ilova ichi (dashboard)** — glass uslubda qolsin. Brutalizm zich ma'lumotli admin
  panelga yaramaydi: qattiq qora chiziqlar 20 qatorli jadvalda ko'zni charchatadi, `uppercase`
  esa o'qish tezligini pasaytiradi.
- **OneRoom landing** ([app/page.tsx](frontend/app/page.tsx)) — hozir "yumshoq SaaS" uslubida
  (blue/slate/shadow), ya'ni bozordagi minglab landing bilan bir xil. Agar ajralib turish kerak
  bo'lsa, **aynan shu sahifani** darslink uslubiga o'tkazish mantiqiy — landing esda qolishi kerak,
  panel esa qulay bo'lishi kerak.
- Ko'chirib olishga arzigulik aniq g'oyalar (uslubni to'liq o'zgartirmasdan ham):
  - `reveal-item` — blur + opacity + stagger scroll-reveal
  - `grid-rows-[0fr] → [1fr]` akkordeon (JS o'lchovsiz)
  - `clamp()` bilan suyuq hero sarlavhasi
  - `tabular-nums` barcha narx/raqamda
  - `prefers-reduced-motion` hurmati
  - CSS-only logotip (rasm fayli yo'q)
