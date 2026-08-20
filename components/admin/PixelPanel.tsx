'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Kadr pixellari paneli — har kadr uchun Meta Pixel ID va «Tekshirish».
 *
 * · Saqlash — o'sha /api/admin/settings PATCH'i (`pixel_p1`…`pixel_p8`).
 *   Saqlangach server hamma kadrni qayta build qiladi, pixel bir necha
 *   soniyada jonli sahifada yonadi.
 * · Tekshirish — /api/admin/pixel-check jonli sahifani ochib, HTML'da
 *   qaysi pixel muhrlanganini aytadi. Ya'ni bu «formada nima turibdi»
 *   emas, «sahifada hozir nima yonyapti» tekshiruvi.
 *
 * ID — 5–20 raqam; vergul bilan bir nechtasi ham bo'ladi (har reklama
 * akkauntiga o'z pixeli).
 */
type Page = { slug: string; name: string; path: string };
type Check = { kind: 'ok' | 'warn' | 'err'; text: string };

const VALID = /^\d{5,20}$/;

function parseIds(raw: string): string[] {
  return raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function PixelPanel({
  pages,
  values,
}: {
  pages: Page[];
  values: Record<string, string>;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState(values);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Check | null>(null);
  const [checks, setChecks] = useState<Record<string, Check>>({});
  const [checking, setChecking] = useState<string | null>(null);

  const dirty = Object.keys(draft).some((k) => (draft[k] ?? '') !== (values[k] ?? ''));

  function invalidOf(raw: string): string | null {
    const bad = parseIds(raw).find((id) => !VALID.test(id));
    return bad ?? null;
  }

  async function save() {
    // Formatni saqlashdan OLDIN ushlaymiz — serverga borib xato olish shart emas
    for (const p of pages) {
      const bad = invalidOf(draft[`pixel_${p.slug}`] ?? '');
      if (bad) {
        setMsg({ kind: 'err', text: `${p.name}: «${bad}» pixel ID emas (5–20 raqam bo’ladi)` });
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
        text: `Saqlandi — kadrlar qayta yig’ilmoqda, ~10 soniyadan so’ng «Tekshirish» bosing`,
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
      const res = await fetch(`/api/admin/pixel-check?slug=${p.slug}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const found: string[] = data.found ?? [];
      const want = parseIds(draft[`pixel_${p.slug}`] ?? '');
      const missing = want.filter((id) => !found.includes(id));

      let r: Check;
      if (!want.length) {
        r = found.length
          ? { kind: 'warn', text: `Formada bo’sh, sahifada esa yonib turibdi: ${found.join(', ')}` }
          : { kind: 'ok', text: 'Pixel ulanmagan — sahifa toza' };
      } else if (!missing.length) {
        r = { kind: 'ok', text: `Sahifada yonib turibdi ✓ (${found.join(', ')})` };
      } else if (dirty) {
        r = { kind: 'warn', text: `Avval «Saqlash»ni bosing — sahifada hozircha: ${found.join(', ') || 'yo’q'}` };
      } else {
        r = { kind: 'warn', text: `Saqlangan, sahifa hali yangilanmagan (${missing.join(', ')} kutilmoqda) — 10 soniyadan so’ng qayta tekshiring` };
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
        <span>Kadr pixellari — har sahifaga alohida Meta Pixel</span>
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
            const k = `pixel_${p.slug}`;
            const c = checks[p.slug];
            const bad = invalidOf(draft[k] ?? '');
            return (
              <div key={p.slug}>
                <label className="a-lbl" htmlFor={k}>
                  {p.name} <code style={{ color: '#3f4a5c' }}>{p.path}</code>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id={k}
                    className="a-in"
                    style={{ flex: 1 }}
                    placeholder="Pixel ID — masalan 1035708499080847"
                    inputMode="numeric"
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
                {bad && (
                  <div style={{ fontSize: 12.5, marginTop: 5, color: color.err }}>
                    «{bad}» pixel ID emas — 5–20 ta raqam bo’ladi
                  </div>
                )}
                {c && !bad && (
                  <div style={{ fontSize: 12.5, marginTop: 5, color: color[c.kind] }}>{c.text}</div>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12.5, color: '#59637a', marginTop: 16, lineHeight: 1.6 }}>
          Har reklama akkauntining o’z pixeli bor — akkaunt qaysi kadrga target qilsa, pixelini
          o’sha kadrga yozing. Bir kadrga bir nechta pixel kerak bo’lsa vergul bilan yozing.
          Saqlangach sahifalar ~10 soniyada qayta yig’iladi — keyin «Tekshirish» jonli sahifani
          ochib, pixel haqiqatan yonayotganini ko’rsatadi. PageView avtomatik, tugma bosilganda
          Lead ham shu pixelga tushadi.
        </p>
      </div>
    </div>
  );
}
