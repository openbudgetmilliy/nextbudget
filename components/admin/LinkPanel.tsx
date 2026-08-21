'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Kadr havolalari paneli — har kadr uchun «tugma bosilganda qayerga ketadi».
 *
 * · Bo'sh maydon — kadr umumiy `bot_username` sozlamasiga boradi (odatdagi
 *   holat). Ya'ni bu panel hech narsani buzmaydi: to'ldirilmasa hozirgidek
 *   ishlaydi.
 * · To'ldirilsa — FAQAT o'sha kadr boshqa manzilga ketadi. Boshqa reklama
 *   akkaunti boshqa botga yursin desangiz yoki bitta kadrni kanalga /
 *   tashqi saytga burmoqchi bo'lsangiz shu yerda yoziladi.
 * · Saqlash — o'sha /api/admin/settings PATCH'i (`link_p1`…`link_p10`),
 *   saqlangach hamma kadr qayta build bo'ladi.
 * · Tekshirish — /api/admin/link-check jonli sahifani ochib, tugmaning
 *   HAQIQIY manzilini aytadi. Ya'ni «formada nima yozilgan» emas,
 *   «sahifada hozir qayerga olib boryapti» tekshiruvi.
 *
 * Qabul qilinadigan ko'rinishlar — server tomonda `lib/tg.ts` → `ctaLink`.
 * Bu yerdagi regexplar o'sha qoidaning ko'zga ko'rinadigan qismi, xolos:
 * xatoni serverga bormasdan aytish uchun. Yakuniy qaror doim serverda.
 */
type Page = { slug: string; name: string; path: string };
type Check = { kind: 'ok' | 'warn' | 'err'; text: string };

/** To'liq havola: `https://…` */
const OK_URL = /^https?:\/\//i;
/** Sxemasiz telegram havolasi: `t.me/Bot` */
const OK_TME = /^(?:t(?:elegram)?\.me|telegram\.dog)\//i;
/** Bot nomi: `@Bot` yoki `Bot` — Telegram qoidasi bo'yicha 5–32 belgi */
const OK_NAME = /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

function invalidOf(raw: string): boolean {
  const v = raw.trim();
  if (!v) return false;
  return !(OK_URL.test(v) || OK_TME.test(v) || OK_NAME.test(v));
}

