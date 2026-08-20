import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { SITE } from '@/lib/content';
import AdminNav from '@/components/admin/AdminNav';
import LogoutButton from '@/components/admin/LogoutButton';

/** Admin sahifalari hech qachon cache'lanmaydi */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  // Middleware allaqachon tekshiradi — bu ikkinchi qatlam (defense in depth)
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div className="a-shell">
      <header className="a-top">
        <div className="a-top-in">
          <span className="a-brand">
            <img className="a-mark" src="/logo-mark.webp" alt="" width={26} height={26} />
            <span className="a-domain">{SITE.domain}</span>
          </span>
          <AdminNav />
          <a
            className="a-btn sm"
            href="/"
            target="_blank"
            rel="noopener"
            style={{ marginLeft: 'auto' }}
          >
            Saytni ko’rish ↗
          </a>
          <LogoutButton />
        </div>
      </header>

      <main className="a-main">{children}</main>
    </div>
  );
}
