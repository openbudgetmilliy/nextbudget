'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Bu ikki maydon YETTALA kadrga birdek tegadi — shuning uchun yorliqda ham
 * shu aytilgan. Ilgari `/6` va `/7` da narx kodda qotib turgan edi.
 */
const LABELS: Record<string, string> = {
  bot_username: 'Bot havolasi yoki username — 7 ta sahifada ham o‘zgaradi',
  price_one_vote: '1 ovoz narxi — 7 ta sahifada ham o‘zgaradi ({narx})',
  hero_badge: 'Yuqori yozuv (sarlavha ustida)',
  hero_title: 'Sarlavha',
  hero_sub: 'Tavsif (sarlavha ostida)',
  cta_primary: 'Tugma matni',
  tg_channel: 'Telegram kanal (@ siz)',
  support_username: 'Yordam akkaunti (@ siz)',
  reviews_count: 'Mijozlar soni',
};

const LONG = new Set(['hero_sub', 'hero_title']);

export default function SettingsForm({ values }: { values: Record<string, string> }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState(values);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const dirty = Object.keys(draft).some((k) => draft[k] !== values[k]);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const changed = Object.fromEntries(
        Object.entries(draft).filter(([k, v]) => v !== values[k]),
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
        text: `${data.updated} maydon saqlandi · ${data.cache?.cf ? 'Cloudflare tozalandi' : 'ISR tozalandi'}`,
      });
      startTransition(() => router.refresh());
    } catch (err) {
      setMsg({ kind: 'err', text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Sayt matnlari</span>
        <button className="a-btn p sm" disabled={!dirty || busy} onClick={save}>
          {busy ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>
      <div className="a-panel-b">
        {msg && (
          <div className={msg.kind === 'ok' ? 'a-ok' : 'a-err'} style={{ marginBottom: 14 }}>
            {msg.text}
          </div>
        )}

        <div style={{ display: 'grid', gap: 14, maxWidth: 620 }}>
          {Object.keys(LABELS).map((k) => (
            <div key={k}>
              <label className="a-lbl" htmlFor={k}>
                {LABELS[k]} <code style={{ color: '#3f4a5c' }}>{k}</code>
              </label>
              {LONG.has(k) ? (
                <textarea
                  id={k}
                  className="a-in"
                  rows={3}
                  style={{ resize: 'vertical', lineHeight: 1.55 }}
                  value={draft[k] ?? ''}
                  disabled={busy}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                />
              ) : (
                <input
                  id={k}
                  className="a-in"
                  value={draft[k] ?? ''}
                  disabled={busy}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12.5, color: '#59637a', marginTop: 16, lineHeight: 1.6 }}>
          Saqlangach yettala kadr (<code>/</code>, <code>/2</code>…<code>/7</code>) qayta build
          bo’ladi va Cloudflare keshi tozalanadi — o’zgarish ~5 sekundda ko’rinadi. Narx va bot
          havolasi hamma sahifada bir vaqtda yangilanadi.
          <br />
          Bot maydoniga <code>@Bot</code>, <code>Bot</code> yoki to’liq
          <code> https://t.me/Bot</code> — uchalasi ham ishlaydi.
        </p>
      </div>
    </div>
  );
}
