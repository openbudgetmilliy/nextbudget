'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Bitta narx maydoni.
 *
 * Landing matnlarida `{narx}` o'rin egallovchisi turadi — shu yerda kiritilgan
 * qiymat render paytida o'sha joylarga qo'yiladi. Ya'ni narx bitta joyda
 * o'zgaradi, hero sarlavhasi va tavsifini qo'lda tahrirlash shart emas.
 *
 * Saqlash `/api/admin/settings` orqali (u ISR + Cloudflare purge ni o'zi qiladi).
 */
export default function PriceForm({ value }: { value: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const dirty = draft.trim() !== value;

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_one_vote: draft.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setMsg({
        kind: 'ok',
        text: `Saqlandi · ${data.cache?.cf ? 'Cloudflare tozalandi' : 'ISR tozalandi'}`,
      });
      router.refresh();
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>1 ovoz narxi</span>
        <span style={{ fontSize: 12.5, fontWeight: 400, color: '#6f7b8f' }}>
          Saqlangach landing ~5 sekundda yangilanadi
        </span>
      </div>

      <div className="a-panel-b">
        <div className="a-f" style={{ maxWidth: 320 }}>
          <div>
            <label className="a-lbl" htmlFor="p1">
              Narx (so’m)
            </label>
            <input
              className="a-in"
              id="p1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="30 000"
              disabled={busy}
              inputMode="numeric"
            />
          </div>

          <button className="a-btn p" onClick={save} disabled={!dirty || busy}>
            {busy ? 'Saqlanmoqda…' : 'Saqlash'}
          </button>

          {msg && (
            <div className={msg.kind === 'ok' ? 'a-ok' : 'a-err'}>{msg.text}</div>
          )}
        </div>

        <p style={{ marginTop: 22, fontSize: 12.5, lineHeight: 1.7, color: '#6f7b8f' }}>
          Bu qiymat landingdagi <code>{'{narx}'}</code> o’rniga qo’yiladi — hozircha hero
          sarlavhasida va tavsifida. Matnlarning o’zini{' '}
          <a href="/admin/settings" style={{ color: '#2aabee' }}>
            Sozlamalar
          </a>{' '}
          bo’limidan tahrirlaysiz; <code>{'{narx}'}</code> ni qoldirsangiz narx avtomatik
          qo’yiladi.
        </p>
      </div>
    </div>
  );
}
