'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export type Row = {
  id: string;
  sku: string;
  title: string;
  amount: number;
  priceUzs: number;
  oldPriceUzs: number | null;
  badge: string | null;
  order: number;
  active: boolean;
  updatedAt: string;
};

type Draft = Partial<Pick<Row, 'title' | 'amount' | 'priceUzs' | 'oldPriceUzs' | 'badge' | 'order' | 'active'>>;

export default function PriceTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const edit = (id: string, patch: Draft) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  async function call(init: RequestInit & { method: string }, url = '/api/admin/prices') {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data as { cache?: { cf: boolean } };
  }

  async function save(row: Row) {
    const patch = drafts[row.id];
    if (!patch) return;
    setBusy(row.id);
    setMsg(null);
    try {
      const data = await call({ method: 'PATCH', body: JSON.stringify({ id: row.id, ...patch }) });
      setDrafts((d) => {
        const next = { ...d };
        delete next[row.id];
        return next;
      });
      setMsg({
        kind: 'ok',
        text: data.cache?.cf
          ? `${row.sku} saqlandi · ISR + Cloudflare tozalandi`
          : `${row.sku} saqlandi · ISR tozalandi (CF tokeni yo’q)`,
      });
      startTransition(() => router.refresh());
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function toggle(row: Row, active: boolean) {
    setBusy(row.id);
    try {
      await call({ method: 'PATCH', body: JSON.stringify({ id: row.id, active }) });
      setMsg({ kind: 'ok', text: `${row.sku} — ${active ? 'yoqildi' : 'o’chirildi'}` });
      startTransition(() => router.refresh());
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function remove(row: Row) {
    if (!confirm(`${row.sku} o’chirilsinmi? Bu amalni qaytarib bo’lmaydi.`)) return;
    setBusy(row.id);
    try {
      await call({ method: 'DELETE' }, `/api/admin/prices?id=${encodeURIComponent(row.id)}`);
      setMsg({ kind: 'ok', text: `${row.sku} o’chirildi` });
      startTransition(() => router.refresh());
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  const val = <K extends keyof Draft>(row: Row, k: K): Row[K & keyof Row] =>
    (drafts[row.id]?.[k] ?? row[k as keyof Row]) as Row[K & keyof Row];

  return (
    <>
      {msg && (
        <div className={msg.kind === 'ok' ? 'a-ok' : 'a-err'} style={{ marginBottom: 14 }}>
          {msg.text}
        </div>
      )}

      <div className="a-panel">
        <div className="a-panel-h">
          <span>Narxlar ({rows.length})</span>
          <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
            Saqlangach landing ~5 sekundda yangilanadi
          </span>
        </div>

        <div className="a-tw">
          <table className="a-t">
            <thead>
              <tr>
                <th>Faol</th>
                <th>SKU</th>
                <th>Nomi</th>
                <th className="num">Hajm</th>
                <th className="num">Narx (so’m)</th>
                <th className="num">Eski narx</th>
                <th>Badge</th>
                <th className="num">Tartib</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const dirty = Boolean(drafts[r.id]);
                const rowBusy = busy === r.id || pending;
                return (
                  <tr key={r.id}>
                    <td>
                      <label className="a-sw">
                        <input
                          type="checkbox"
                          checked={r.active}
                          disabled={rowBusy}
                          onChange={(e) => toggle(r, e.target.checked)}
                        />
                        <span />
                      </label>
                    </td>
                    <td>
                      <code style={{ fontSize: 12.5, color: '#7fd0f7' }}>{r.sku}</code>
                    </td>
                    <td>
                      <input
                        className="a-in"
                        style={{ minWidth: 130 }}
                        value={String(val(r, 'title'))}
                        disabled={rowBusy}
                        onChange={(e) => edit(r.id, { title: e.target.value })}
                      />
                    </td>
                    <td className="num">
                      <input
                        className="a-in w4"
                        type="number"
                        min={1}
                        value={Number(val(r, 'amount'))}
                        disabled={rowBusy}
                        onChange={(e) => edit(r.id, { amount: Number(e.target.value) })}
                      />
                    </td>
                    <td className="num">
                      <input
                        className="a-in w6"
                        type="number"
                        min={1}
                        step={100}
                        value={Number(val(r, 'priceUzs'))}
                        disabled={rowBusy}
                        onChange={(e) => edit(r.id, { priceUzs: Number(e.target.value) })}
                      />
                    </td>
                    <td className="num">
                      <input
                        className="a-in w6"
                        type="number"
                        min={0}
                        step={100}
                        placeholder="—"
                        value={(val(r, 'oldPriceUzs') as number | null) ?? ''}
                        disabled={rowBusy}
                        onChange={(e) =>
                          edit(r.id, {
                            oldPriceUzs: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="a-in"
                        style={{ minWidth: 100 }}
                        placeholder="—"
                        value={(val(r, 'badge') as string | null) ?? ''}
                        disabled={rowBusy}
                        onChange={(e) => edit(r.id, { badge: e.target.value })}
                      />
                    </td>
                    <td className="num">
                      <input
                        className="a-in w4"
                        type="number"
                        value={Number(val(r, 'order'))}
                        disabled={rowBusy}
                        onChange={(e) => edit(r.id, { order: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className={dirty ? 'a-btn p sm' : 'a-btn sm'}
                          disabled={!dirty || rowBusy}
                          onClick={() => save(r)}
                        >
                          {busy === r.id ? '…' : 'Saqlash'}
                        </button>
                        <button className="a-btn d sm" disabled={rowBusy} onClick={() => remove(r)}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!rows.length && <div className="a-empty">Narx qo’shilmagan. Pastdagi formadan boshlang.</div>}
      </div>

      <NewPrice
        onDone={(text) => {
          setMsg({ kind: 'ok', text });
          startTransition(() => router.refresh());
        }}
        onError={(text) => setMsg({ kind: 'err', text })}
      />
    </>
  );
}

function NewPrice({
  onDone,
  onError,
}: {
  onDone: (t: string) => void;
  onError: (t: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      const res = await fetch('/api/admin/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: fd.get('sku'),
          title: fd.get('title'),
          amount: Number(fd.get('amount')),
          priceUzs: Number(fd.get('priceUzs')),
          oldPriceUzs: fd.get('oldPriceUzs') ? Number(fd.get('oldPriceUzs')) : null,
          badge: fd.get('badge') || null,
          order: Number(fd.get('order') || 0),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      form.reset();
      onDone(`${data.price.sku} qo’shildi`);
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-panel">
      <div className="a-panel-h">Yangi paket</div>
      <div className="a-panel-b">
        <form
          onSubmit={submit}
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}
        >
          <div>
            <label className="a-lbl">SKU</label>
            <input className="a-in" name="sku" placeholder="ovoz_10" required disabled={busy} />
          </div>
          <div>
            <label className="a-lbl">Nomi</label>
            <input className="a-in" name="title" placeholder="10 ovoz" required disabled={busy} />
          </div>
          <div>
            <label className="a-lbl">Hajm</label>
            <input className="a-in w4" name="amount" type="number" min={1} required disabled={busy} />
          </div>
          <div>
            <label className="a-lbl">Narx</label>
            <input className="a-in w6" name="priceUzs" type="number" min={1} required disabled={busy} />
          </div>
          <div>
            <label className="a-lbl">Eski narx</label>
            <input className="a-in w6" name="oldPriceUzs" type="number" min={0} disabled={busy} />
          </div>
          <div>
            <label className="a-lbl">Badge</label>
            <input className="a-in" name="badge" placeholder="Ommabop" disabled={busy} />
          </div>
          <div>
            <label className="a-lbl">Tartib</label>
            <input className="a-in w4" name="order" type="number" defaultValue={0} disabled={busy} />
          </div>
          <button className="a-btn p" type="submit" disabled={busy}>
            {busy ? 'Qo’shilmoqda…' : 'Qo’shish'}
          </button>
        </form>
        <p style={{ fontSize: 12.5, color: '#59637a', marginTop: 12, lineHeight: 1.6 }}>
          SKU prefiksi tabni belgilaydi: <code>ovoz_*</code> → Ovoz paketlari,{' '}
          <code>xizmat_*</code> → Qo’shimcha xizmatlar.
        </p>
      </div>
    </div>
  );
}
