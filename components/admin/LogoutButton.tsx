'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      className="a-btn sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
        router.replace('/admin/login');
        router.refresh();
      }}
    >
      Chiqish
    </button>
  );
}
