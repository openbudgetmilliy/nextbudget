'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/prices', label: 'Narx' },
  { href: '/admin/reklama', label: 'Reklama' },
  { href: '/admin/analytics', label: 'Analitika' },
  { href: '/admin/sessions', label: 'Sessiyalar' },
  { href: '/admin/settings', label: 'Sozlamalar' },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="a-nav">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? 'page' : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
