'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { LANDING_PAGES } from '@/lib/pages';

/**
 * ATAYIN faqat ikki maydon: narx va bot manzili — ikkalasi SAKKIZALA
 * kadrga birdek tegadi. Qolgan matn sozlamalari (sarlavha, tavsif, tugma
 * matni va h.k.) bazada turaveradi va sahifalar ularni o'qiyveradi, lekin
 * formadan olib tashlangan: kunlik ishda faqat shu ikkisi o'zgaradi,
 * qolganini tasodifan buzib qo'yish xavfi bor edi.
 */
const LABELS: Record<string, string> = {
  price_one_vote: '1 ovoz narxi — hamma sahifada o‘zgaradi',
  bot_username: 'Bot havolasi — tugma bosilganda shu manzilga o‘tadi',
};

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
        <span>Narx va bot</span>
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
              <input
                id={k}
                className="a-in"
                value={draft[k] ?? ''}
                disabled={busy}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12.5, color: '#59637a', marginTop: 16, lineHeight: 1.6 }}>
          Saqlangach barcha {LANDING_PAGES.length} ta kadr qayta build bo’ladi — o’zgarish
          bir necha sekundda hamma sahifada ko’rinadi.
          <br />
          Bot maydoniga <code>@Bot</code>, <code>Bot</code> yoki to’liq
          <code> https://t.me/Bot</code> — uchalasi ham ishlaydi.
          <br />
          <br />
          <b style={{ color: '#c7d0de' }}>Havolada <code>?start=…</code> bo’lsa</b> — masalan
          <code> https://t.me/Bot?start=abu1</code> — hamma kadr AYNAN shu kod bilan botga
          boradi, ustiga hech narsa qo’shilmaydi. Bot o’sha kod bo’yicha nechta odam
          kelganini sanaydi. Kodni o’zgartirsangiz hamma sahifada birdan o’zgaradi.
          <br />
          <code>?start=</code> yozilmasa — har kadr o’z belgisini yuboradi
          (<code>p1</code>…<code>p9</code>) va ustiga trafik manbasi qo’shiladi
          (<code>p6-instagram</code>).
          <br />
          Admin paneldagi «qaysi kadrdan qancha odam keldi» jadvali ikkala holatda
          ham to’liq ishlaydi — u boshqa manbadan hisoblanadi.
        </p>
      </div>
    </div>
  );
}
