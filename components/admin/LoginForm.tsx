'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ next = '/admin' }: { next?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr('');
    setBusy(true);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setErr(data.error || 'Kirish amalga oshmadi');
        setBusy(false);
        return;
      }
      router.replace(next.startsWith('/admin') ? next : '/admin');
      router.refresh();
    } catch {
      setErr('Tarmoq xatosi');
      setBusy(false);
    }
  }

  return (
    <form className="a-f" onSubmit={onSubmit}>
      {err && <div className="a-err">{err}</div>}

      <div>
        <label className="a-lbl" htmlFor="u">
          Login
        </label>
        <input
          className="a-in"
          id="u"
          name="username"
          autoComplete="username"
          required
          autoFocus
          disabled={busy}
        />
      </div>

      <div>
        <label className="a-lbl" htmlFor="p">
          Parol
        </label>
        <input
          className="a-in"
          id="p"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={busy}
        />
      </div>

      <button className="a-btn p" type="submit" disabled={busy} style={{ justifyContent: 'center' }}>
        {busy ? 'Tekshirilmoqda…' : 'Kirish'}
      </button>
    </form>
  );
}