export default function LinkPanel({
  pages,
  values,
  effective,
}: {
  pages: Page[];
  /** `link_<slug>` — formadagi xom qiymatlar */
  values: Record<string, string>;
  /** `slug` → hozir SAQLANGAN holatga ko'ra tugma ochadigan manzil */
  effective: Record<string, string>;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState(values);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Check | null>(null);
  const [checks, setChecks] = useState<Record<string, Check>>({});
  const [checking, setChecking] = useState<string | null>(null);

  const dirty = Object.keys(draft).some((k) => (draft[k] ?? '') !== (values[k] ?? ''));

  async function save() {
    // Formatni saqlashdan OLDIN ushlaymiz — noto'g'ri qiymat jim yutilib,
    // kadr eski manzilda qolib ketishi eng yomon natija bo'lardi
    for (const p of pages) {
      if (invalidOf(draft[`link_${p.slug}`] ?? '')) {
        setMsg({
          kind: 'err',
          text: `${p.name}: havola tushunarsiz — to’liq https havola yoki bot nomi bo’lishi kerak`,
        });
        return;
      }
    }
    setBusy(true);
    setMsg(null);
    try {
      const changed = Object.fromEntries(
        Object.entries(draft).filter(([k, v]) => (v ?? '') !== (values[k] ?? '')),
      );
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changed),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setMsg({
        kind: 'ok',
        text: 'Saqlandi — kadrlar qayta yig’ilmoqda, ~10 soniyadan so’ng «Tekshirish» bosing',
      });
      setChecks({});
      startTransition(() => router.refresh());
    } catch (err) {
      setMsg({ kind: 'err', text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function check(p: Page) {
    setChecking(p.slug);
    setChecks((c) => ({ ...c, [p.slug]: { kind: 'warn', text: 'Tekshirilmoqda…' } }));
    try {
      const res = await fetch(`/api/admin/link-check?slug=${p.slug}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const found: string[] = data.found ?? [];
      const want = effective[p.slug] ?? '';

      let r: Check;
      if (!found.length) {
        r = { kind: 'err', text: 'Sahifada CTA tugmasi topilmadi' };
      } else if (want && found.every((h) => h === want)) {
        r = { kind: 'ok', text: `Sahifada: ${found[0]} ✓` };
      } else if (dirty) {
        r = { kind: 'warn', text: `Avval «Saqlash»ni bosing — sahifada hozir: ${found.join(', ')}` };
      } else {
        r = {
          kind: 'warn',
          text: `Sahifa hali yangilanmagan — hozir: ${found.join(', ')} · 10 soniyadan so’ng qayta tekshiring`,
        };
      }
      setChecks((c) => ({ ...c, [p.slug]: r }));
    } catch (err) {
      setChecks((c) => ({ ...c, [p.slug]: { kind: 'err', text: (err as Error).message } }));
    } finally {
      setChecking(null);
    }
  }

  const color = { ok: '#34d399', warn: '#fbbf24', err: '#f87171' } as const;

  return (
    <div className="a-panel" style={{ marginTop: 18 }}>
      <div className="a-panel-h">
        <span>Kadr havolalari — har sahifa tugmasi uchun alohida manzil</span>
        <button className="a-btn p sm" disabled={!dirty || busy} onClick={save}>
          {busy ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>
      <div className="a-panel-b">
        {msg && (
          <div className={msg.kind === 'err' ? 'a-err' : 'a-ok'} style={{ marginBottom: 14 }}>
            {msg.text}
          </div>
        )}

        <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
          {pages.map((p) => {
            const k = `link_${p.slug}`;
            const c = checks[p.slug];
            const bad = invalidOf(draft[k] ?? '');
            const own = (draft[k] ?? '').trim().length > 0;
            return (
              <div key={p.slug}>
                <label className="a-lbl" htmlFor={k}>
                  {p.name} <code style={{ color: '#3f4a5c' }}>{p.path}</code>
                  {own && (
                    <span style={{ color: '#34d399', fontWeight: 600 }}> · o’z havolasi</span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id={k}
                    className="a-in"
                    style={{ flex: 1 }}
                    placeholder="Bo’sh qoldirilsa — umumiy bot havolasiga boradi"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    value={draft[k] ?? ''}
                    disabled={busy}
                    onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                  />
                  <button
                    className="a-btn sm"
                    onClick={() => check(p)}
                    disabled={busy || checking === p.slug}
                  >
                    {checking === p.slug ? '…' : 'Tekshirish'}
                  </button>
                </div>

                {bad ? (
                  <div style={{ fontSize: 12.5, marginTop: 5, color: color.err }}>
                    Havola tushunarsiz — <code>https://…</code> ko’rinishida yoki bot nomi
                    (<code>@Bot</code>) bo’lishi kerak
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 12.5,
                      marginTop: 5,
                      color: '#59637a',
                      wordBreak: 'break-all',
                    }}
                  >
                    Hozir: <code>{effective[p.slug] ?? '—'}</code>
                  </div>
                )}

                {c && !bad && (
                  <div style={{ fontSize: 12.5, marginTop: 4, color: color[c.kind] }}>{c.text}</div>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12.5, color: '#59637a', marginTop: 16, lineHeight: 1.6 }}>
          <b style={{ color: '#c7d0de' }}>Bo’sh qoldiring</b> — kadr yuqoridagi umumiy bot
          havolasiga boradi. Hozirgi ish tartibi shu, hech narsa o’zgarmaydi.
          <br />
          <b style={{ color: '#c7d0de' }}>Bot nomi yozsangiz</b> (<code>@BoshqaBot</code> yoki
          <code> https://t.me/BoshqaBot</code>) — o’sha kadr boshqa botga ketadi, kadr belgisi
          (<code>{pages[0]?.slug ?? 'p1'}</code>…) va trafik manbasi odatdagidek{' '}
          <code>?start=</code> ga yopishadi.
          <br />
          <b style={{ color: '#c7d0de' }}>Qat’iy kod kerak bo’lsa</b> —{' '}
          <code>https://t.me/Bot?start=abu1</code> yozing: shu kadr aynan o’sha kod bilan botga
          boradi, ustiga hech narsa qo’shilmaydi.
          <br />
          <b style={{ color: '#c7d0de' }}>Boshqa manzil</b> (kanal, tashqi sayt) — to’liq{' '}
          <code>https://…</code> yozing. Bunda UTM yopishtirilmaydi: u Telegram <code>start</code>{' '}
          kodi, begona manzilga tegishi noto’g’ri bo’lardi.
          <br />
          <br />
          Tugma bosilishi statistikasi (<a href="/admin/analytics">Analitika</a>) manzildan
          QAT’IY NAZAR sanaladi — u sahifadagi bosishga qarab yoziladi, shuning uchun kadr qayerga
          ketishidan qat’i nazar to’liq ishlaydi.
        </p>
      </div>
    </div>
  );
}
